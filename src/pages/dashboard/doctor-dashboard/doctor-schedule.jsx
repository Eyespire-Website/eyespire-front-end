"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Stethoscope,
    User,
    CheckCircle,
    Phone,
    X,
    CalendarDays,
    Search
} from "lucide-react";
import authService from "../../../services/authService";
import userService from "../../../services/userService";
import adminService from "../../../services/adminService";
import "./doctor-schedule.css";
import "./doctor-appointments-unified.css";

export default function DoctorSchedule() {
    const [viewMode, setViewMode] = useState("week"); // week, day
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [doctor, setDoctor] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [moreAppointments, setMoreAppointments] = useState([]);
    const navigate = useNavigate();

    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    const MAX_VISIBLE_SERVICES = 1; // Limit to 1 service to prevent overflow

    // Load doctor info and initial data
    useEffect(() => {
        const fetchDoctorInfo = async () => {
            try {
                setLoading(true);
                const user = authService.getCurrentUser();
                if (!user || !user.id) {
                    throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
                }
                const doctorData = await userService.getDoctorByUserId();
                if (!doctorData) {
                    throw new Error("Bạn không phải là bác sĩ hoặc thông tin bác sĩ chưa được thiết lập.");
                }
                setDoctor({
                    id: doctorData.id,
                    name: doctorData.name || user.name,
                    color: "#3b82f6",
                    specialization: doctorData.specialization || "",
                    qualification: doctorData.qualification || "",
                    experience: doctorData.experience || "",
                    description: doctorData.description || "",
                    specialtyId: doctorData.specialtyId || null
                });
            } catch (err) {
                console.error("Error loading doctor info:", err);
                setError(err.message || "Không thể tải thông tin bác sĩ. Vui lòng đăng nhập lại.");
                toast.error(err.message || "Không thể tải thông tin bác sĩ. Vui lòng đăng nhập lại.");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorInfo();
    }, [navigate]);

    // Load appointments and availabilities when selectedDate, viewMode, or doctor changes
    useEffect(() => {
        if (doctor && (viewMode === "week" || viewMode === "day")) {
            if (viewMode === "week") {
                loadWeekData();
            } else {
                loadDayData();
            }
        }
    }, [selectedDate, viewMode, doctor]);

    const loadDayData = async () => {
        try {
            setLoading(true);
            const appointmentsData = await adminService.getAppointmentsByDoctorAndDate(doctor.id, selectedDate);
            const normalizedAppointments = appointmentsData.map((apt, index) => ({
                id: apt.id || index + 1,
                time: apt.timeSlot || "09:00",
                date: apt.appointmentDate || selectedDate,
                duration: apt.services?.[0]?.duration || "60",
                doctorId: apt.doctorId || doctor.id,
                patient: apt.patientName || "Bệnh nhân",
                services: apt.services || [{ id: null, name: "Khám tổng quát" }],
                status: apt.status?.toLowerCase() || "pending",
                phone: apt.patientPhone || "0123456789",
            })).filter(apt => ["confirmed", "waiting_payment", "completed"].includes(apt.status));
            setAppointments(normalizedAppointments);
            const availabilityData = await adminService.getDoctorAvailability(doctor.id, selectedDate);
            setAvailabilities(availabilityData);
        } catch (err) {
            console.error("Error loading day data:", err);
            toast.error("Lỗi khi tải dữ liệu ngày");
            setAppointments([]);
            setAvailabilities([]);
        } finally {
            setLoading(false);
        }
    };

    const loadWeekData = async () => {
        try {
            setLoading(true);
            const weekDays = getWeekDays(currentDate);
            const dateStrings = weekDays.map(day => formatDate(day));
            const [appointmentsData, availabilityData] = await Promise.all([
                Promise.all(dateStrings.map(date => adminService.getAppointmentsByDoctorAndDate(doctor.id, date))),
                Promise.all(dateStrings.map(date => adminService.getDoctorAvailability(doctor.id, date)))
            ]);
            const normalizedAppointments = appointmentsData.flat().map((apt, index) => ({
                id: apt.id || index + 1,
                time: apt.timeSlot || "09:00",
                date: apt.appointmentDate || apt.date,
                duration: apt.services?.[0]?.duration || "60",
                doctorId: apt.doctorId || doctor.id,
                patient: apt.patientName || "Bệnh nhân",
                services: apt.services || [{ id: null, name: "Khám tổng quát" }],
                status: apt.status?.toLowerCase() || "pending",
                phone: apt.patientPhone || "0123456789",
            })).filter(apt => ["confirmed", "waiting_payment", "completed"].includes(apt.status));
            setAppointments(normalizedAppointments);
            setAvailabilities(availabilityData.flat());
        } catch (err) {
            console.error("Error loading week data:", err);
            toast.error("Lỗi khi tải dữ liệu tuần");
            setAppointments([]);
            setAvailabilities([]);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDays = (date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day);
        }
        return week;
    };

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    const getAppointmentsForDateTime = (date, time) => {
        if (!date) return [];
        const dateStr = formatDate(date);
        return appointments.filter((apt) => {
            if (!apt || !apt.time || !apt.date || !apt.duration) {
                console.warn("Invalid appointment object:", apt);
                return false;
            }
            const duration = Number.parseInt(apt.duration);
            if (isNaN(duration) || duration <= 0) {
                console.warn("Invalid duration for appointment:", apt);
                return false;
            }
            const aptEndTime = addMinutesToTime(apt.time, duration);
            return apt.date === dateStr && time >= apt.time && time < aptEndTime;
        });
    };

    const addMinutesToTime = (time, minutes) => {
        if (!time || typeof time !== "string") return "00:00";
        const timeParts = time.split(":");
        if (timeParts.length !== 2) return "00:00";
        const [hours, mins] = timeParts.map(Number);
        if (isNaN(hours) || isNaN(mins)) return "00:00";
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
    };

    const navigateWeek = (direction) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + direction * 7);
            setSelectedDate(formatDate(newDate));
            return newDate;
        });
    };

    const navigateDay = (direction) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + direction);
            setSelectedDate(formatDate(newDate));
            return newDate;
        });
    };

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setSelectedDate(e.target.value);
        setCurrentDate(newDate);
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getStatusText = (status) => {
        switch (status) {
            case "confirmed":
                return "Đã xác nhận";
            case "waiting_payment":
                return "Chờ thanh toán";
            case "completed":
                return "Hoàn thành";
            default:
                return status;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "confirmed":
                return <CheckCircle size={16} />;
            case "waiting_payment":
                return <Clock size={16} />;
            case "completed":
                return <CheckCircle size={16} />;
            default:
                return null;
        }
    };

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setModalType("viewAppointment");
        setModalOpen(true);
    };

    const handleShowMoreAppointments = (appointments) => {
        setMoreAppointments(appointments);
        setModalType("moreAppointments");
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setTimeout(() => {
            setModalType(null);
            if (modalType === "viewAppointment") {
                setSelectedAppointment(null);
            } else if (modalType === "moreAppointments") {
                setMoreAppointments([]);
            }
        }, 200);
    };

    const isTimeAvailable = (date, time) => {
        const dateStr = formatDate(date);
        const availability = availabilities.find(avail =>
            avail.date === dateStr &&
            parseInt(avail.startTime.split(':')[0]) <= parseInt(time.split(':')[0]) &&
            parseInt(avail.endTime.split(':')[0]) > parseInt(time.split(':')[0]) &&
            avail.status === "AVAILABLE"
        );
        return !!availability;
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate);
        const MAX_VISIBLE_APPOINTMENTS = 1;

        return (
            <div className="d-week-view">
                <div className="d-week-header">
                    <div className="d-time-column-header">Giờ</div>
                    {weekDays.map((day, index) => (
                        <div key={index} className={`d-day-header ${isToday(day) ? "today" : ""}`}>
                            <div className="d-day-name">{dayNames[index]}</div>
                            <div className="d-day-date">{day.getDate()}/{day.getMonth() + 1}</div>
                        </div>
                    ))}
                </div>
                <div className="d-week-body">
                    {timeSlots.map((time) => (
                        <div key={time} className="d-time-row">
                            <div className="d-time-label">{time}</div>
                            {weekDays.map((day, dayIndex) => {
                                const dayAppointments = getAppointmentsForDateTime(day, time);

                                if (dayAppointments.length > 0) {
                                    return (
                                        <div key={dayIndex} className="d-time-cell">
                                            <div className="d-appointment-group">
                                                {dayAppointments.slice(0, MAX_VISIBLE_APPOINTMENTS).map((apt) => (
                                                    <div
                                                        key={apt.id}
                                                        className={`d-appointment-block ${apt.status}`}
                                                        style={{
                                                            backgroundColor:
                                                                apt.status === "confirmed" ? "#d1fae5" :
                                                                    apt.status === "waiting_payment" ? "#fef3c7" :
                                                                        "#e5e7eb",
                                                            borderLeft:
                                                                "4px solid " +
                                                                (apt.status === "confirmed" ? "#10b981" :
                                                                    apt.status === "waiting_payment" ? "#f59e0b" :
                                                                        "#6b7280"),
                                                            height: `${apt.duration}px`,
                                                        }}
                                                        onClick={() => handleViewAppointment(apt)}
                                                    >
                                                        <div className="d-apt-services">
                                                            {apt.services.length > 0 ? (
                                                                <>
                                                                    <ul className="d-appointment-services-list">
                                                                        {apt.services.slice(0, MAX_VISIBLE_SERVICES).map((service) => (
                                                                            <li
                                                                                key={service.id || `service-${Math.random()}`}
                                                                                className="d-appointment-service-item"
                                                                            >
                                                                                {service.name || `Dịch vụ ID: ${service.id || "N/A"}`}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    {apt.services.length > MAX_VISIBLE_SERVICES && (
                                                                        <span
                                                                            className="d-more-services"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleViewAppointment(apt);
                                                                            }}
                                                                        >
                                                                            +{apt.services.length - MAX_VISIBLE_SERVICES} dịch vụ
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span>Chưa có dịch vụ được chọn</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayAppointments.length > MAX_VISIBLE_APPOINTMENTS && (
                                                    <div
                                                        className="d-appointment-block more"
                                                        style={{
                                                            height: `${dayAppointments[0].duration || 60}px`,
                                                            backgroundColor: "#e2e8f0",
                                                            borderLeft: "4px solid #64748b",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 600,
                                                            color: "#1e293b",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => handleShowMoreAppointments(dayAppointments)}
                                                    >
                                                        +{dayAppointments.length - MAX_VISIBLE_APPOINTMENTS}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                } else if (isTimeAvailable(day, time)) {
                                    return (
                                        <div key={dayIndex} className="d-time-cell">
                                            <div className="d-empty-slot no-appointment">Chưa có lịch hẹn</div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div key={dayIndex} className="d-time-cell">
                                            <div className="d-empty-slot trong"></div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayAppointments = appointments
            .filter((apt) => apt.date === formatDate(currentDate))
            .sort((a, b) => a.time.localeCompare(b.time));
        const dayAvailabilities = availabilities
            .filter((avail) => avail.date === formatDate(currentDate))
            .sort((a, b) => a.startTime.localeCompare(b.time));

        return (
            <div className="d-day-view">
                <div className="d-day-header-single">
                    <h3>
                        {dayNames[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]} - {currentDate.getDate()}/
                        {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                    </h3>
                </div>
                <div className="d-day-schedule">
                    {timeSlots.map((time) => {
                        const timeAppointments = dayAppointments.filter((apt) => apt.time === time);
                        const timeAvailabilities = dayAvailabilities.filter(
                            (avail) => parseInt(avail.startTime.split(':')[0]) <= parseInt(time.split(':')[0]) &&
                                parseInt(avail.endTime.split(':')[0]) > parseInt(time.split(':')[0]) &&
                                avail.status === "AVAILABLE"
                        );

                        if (timeAppointments.length > 0) {
                            return (
                                <div key={time} className="d-day-time-slot">
                                    <div className="d-day-time-label">{time}</div>
                                    <div className="d-day-time-content">
                                        {timeAppointments.map((apt) => (
                                            <div
                                                key={apt.id}
                                                className={`d-day-appointment ${apt.status}`}
                                                style={{
                                                    borderLeft:
                                                        "4px solid " +
                                                        (apt.status === "confirmed" ? "#10b981" :
                                                            apt.status === "waiting_payment" ? "#f59e0b" :
                                                                "#6b7280"),
                                                    backgroundColor:
                                                        apt.status === "confirmed" ? "#d1fae5" :
                                                            apt.status === "waiting_payment" ? "#fef3c7" :
                                                                "#e5e7eb",
                                                }}
                                                onClick={() => handleViewAppointment(apt)}
                                            >
                                                <div className="d-day-apt-services">
                                                    {apt.services.length > 0 ? (
                                                        <>
                                                            <ul className="d-appointment-services-list">
                                                                {apt.services.slice(0, MAX_VISIBLE_SERVICES).map((service) => (
                                                                    <li
                                                                        key={service.id || `service-${Math.random()}`}
                                                                        className="d-appointment-service-item"
                                                                    >
                                                                        {service.name || `Dịch vụ ID: ${service.id || "N/A"}`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {apt.services.length > MAX_VISIBLE_SERVICES && (
                                                                <span
                                                                    className="d-more-services"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewAppointment(apt);
                                                                    }}
                                                                >
                                                                    +{apt.services.length - MAX_VISIBLE_SERVICES} dịch vụ
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span>Chưa có dịch vụ được chọn</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        } else if (timeAvailabilities.length > 0) {
                            return (
                                <div key={time} className="d-day-time-slot">
                                    <div className="d-day-time-label">{time}</div>
                                    <div className="d-day-time-content">
                                        <div className="d-empty-slot no-appointment">Chưa có lịch hẹn</div>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={time} className="d-day-time-slot">
                                    <div className="d-day-time-label">{time}</div>
                                    <div className="d-day-time-content">
                                        <div className="d-empty-slot trong"></div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="doctor-appointments-content">
            {/* Header with search */}
            <div className="doctor-appointments-content__header">
                <div className="doctor-appointments-content__header-content">
                    <div className="doctor-appointments-content__title-section">
                        <CalendarDays className="doctor-appointments-content__title-icon" />
                        <h1 className="doctor-appointments-content__title">Lịch làm việc</h1>
                    </div>
                    <div className="doctor-appointments-content__search-container">
                        <div className="doctor-appointments-content__search-wrapper">
                            <Search className="doctor-appointments-content__search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm lịch hẹn..."
                                className="doctor-appointments-content__search-input"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {loading && <div className="loading">Đang tải...</div>}
            {error && <div className="error-message text-red-500">{error}</div>}
            {!loading && !error && doctor && (
                <div className="d-card bg-white shadow rounded-lg overflow-hidden">
                    <div className="d-card-hdr p-6 border-b">
                        <div className="d-schedule-controls flex justify-between items-center">
                            <div className="d-view-controls flex gap-2">
                                <button
                                    className={`d-btn px-4 py-2 rounded ${viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                    onClick={() => setViewMode("day")}
                                    disabled={loading}
                                >
                                    Ngày
                                </button>
                                <button
                                    className={`d-btn px-4 py-2 rounded ${viewMode === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                    onClick={() => setViewMode("week")}
                                    disabled={loading}
                                >
                                    Tuần
                                </button>
                            </div>
                            <div className="d-date-navigation flex items-center gap-2">
                                <button
                                    className="d-btn bg-gray-200 p-2 rounded"
                                    onClick={() => (viewMode === "week" ? navigateWeek(-1) : navigateDay(-1))}
                                    disabled={loading}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <input
                                    type="date"
                                    className="d-date-picker border rounded p-2"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    disabled={loading}
                                />
                                <button
                                    className="d-btn bg-gray-200 p-2 rounded"
                                    onClick={() => (viewMode === "week" ? navigateWeek(1) : navigateDay(1))}
                                    disabled={loading}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="d-card-content p-6">
                        {viewMode === "week" ? renderWeekView() : renderDayView()}
                    </div>
                </div>
            )}
            {modalOpen && (
                <div className="d-modal-overlay" onClick={handleCloseModal}>
                    <div className="d-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="d-modal-header">
                            <h3>
                                {modalType === "viewAppointment" && (
                                    <>
                                        <Calendar className="icon" style={{ marginRight: "8px" }} />
                                        Chi tiết lịch hẹn
                                    </>
                                )}
                                {modalType === "moreAppointments" && (
                                    <>
                                        <Calendar className="icon" style={{ marginRight: "8px" }} />
                                        Lịch hẹn cùng thời điểm
                                    </>
                                )}
                            </h3>
                            <button className="d-close-btn" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="d-modal-content">
                            {modalType === "viewAppointment" && selectedAppointment && (
                                <div className="d-appointment-details">
                                    <div className="d-appointment-status-banner" style={{ backgroundColor: "#3b82f620" }}>
                                        <div className="d-status-icon">
                                            {getStatusIcon(selectedAppointment.status)}
                                        </div>
                                        <div className="d-status-text">
                                            {getStatusText(selectedAppointment.status)}
                                        </div>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><User size={16} /> Bệnh nhân:</span>
                                        <span className="d-detail-value">{selectedAppointment.patient}</span>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><Stethoscope size={16} /> Bác sĩ:</span>
                                        <span className="d-detail-value" style={{ color: "#3b82f6" }}>
                                            {doctor.name}
                                        </span>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><CheckCircle size={16} /> Dịch vụ:</span>
                                        <span className="d-detail-value">
                                            {selectedAppointment.services.length > 0 ? (
                                                <ul className="d-appointment-services-list">
                                                    {selectedAppointment.services.map((service) => (
                                                        <li
                                                            key={service.id || `service-${Math.random()}`}
                                                            className="d-appointment-service-item"
                                                        >
                                                            {service.name || `Dịch vụ ID: ${service.id || "N/A"}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                "Chưa có dịch vụ được chọn"
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><Calendar size={16} /> Ngày:</span>
                                        <span className="d-detail-value">{formatDate(new Date(selectedAppointment.date))}</span>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><Clock size={16} /> Giờ:</span>
                                        <span className="d-detail-value">{selectedAppointment.time}</span>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><Clock size={16} /> Thời lượng:</span>
                                        <span className="d-detail-value">{selectedAppointment.duration} phút</span>
                                    </div>
                                    <div className="d-detail-row">
                                        <span className="d-detail-label"><Phone size={16} /> Số điện thoại:</span>
                                        <span className="d-detail-value">{selectedAppointment.phone}</span>
                                    </div>
                                </div>
                            )}
                            {modalType === "moreAppointments" && moreAppointments.length > 0 && (
                                <div className="d-appointments-list">
                                    {moreAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="d-appointment-item"
                                            style={{ borderLeftColor: "#3b82f6" }}
                                        >
                                            <div className="d-appointment-header">
                                                <div className="d-appointment-time">
                                                    <Clock size={16} style={{ color: "#4b5563" }} />
                                                    <span>{appointment.time}</span>
                                                </div>
                                                <div
                                                    className="d-appointment-status"
                                                    style={{
                                                        color:
                                                            appointment.status === "confirmed" ? "#10b981" :
                                                                appointment.status === "waiting_payment" ? "#f59e0b" :
                                                                    "#6b7280"
                                                    }}
                                                >
                                                    {getStatusIcon(appointment.status)}
                                                    <span>{getStatusText(appointment.status)}</span>
                                                </div>
                                            </div>
                                            <div className="d-appointment-doctor" style={{ color: "#3b82f6" }}>
                                                <Stethoscope size={16} />
                                                <span>{doctor.name}</span>
                                            </div>
                                            <div className="d-appointment-patient">
                                                <User size={16} />
                                                <span>{appointment.patient}</span>
                                            </div>
                                            <div className="d-appointment-service">
                                                <CheckCircle size={16} style={{ color: "#4b5563" }} />
                                                <span>
                                                    {appointment.services.length > 0 ? (
                                                        <ul className="d-appointment-services-list">
                                                            {appointment.services.map((service) => (
                                                                <li
                                                                    key={service.id || `service-${Math.random()}`}
                                                                    className="d-appointment-service-item"
                                                                >
                                                                    {service.name || `Dịch vụ ID: ${service.id || "N/A"}`}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        "Chưa có dịch vụ được chọn"
                                                    )}
                                                </span>
                                            </div>
                                            <div className="d-appointment-phone">
                                                <Phone size={16} style={{ color: "#4b5563" }} />
                                                <span>{appointment.phone}</span>
                                            </div>
                                            <button
                                                className="d-btn d-btn-primary"
                                                onClick={() => {
                                                    setSelectedAppointment(appointment);
                                                    setModalType("viewAppointment");
                                                }}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="d-modal-footer">
                            <button className="d-btn d-btn-secondary" onClick={handleCloseModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}