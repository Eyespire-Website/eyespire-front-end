import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import appointmentService from "../../../../services/appointmentService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/appointmentsPatient.css';
import { Calendar, Package, FileText, History, User, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function AppointmentsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedAppointments, setExpandedAppointments] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            setUser(currentUser);
            
            // Lấy danh sách cuộc hẹn của bệnh nhân
            await fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            navigate('/login');
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Lấy danh sách cuộc hẹn
            const data = await appointmentService.getPatientAppointments();
            
            // Debug: Kiểm tra cấu trúc dữ liệu
            console.log("Raw appointments data:", JSON.stringify(data, null, 2));
            
            // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
            const formattedAppointments = data.map(appointment => {
                const appointmentDate = new Date(appointment.appointmentTime);
                
                // Debug: Kiểm tra từng appointment
                console.log("Processing appointment:", appointment);
                
                // Xử lý tên dịch vụ - thử nhiều cách tiếp cận khác nhau
                let serviceName = "Tư vấn & Điều trị";
                
                // Kiểm tra tất cả các trường có thể chứa thông tin dịch vụ
                if (appointment.service && appointment.service.name) {
                    serviceName = appointment.service.name;
                } else if (appointment.service && typeof appointment.service === 'string') {
                    serviceName = appointment.service;
                } else if (appointment.medicalService && appointment.medicalService.name) {
                    serviceName = appointment.medicalService.name;
                } else if (appointment.serviceName) {
                    serviceName = appointment.serviceName;
                }
                
                // Ánh xạ ID dịch vụ sang tên cố định (tạm thởi)
                if (appointment.serviceId === 1 || appointment.service_id === 1) {
                    serviceName = "Khám mắt tổng quát";
                } else if (appointment.serviceId === 2 || appointment.service_id === 2) {
                    serviceName = "Đo khúc xạ";
                } else if (appointment.serviceId === 3 || appointment.service_id === 3) {
                    serviceName = "Khám & điều trị bệnh về mắt";
                }
                
                return {
                    id: appointment.id,
                    service: serviceName,
                    date: formatDate(appointmentDate),
                    time: formatTime(appointmentDate),
                    doctor: appointment.doctor ? `BS. ${appointment.doctor.name}` : "Chưa xác định",
                    status: mapAppointmentStatus(appointment.status),
                    reason: appointment.reason || "Không có thông tin",
                    notes: appointment.notes || "Quý khách vui lòng tới trước giờ hẹn 15 phút!",
                    canCancel: appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED",
                    location: appointment.location || "Trung tâm Mắt EyeSpire",
                    room: appointment.room || "Phòng 101",
                    duration: appointment.duration || "30 phút"
                };
            });
            
            setAppointments(formattedAppointments);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc hẹn:", error);
            toast.error("Không thể lấy danh sách cuộc hẹn. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm hỗ trợ định dạng ngày tháng
    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Hàm hỗ trợ định dạng giờ
    const formatTime = (date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    // Chuyển đổi trạng thái từ API sang định dạng hiển thị
    const mapAppointmentStatus = (status) => {
        switch (status) {
            case "SCHEDULED":
                return "pending";
            case "CONFIRMED":
                return "confirmed";
            case "COMPLETED":
                return "completed";
            case "CANCELLED":
                return "cancelled";
            default:
                return "pending";
        }
    };

    const getFilteredAppointments = () => {
        let filteredAppointments = [...appointments];

        if (activeTab === "confirmed") {
            filteredAppointments = appointments.filter(apt => apt.status === "confirmed");
        } else if (activeTab === "completed") {
            filteredAppointments = appointments.filter(apt => apt.status === "completed");
        } else if (activeTab === "cancelled") {
            filteredAppointments = appointments.filter(apt => apt.status === "cancelled");
        } else if (activeTab === "pending") {
            filteredAppointments = appointments.filter(apt => apt.status === "pending");
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredAppointments = filteredAppointments.filter(apt => 
                apt.service.toLowerCase().includes(query) ||
                apt.doctor.toLowerCase().includes(query) ||
                apt.date.includes(query)
            );
        }

        if (sortOrder === "newest") {
            filteredAppointments.sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            });
        } else {
            filteredAppointments.sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateA - dateB;
            });
        }

        return filteredAppointments;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="status-badge status-pending">Chờ xác nhận</span>;
            case "confirmed":
                return <span className="status-badge status-confirmed">Đã xác nhận</span>;
            case "completed":
                return <span className="status-badge status-completed">Đã hoàn thành</span>;
            case "cancelled":
                return <span className="status-badge status-cancelled">Đã hủy</span>;
            default:
                return <span className="status-badge">Không xác định</span>;
        }
    };

    const getAppointmentIcon = (status) => {
        return <Calendar className={`appointment-icon ${status}`} />;
    };

    const toggleAppointmentExpansion = (appointmentId) => {
        setExpandedAppointments(prev => ({
            ...prev,
            [appointmentId]: !prev[appointmentId]
        }));
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            await appointmentService.cancelAppointment(appointmentId);
            toast.success("Hủy lịch hẹn thành công!");
            // Cập nhật lại danh sách cuộc hẹn
            await fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi hủy lịch hẹn:", error);
            toast.error("Không thể hủy lịch hẹn. Vui lòng thử lại sau.");
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleBackHome = () => {
        navigate('/');
    };

    const handleMenuClick = (route) => {
        navigate(`/patient/${route}`);
    };

    return (
        <div className="main-content" style={{ margin: 0, width: '100%', boxSizing: 'border-box' }}>
            <ToastContainer />
            <div className="content-header">
                <h1>Lịch hẹn của tôi</h1>
                <div className="header-actions">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm lịch hẹn..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
                        <Filter size={16} />
                        <span>{sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
                    </button>
                </div>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`tab ${activeTab === "pending" ? "active" : ""}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Chờ xác nhận
                    </button>
                    <button
                        className={`tab ${activeTab === "confirmed" ? "active" : ""}`}
                        onClick={() => setActiveTab("confirmed")}
                    >
                        Đã xác nhận
                    </button>
                    <button
                        className={`tab ${activeTab === "completed" ? "active" : ""}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Đã hoàn thành
                    </button>
                    <button
                        className={`tab ${activeTab === "cancelled" ? "active" : ""}`}
                        onClick={() => setActiveTab("cancelled")}
                    >
                        Đã hủy
                    </button>
                </div>
            </div>

            <div className="appointments-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : getFilteredAppointments().length === 0 ? (
                    <div className="no-appointments">
                        <p>Không có cuộc hẹn nào</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {getFilteredAppointments().map((appointment) => (
                            <div key={appointment.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-info">
                                        <div className="appointment-icon-container">
                                            {getAppointmentIcon(appointment.status)}
                                        </div>
                                        <div className="appointment-details">
                                            <h3 className="appointment-title">
                                                {appointment.service}
                                            </h3>
                                            <div className="appointment-meta">
                                                <span className="appointment-id">Mã cuộc hẹn: #{appointment.id}</span>
                                                <span className="appointment-datetime">
                                                    {appointment.date} - {appointment.time}
                                                </span>
                                            </div>
                                            <div className="appointment-doctor">
                                                <span className="doctor-label">Bác sĩ:</span>
                                                <span className="doctor-name">{appointment.doctor}</span>
                                            </div>
                                            <div className="appointment-status-row">
                                                <span className="status-label">Trạng thái:</span>
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="appointment-actions">
                                        <button
                                            className="expand-button"
                                            onClick={() => toggleAppointmentExpansion(appointment.id)}
                                        >
                                            {expandedAppointments[appointment.id] ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {expandedAppointments[appointment.id] && (
                                    <div className="appointment-expanded">
                                        <div className="appointment-details-grid">
                                            <div className="detail-row">
                                                <span className="detail-label">Lý do khám:</span>
                                                <span className="detail-value">{appointment.notes}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Địa chỉ khám:</span>
                                                <span className="detail-value">{appointment.location}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Phòng khám:</span>
                                                <span className="detail-value">{appointment.room}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Thời gian dự kiến:</span>
                                                <span className="detail-value">{appointment.duration}</span>
                                            </div>
                                        </div>

                                        {appointment.canCancel && (
                                            <div className="appointment-actions-expanded">
                                                <button
                                                    className="cancel-button"
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                >
                                                    Hủy cuộc hẹn
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}