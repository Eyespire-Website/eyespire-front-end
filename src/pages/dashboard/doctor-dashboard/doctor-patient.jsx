"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Edit, Save, User, Phone, Mail, Calendar, Plus, X } from "lucide-react";
import axios from "axios";
import "./doctor-patient.css";
import appointmentService from "../../../services/appointmentService";
import medicalRecordService from "../../../services/medicalRecordService";
import authService from "../../../services/authService";
import userService from "../../../services/userService";

const formatAppointmentTime = (dateTime) => {
    if (!dateTime) {
        return { date: "Chưa xác định", time: "Chưa xác định" };
    }
    try {
        const dateTimeObj = new Date(dateTime);
        if (isNaN(dateTimeObj.getTime())) {
            return { date: "Chưa xác định", time: "Chưa xác định" };
        }
        const date = dateTimeObj.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
        const time = dateTimeObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
        return { date, time };
    } catch (error) {
        console.error("Lỗi khi format appointmentTime:", dateTime, error);
        return { date: "Chưa xác định", time: "Chưa xác định" };
    }
};

const formatDate = (date) => {
    if (!date) return "Chưa cập nhật";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Chưa cập nhật";
        return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
        return "Chưa cập nhật";
    }
};

const statusConfig = {
    CONFIRMED: { label: "Đã xác nhận", className: "d-status-badge confirmed" },
    PENDING: { label: "Chờ xác nhận", className: "d-status-badge pending" },
    DOCTOR_FINISHED: { label: "Bác sĩ đã khám xong", className: "d-status-badge doctor-finished" },
    COMPLETED: { label: "Hoàn thành", className: "d-status-badge completed" },
    CANCELLED: { label: "Đã hủy", className: "d-status-badge cancelled" },
    WAITING_PAYMENT: { label: "Chờ thanh toán", className: "d-status-badge waiting-payment" },
};

const fetchAddressNames = async (provinceCode, districtCode, wardCode, addressDetail) => {
    try {
        const provincesResponse = await axios.get("https://provinces.open-api.vn/api/p/");
        const provinces = provincesResponse.data;
        const province = provinces.find(p => p.code === parseInt(provinceCode))?.name || provinceCode || "";

        let district = districtCode || "";
        let ward = wardCode || "";

        if (provinceCode) {
            const districtsResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const districts = districtsResponse.data.districts;
            district = districts.find(d => d.code === parseInt(districtCode))?.name || districtCode || "";
        }

        if (districtCode && provinceCode) {
            const wardsResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const wards = wardsResponse.data.wards;
            ward = wards.find(w => w.code === parseInt(wardCode))?.name || wardCode || "";
        }

        const addressParts = [
            addressDetail && addressDetail !== "N/A" ? addressDetail : "Chưa xác định",
            ward ? `Xã ${ward}` : null,
            district ? `Huyện ${district}` : null,
            province ? `Tỉnh ${province}` : null,
        ].filter(Boolean).join(", ") || "Chưa cập nhật";

        return addressParts;
    } catch (err) {
        console.error("Failed to fetch address names:", err);
        return [
            addressDetail && addressDetail !== "N/A" ? addressDetail : "Chưa xác định",
            wardCode ? `Xã ${wardCode}` : null,
            districtCode ? `Huyện ${districtCode}` : null,
            provinceCode ? `Tỉnh ${provinceCode}` : null,
        ].filter(Boolean).join(", ") || "Chưa cập nhật";
    }
};

export default function PatientProfile() {
    const [activeSection, setActiveSection] = useState("info");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editedPatient, setEditedPatient] = useState(null);
    const [error, setError] = useState(null);
    const [appointmentCache, setAppointmentCache] = useState(new Map());
    const [medicalRecordCache, setMedicalRecordCache] = useState(new Map());
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || null;

    useEffect(() => {
        let isMounted = true;

        const fetchPatients = async () => {
            if (!userId) {
                console.warn("No user found, redirecting to login");
                navigate("/login");
                return;
            }
            try {
                setLoading(true);
                const appointments = await appointmentService.getDoctorAppointmentsByUserId(userId);
                console.log("Appointments fetched:", JSON.stringify(appointments, null, 2));

                const relevantAppointments = appointments.filter(
                    appointment => appointment.status === "COMPLETED" || appointment.status === "WAITING_PAYMENT" || appointment.status === "DOCTOR_FINISHED"
                );

                if (relevantAppointments.length === 0) {
                    setPatients([]);
                    setSelectedPatient(null);
                    setLoading(false);
                    return;
                }

                const patientMap = new Map();
                const tempAppointmentCache = new Map();
                const tempMedicalRecordCache = new Map();

                await Promise.all(
                    relevantAppointments.map(async appointment => {
                        const { date, time } = formatAppointmentTime(appointment.appointmentTime);
                        const services = Array.isArray(appointment.services)
                            ? appointment.services.map(s => ({
                                id: s.id || null,
                                name: s.name || "Khám tổng quát",
                                description: s.description || "N/A",
                            }))
                            : [
                                {
                                    id: appointment.service?.id || null,
                                    name: appointment.service?.name || appointment.service || "Khám tổng quát",
                                    description: appointment.service?.description || appointment.serviceDescription || "N/A",
                                },
                            ];
                        const appointmentData = {
                            id: appointment.id,
                            appointmentTime: appointment.appointmentTime,
                            appointmentDate: date,
                            timeSlot: time,
                            services,
                            status: appointment.status,
                            notes: appointment.notes || "Không có lý do khám",
                            patient: appointment.patient || {
                                id: appointment.patientId || "N/A",
                                name: appointment.patientName || "N/A",
                                email: appointment.patient?.email || "N/A",
                                phone: appointment.patient?.phone || "N/A",
                                gender: appointment.patient?.gender || "N/A",
                                dateOfBirth: appointment.patient?.dateOfBirth || "N/A",
                                province: appointment.patient?.province || null,
                                district: appointment.patient?.district || null,
                                ward: appointment.patient?.ward || null,
                                addressDetail: appointment.patient?.addressDetail || "N/A",
                            },
                            doctor: appointment.doctor || { id: appointment.doctorId || userId },
                            createdAt: appointment.createdAt || new Date().toISOString(),
                            updatedAt: appointment.updatedAt || new Date().toISOString(),
                        };
                        tempAppointmentCache.set(appointment.id, appointmentData);

                        let medicalRecord = null;
                        if (tempMedicalRecordCache.has(appointment.id)) {
                            medicalRecord = tempMedicalRecordCache.get(appointment.id);
                        } else {
                            const exists = await medicalRecordService.checkMedicalRecordExistsByAppointmentId(appointment.id);
                            if (exists) {
                                try {
                                    medicalRecord = await medicalRecordService.getMedicalRecordByAppointmentId(appointment.id);
                                    console.log(`Medical record for appointment ${appointment.id}:`, JSON.stringify(medicalRecord, null, 2));
                                    tempMedicalRecordCache.set(appointment.id, medicalRecord);
                                } catch (error) {
                                    console.error(`Failed to fetch medical record for appointment ${appointment.id}:`, error);
                                }
                            }
                        }

                        if (appointment.patient?.id && isMounted) {
                            const address = await fetchAddressNames(
                                appointment.patient.province,
                                appointment.patient.district,
                                appointment.patient.ward,
                                appointment.patient.addressDetail
                            );

                            const patientData = {
                                id: appointment.patient.id,
                                name: appointment.patient.name || "Chưa cập nhật",
                                phone: appointment.patient.phone || "Chưa cập nhật",
                                email: appointment.patient.email || "Chưa cập nhật",
                                gender: appointment.patient.gender === "MALE" ? "Nam" : appointment.patient.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật",
                                address: address,
                                dateOfBirth: formatDate(appointment.patient.dateOfBirth),
                                appointments: [
                                    ...(patientMap.get(appointment.patient.id)?.appointments || []),
                                    {
                                        id: appointment.id,
                                        appointmentTime: appointment.appointmentTime,
                                        date,
                                        time,
                                        location: appointment.location || "Chưa xác định",
                                        service: services.map(s => s.name).join(", "), // For display in appointments table
                                        status: appointment.status,
                                        notes: appointment.notes || "Không có lý do khám",
                                        hasMedicalRecord: !!medicalRecord,
                                        createdAt: appointment.createdAt || new Date().toISOString(),
                                        updatedAt: appointment.updatedAt || new Date().toISOString(),
                                    },
                                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                                healthRecords: medicalRecord
                                    ? [
                                        ...(patientMap.get(appointment.patient.id)?.healthRecords || []),
                                        {
                                            id: medicalRecord.id,
                                            appointmentId: appointment.id,
                                            date: medicalRecord.date || date,
                                            time: medicalRecord.time || time,
                                            diagnosis: medicalRecord.diagnosis || "Chưa cập nhật",
                                            services: services, // Pass full services array
                                            notes: medicalRecord.notes || "Không có ghi chú",
                                            patient: {
                                                id: appointment.patient.id,
                                                name: appointment.patient.name || "Chưa cập nhật",
                                                email: appointment.patient.email || "N/A",
                                                phone: appointment.patient.phone || "N/A",
                                                gender: appointment.patient.gender === "MALE" ? "Nam" : appointment.patient.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật",
                                                dateOfBirth: formatDate(appointment.patient.dateOfBirth),
                                                province: appointment.patient.province || null,
                                                district: appointment.patient.district || null,
                                                ward: appointment.patient.ward || null,
                                                addressDetail: appointment.patient.addressDetail || "Chưa xác định",
                                            },
                                            doctor: {
                                                id: appointment.doctor?.id || userId,
                                                name: appointment.doctor?.name || "Chưa cập nhật",
                                                specialty: appointment.doctor?.specialty || { name: "N/A" },
                                                qualification: appointment.doctor?.qualification || "N/A",
                                                experience: appointment.doctor?.experience || null,
                                            },
                                            appointment: {
                                                id: appointment.id,
                                                appointmentTime: appointment.appointmentTime,
                                                services,
                                            },
                                            createdAt: medicalRecord.createdAt || new Date().toISOString(),
                                            updatedAt: medicalRecord.updatedAt || new Date().toISOString(),
                                            recordFileUrl: medicalRecord.recordFileUrl || "",
                                            recommendedProducts: medicalRecord.recommendedProducts || [],
                                        },
                                    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    : patientMap.get(appointment.patient.id)?.healthRecords || [],
                            };
                            patientMap.set(appointment.patient.id, patientData);
                        }
                    })
                );

                if (isMounted) {
                    setAppointmentCache(tempAppointmentCache);
                    setMedicalRecordCache(tempMedicalRecordCache);
                    const patientList = Array.from(patientMap.values());
                    setPatients(patientList);
                    if (patientList.length > 0) {
                        setSelectedPatient(patientList[0]);
                        setEditedPatient({ ...patientList[0] });
                    } else {
                        setSelectedPatient(null);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching patients:", error);
                    setError("Không thể tải danh sách bệnh nhân. Vui lòng thử lại.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPatients();

        return () => {
            isMounted = false;
        };
    }, [userId, navigate]);

    const selectPatient = patient => {
        setSelectedPatient(patient);
        setEditedPatient({ ...patient });
        setEditMode(false);
        setError(null);
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
        setError(null);
    };

    const handleInputChange = e => {
        const { name, value } = e.target;
        setEditedPatient(prev => ({
            ...prev,
            [name]: value || "Chưa cập nhật",
        }));
    };

    const handleSave = () => {
        userService
            .updatePatient(editedPatient.id, {
                name: editedPatient.name,
                phone: editedPatient.phone,
                email: editedPatient.email,
                gender: editedPatient.gender === "Nam" ? "MALE" : editedPatient.gender === "Nữ" ? "FEMALE" : "Chưa cập nhật",
                addressDetail: editedPatient.address.split(", ")[0],
                province: editedPatient.address.split(", Tỉnh ")[1] || null,
                district: editedPatient.address.split(", Huyện ")[1]?.split(", Tỉnh ")[0] || null,
                ward: editedPatient.address.split(", Xã ")[1]?.split(", Huyện ")[0] || null,
                dateOfBirth: editedPatient.dateOfBirth,
            })
            .then(updatedPatient => {
                setSelectedPatient({ ...editedPatient });
                setPatients(prev => prev.map(p => (p.id === editedPatient.id ? { ...editedPatient } : p)));
                setEditMode(false);
                setError(null);
            })
            .catch(error => {
                console.error("Error updating patient:", error);
                setError("Không thể cập nhật thông tin bệnh nhân. Vui lòng thử lại.");
            });
    };

    const handleViewAppointment = appointment => {
        const cachedAppointment = appointmentCache.get(appointment.id) || {};
        navigate("/dashboard/doctor/view-appointment", {
            state: {
                appointmentData: {
                    id: appointment.id,
                    appointmentTime: appointment.appointmentTime,
                    appointmentDate: appointment.date,
                    timeSlot: appointment.time,
                    patient: {
                        id: appointment.patientId || selectedPatient.id,
                        name: selectedPatient.name || "Chưa cập nhật",
                        email: selectedPatient.email || "Chưa cập nhật",
                        phone: selectedPatient.phone || "Chưa cập nhật",
                        gender: selectedPatient.gender || "Chưa cập nhật",
                        dateOfBirth: selectedPatient.dateOfBirth || "Chưa cập nhật",
                        province: selectedPatient.address.split(", Tỉnh ")[1] || null,
                        district: selectedPatient.address.split(", Huyện ")[1]?.split(", Tỉnh ")[0] || null,
                        ward: selectedPatient.address.split(", Xã ")[1]?.split(", Huyện ")[0] || null,
                        addressDetail: selectedPatient.address.split(", ")[0] || "Chưa cập nhật",
                    },
                    doctor: { id: userId },
                    services: cachedAppointment.services || [
                        {
                            id: null,
                            name: appointment.service || "Khám tổng quát",
                            description: "N/A",
                        },
                    ],
                    notes: appointment.notes || "Không có lý do khám",
                    status: appointment.status || "COMPLETED",
                    createdAt: appointment.createdAt || new Date().toISOString(),
                    updatedAt: appointment.updatedAt || new Date().toISOString(),
                },
                returnPath: "/dashboard/doctor/patients",
            },
        });
    };

    const handleViewMedicalRecord = record => {
        console.log("Navigating to ViewMedicalRecord with state:", {
            medicalRecordData: { ...record },
            returnPath: "/dashboard/doctor/patients",
        });
        navigate("/dashboard/doctor/view-medical-record", {
            state: {
                medicalRecordData: record,
                returnPath: "/dashboard/doctor/patients",
            },
        });
    };

    const handleEditMedicalRecord = record => {
        console.log("Navigating to EditMedicalRecord with state:", {
            medicalRecordData: { ...record },
            returnPath: "/dashboard/doctor/patients",
        });
        navigate("/dashboard/doctor/edit-medical-record", {
            state: {
                medicalRecordData: {
                    ...record,
                    appointment: {
                        ...record.appointment,
                        appointmentTime: record.appointment?.appointmentTime || record.date + "T" + record.time,
                    },
                },
                returnPath: "/dashboard/doctor/patients",
            },
        });
    };

    const handleCreateMedicalRecord = appointment => {
        navigate("/dashboard/doctor/create-medical-record", {
            state: {
                appointmentId: appointment.id,
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                doctorId: userId,
                serviceIds: appointmentCache.get(appointment.id)?.services.map(s => s.id).filter(id => id) || [],
                appointmentTime: appointment.appointmentTime,
                returnPath: "/dashboard/doctor/patients",
            },
        });
    };

    const filteredPatients = patients.filter(
        patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="d-customer-container">
            <div className="d-customer-content">
                <header className="d-customer-header">
                    <h1>Hồ sơ bệnh nhân</h1>
                    <div className="d-search-container">
                        <div className="d-search-input-wrapper">
                            <Search size={20} className="d-search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bệnh nhân (Tên, SĐT, Email...)"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="d-search-input"
                            />
                        </div>
                    </div>
                </header>

                <div className="d-customer-profile-container">
                    <div className="d-customer-list-container">
                        <div className="d-customer-list-header">
                            <h2>Danh sách bệnh nhân</h2>
                        </div>
                        <div className="d-customer-list">
                            {loading ? (
                                <div className="d-loading-message">Đang tải dữ liệu...</div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="d-empty-message">Không tìm thấy bệnh nhân đã khám</div>
                            ) : (
                                filteredPatients.map(patient => (
                                    <div
                                        key={patient.id}
                                        className={`d-customer-list-item ${selectedPatient?.id === patient.id ? "d-customer-list-item active" : ""}`}
                                        onClick={() => selectPatient(patient)}
                                    >
                                        <div className="d-customer-avatar">
                                            <User size={24} />
                                        </div>
                                        <div className="d-customer-list-info">
                                            <h3>{patient.name}</h3>
                                            <div className="d-customer-list-details">
                                                <span>
                                                    <Phone size={14} />
                                                    {patient.phone}
                                                </span>
                                                <span>
                                                    <Mail size={14} />
                                                    {patient.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {selectedPatient ? (
                        <div className="d-customer-details-container">
                            <div className="d-customer-details-header">
                                <div className="d-customer-details-actions">
                                    <button
                                        className="d-action-btn d-edit-btn"
                                        onClick={handleEditToggle}
                                        title={editMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
                                    >
                                        <Edit size={16} />
                                        {editMode ? "Hủy" : "Chỉnh sửa"}
                                    </button>
                                    {editMode && (
                                        <button className="d-action-btn d-save-btn" onClick={handleSave} title="Lưu thay đổi">
                                            <Save size={16} />
                                            Lưu
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="d-customer-details-tabs">
                                <button
                                    className={`d-tab-btn ${activeSection === "info" ? "d-tab-btn active" : ""}`}
                                    onClick={() => setActiveSection("info")}
                                >
                                    Thông tin cá nhân
                                </button>
                                <button
                                    className={`d-tab-btn ${activeSection === "appointments" ? "d-tab-btn active" : ""}`}
                                    onClick={() => setActiveSection("appointments")}
                                >
                                    Lịch sử cuộc hẹn ({selectedPatient.appointments.length})
                                </button>
                                <button
                                    className={`d-tab-btn ${activeSection === "health" ? "d-tab-btn active" : ""}`}
                                    onClick={() => setActiveSection("health")}
                                >
                                    Hồ sơ bệnh án ({selectedPatient.healthRecords.length})
                                </button>
                            </div>

                            <div className="d-customer-details-content">
                                {activeSection === "info" && (
                                    <div className="d-customer-info-section">
                                        {error && <div className="d-error-message">{error}</div>}
                                        <div className="d-info-grid">
                                            <div className="d-info-item">
                                                <label>Họ và tên:</label>
                                                <span>{selectedPatient.name}</span>
                                            </div>
                                            <div className="d-info-item">
                                                <label>Giới tính:</label>
                                                <span>{selectedPatient.gender}</span>
                                            </div>
                                            <div className="d-info-item">
                                                <label>Số điện thoại:</label>
                                                <span>{selectedPatient.phone}</span>
                                            </div>
                                            <div className="d-info-item">
                                                <label>Email:</label>
                                                <span>{selectedPatient.email}</span>
                                            </div>
                                            <div className="d-info-item d-info-item.full-width">
                                                <label>Địa chỉ:</label>
                                                <span>{selectedPatient.address}</span>
                                            </div>
                                            <div className="d-info-item">
                                                <label>Ngày sinh:</label>
                                                <span>{selectedPatient.dateOfBirth}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === "appointments" && (
                                    <div className="d-appointment-history-section">
                                        <div className="d-appointment-list">
                                            {selectedPatient.appointments.length === 0 ? (
                                                <div className="d-empty-message">Chưa có cuộc hẹn hoàn thành</div>
                                            ) : (
                                                <table className="d-appointment-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Ngày</th>
                                                        <th>Thời gian</th>
                                                        <th>Dịch vụ</th>
                                                        <th>Trạng thái</th>
                                                        <th>Ghi chú</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {selectedPatient.appointments.map(appointment => {
                                                        const cachedAppointment = appointmentCache.get(appointment.id) || {};
                                                        return (
                                                            <tr key={appointment.id}>
                                                                <td>{appointment.date}</td>
                                                                <td>{appointment.time}</td>
                                                                <td>
                                                                    <ul className="d-services-list">
                                                                        {(cachedAppointment.services || []).map((service, index) => (
                                                                            <li key={index} className="d-service-item">
                                                                                {service.name || `Dịch vụ ID: ${service.id || "N/A"}`}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`d-status-badge ${
                                                                            statusConfig[appointment.status]?.className
                                                                        }`}
                                                                    >
                                                                        {statusConfig[appointment.status]?.label || "Chưa xác định"}
                                                                    </span>
                                                                </td>
                                                                <td className="d-notes-cell">{appointment.notes}</td>
                                                                <td>
                                                                    <div className="d-table-actions">
                                                                        <button
                                                                            className="d-table-action-btn"
                                                                            onClick={() => handleViewAppointment(appointment)}
                                                                            title="Xem chi tiết"
                                                                        >
                                                                            <Eye size={14} />
                                                                        </button>
                                                                        {!appointment.hasMedicalRecord && (
                                                                            <button
                                                                                className="d-table-action-btn d-create-record-btn"
                                                                                onClick={() => handleCreateMedicalRecord(appointment)}
                                                                                title="Tạo hồ sơ bệnh án"
                                                                            >
                                                                                <Plus size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeSection === "health" && (
                                    <div className="d-health-records-section">
                                        <div className="d-health-records-list">
                                            {selectedPatient.healthRecords.length === 0 ? (
                                                <div className="d-empty-message">Chưa có hồ sơ bệnh án</div>
                                            ) : (
                                                selectedPatient.healthRecords.map(record => (
                                                    <div key={record.id} className="d-health-record-card">
                                                        <div className="d-health-record-header">
                                                            <div className="d-health-record-date">
                                                                <Calendar size={16} />
                                                                <span>{`${record.date} ${record.time}`}</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-health-record-body">
                                                            <div className="d-health-record-item">
                                                                <label>Chẩn đoán:</label>
                                                                <span>{record.diagnosis}</span>
                                                            </div>
                                                            <div className="d-health-record-item">
                                                                <label>Dịch vụ:</label>
                                                                <span>{record.service}</span>
                                                            </div>
                                                            <div className="d-health-record-item">
                                                                <label>Ghi chú:</label>
                                                                <span>{record.notes}</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-health-record-footer">
                                                            <button
                                                                className="d-health-record-btn"
                                                                onClick={() => handleEditMedicalRecord(record)}
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit size={14} />
                                                                Chỉnh sửa
                                                            </button>
                                                            <button
                                                                className="d-health-record-btn d-health-record-btn.view"
                                                                onClick={() => handleViewMedicalRecord(record)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye size={14} />
                                                                Xem chi tiết
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {editMode && (
                                <div className="d-modal-overlay">
                                    <div className="d-modal-content">
                                        <div className="d-modal-header">
                                            <h2>Chỉnh sửa thông tin bệnh nhân</h2>
                                            <button
                                                className="d-modal-close-btn"
                                                onClick={() => setEditMode(false)}
                                                title="Đóng"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="d-modal-body">
                                            {error && <div className="d-error-message">{error}</div>}
                                            <div className="d-form-group">
                                                <label>Họ và tên</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editedPatient.name === "Chưa cập nhật" ? "" : editedPatient.name}
                                                    onChange={handleInputChange}
                                                    className="d-modal-input"
                                                />
                                            </div>
                                            <div className="d-form-group">
                                                <label>Giới tính</label>
                                                <select
                                                    name="gender"
                                                    value={editedPatient.gender}
                                                    onChange={handleInputChange}
                                                    className="d-modal-input"
                                                >
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Chưa cập nhật">Chưa cập nhật</option>
                                                </select>
                                            </div>
                                            <div className="d-form-group">
                                                <label>Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={editedPatient.phone === "Chưa cập nhật" ? "" : editedPatient.phone}
                                                    onChange={handleInputChange}
                                                    className="d-modal-input"
                                                />
                                            </div>
                                            <div className="d-form-group">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editedPatient.email === "Chưa cập nhật" ? "" : editedPatient.email}
                                                    onChange={handleInputChange}
                                                    className="d-modal-input"
                                                />
                                            </div>
                                            <div className="d-form-group">
                                                <label>Địa chỉ chi tiết</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={editedPatient.address === "Chưa cập nhật" ? "" : editedPatient.address.split(", ")[0]}
                                                    onChange={handleInputChange}
                                                    className="d-modal-input"
                                                />
                                            </div>
                                            <div className="d-form-group">
                                                <label>Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={editedPatient.dateOfBirth === "Chưa cập nhật" ? "" : editedPatient.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    className="d-modal-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="d-modal-footer">
                                            <button
                                                className="d-modal-btn d-modal-btn.cancel"
                                                onClick={() => setEditMode(false)}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                className="d-modal-btn d-modal-btn.save"
                                                onClick={handleSave}
                                            >
                                                Lưu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="d-no-customer-selected">
                            <div className="d-no-selection-message">
                                <User size={48} />
                                <h3>Chọn bệnh nhân để xem thông tin chi tiết</h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}