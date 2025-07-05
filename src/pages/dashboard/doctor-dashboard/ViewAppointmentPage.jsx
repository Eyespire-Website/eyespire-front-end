"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Calendar, Clock, FileText, ArrowLeft } from "lucide-react";
import axios from "axios";
import "./view-appointment.css";
import medicalRecordService from "../../../services/medicalRecordService";

const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
        const date = new Date(dateTime);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "N/A";
    }
};

const formatDate = (date) => {
    if (!date) return "N/A";
    try {
        const d = new Date(date);
        return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
        return "N/A";
    }
};

const statusConfig = {
    CONFIRMED: { label: "Đã xác nhận", className: "status-confirmed" },
    PENDING: { label: "Chờ xác nhận", className: "status-pending" },
    COMPLETED: { label: "Hoàn thành", className: "status-completed" },
    CANCELLED: { label: "Đã hủy", className: "status-cancelled" },
};

export default function ViewAppointmentPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMedicalRecord, setHasMedicalRecord] = useState(false);
    const [address, setAddress] = useState("N/A");

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
                addressDetail || "N/A",
                ward ? `Xã ${ward}` : null,
                district ? `Huyện ${district}` : null,
                province ? `Tỉnh ${province}` : null,
            ].filter(Boolean).join(", ") || "N/A";

            return addressParts;
        } catch (err) {
            console.error("Failed to fetch address names:", err);
            return [
                addressDetail || "N/A",
                wardCode ? `Xã ${wardCode}` : null,
                districtCode ? `Huyện ${districtCode}` : null,
                provinceCode ? `Tỉnh ${provinceCode}` : null,
            ].filter(Boolean).join(", ") || "N/A";
        }
    };

    useEffect(() => {
        if (!state?.appointmentData) {
            setError("Không tìm thấy thông tin cuộc hẹn.");
            setLoading(false);
            return;
        }

        const fetchMedicalRecordStatus = async () => {
            try {
                setLoading(true);
                const exists = await medicalRecordService.checkMedicalRecordExistsByAppointmentId(state.appointmentData.id);
                setHasMedicalRecord(exists);
                setAppointment({
                    id: state.appointmentData.id,
                    appointmentDate: state.appointmentData.appointmentDate || "N/A",
                    timeSlot: state.appointmentData.timeSlot || "N/A",
                    patient: {
                        id: state.appointmentData.patient?.id || state.appointmentData.patientId || "N/A",
                        name: state.appointmentData.patient?.name || state.appointmentData.patientName || "N/A",
                        email: state.appointmentData.patient?.email || "N/A",
                        phone: state.appointmentData.patient?.phone || "N/A",
                        gender: state.appointmentData.patient?.gender === "MALE" ? "Nam" :
                            state.appointmentData.patient?.gender === "FEMALE" ? "Nữ" :
                                state.appointmentData.patient?.gender || "N/A",
                        dateOfBirth: state.appointmentData.patient?.dateOfBirth || "N/A",
                        province: state.appointmentData.patient?.province || null,
                        district: state.appointmentData.patient?.district || null,
                        ward: state.appointmentData.patient?.ward || null,
                        addressDetail: state.appointmentData.patient?.addressDetail || "N/A",
                    },
                    doctor: {
                        id: state.appointmentData.doctor?.id || state.appointmentData.doctorId || "N/A",
                    },
                    services: state.appointmentData.services || [],
                    notes: state.appointmentData.notes || "Không có ghi chú",
                    status: state.appointmentData.status || "CONFIRMED",
                    createdAt: state.appointmentData.createdAt || new Date().toISOString(),
                    updatedAt: state.appointmentData.updatedAt || new Date().toISOString(),
                });

                const resolvedAddress = await fetchAddressNames(
                    state.appointmentData.patient?.province,
                    state.appointmentData.patient?.district,
                    state.appointmentData.patient?.ward,
                    state.appointmentData.patient?.addressDetail
                );
                setAddress(resolvedAddress);
            } catch (err) {
                console.error("Failed to check medical record:", err);
                setError("Không thể kiểm tra hồ sơ bệnh án.");
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalRecordStatus();
    }, [state]);

    const handleBack = () => {
        const returnPath = state?.returnPath || "/dashboard/doctor/appointments";
        console.log("Navigating back to:", returnPath);
        navigate(returnPath);
    };

    const handleCreateMedicalRecord = () => {
        navigate("/dashboard/doctor/create-medical-record", {
            state: {
                appointmentId: appointment.id,
                patientId: appointment.patient?.id,
                patientName: appointment.patient?.name,
                doctorId: appointment.doctor?.id,
                serviceIds: appointment.services.map(service => service.id),
                returnPath: "/dashboard/doctor/view-appointment",
                appointmentData: appointment,
            },
        });
    };

    if (loading) {
        return (
            <div className="view-appointment">
                <div className="view-appointment__loading">
                    <div className="view-appointment__spinner"></div>
                    <p>Đang tải thông tin cuộc hẹn...</p>
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="view-appointment">
                <div className="view-appointment__error">
                    <p>{error || "Không tìm thấy thông tin cuộc hẹn."}</p>
                    <button onClick={handleBack} className="view-appointment__back-button">
                        <ArrowLeft size={16} className="view-appointment__icon" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const status = statusConfig[appointment.status] || statusConfig.CONFIRMED;
    const patient = appointment.patient || {};
    const services = appointment.services || [];

    return (
        <div className="view-appointment">
            <div className="view-appointment__container">
                <div className="view-appointment__header">
                    <h1 className="view-appointment__title">Chi tiết cuộc hẹn</h1>
                </div>

                <div className="view-appointment__card">
                    <div className="view-appointment__card-header">
                        <div className="view-appointment__card-header-content">
                            <FileText className="view-appointment__card-header-icon" />
                            <span className="view-appointment__card-header-text">Thông tin cuộc hẹn</span>
                        </div>
                    </div>

                    <div className="view-appointment__section">
                        <h2 className="view-appointment__section-title">Thông tin bệnh nhân</h2>
                        <div className="view-appointment__info-group">
                            <div className="view-appointment__info-item">
                                <User size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Tên</span>
                                    <p className="view-appointment__value">{patient.name || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Email</span>
                                    <p className="view-appointment__value">{patient.email || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Số điện thoại</span>
                                    <p className="view-appointment__value">{patient.phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Giới tính</span>
                                    <p className="view-appointment__value">{patient.gender || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <Calendar size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Ngày sinh</span>
                                    <p className="view-appointment__value">{formatDate(patient.dateOfBirth)}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Địa chỉ</span>
                                    <p className="view-appointment__value">{address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="view-appointment__section">
                        <h2 className="view-appointment__section-title">Thông tin dịch vụ</h2>
                        <div className="view-appointment__info-group">
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Danh sách dịch vụ</span>
                                    {services.length > 0 ? (
                                        <ul className="view-appointment__services-list">
                                            {services.map((service) => (
                                                <li key={service.id || `service-${Math.random()}`} className="view-appointment__service-item">
                                                    {service.name || `Dịch vụ ID: ${service.id || "N/A"}`}
                                                    {service.description && service.description !== "N/A" && (
                                                        <span className="view-appointment__service-description">
                                                            ({service.description})
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="view-appointment__value">Chưa có dịch vụ được chọn</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="view-appointment__section">
                        <h2 className="view-appointment__section-title">Thông tin lịch hẹn</h2>
                        <div className="view-appointment__info-group">
                            <div className="view-appointment__info-item">
                                <Calendar size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Ngày hẹn</span>
                                    <p className="view-appointment__value">{appointment.appointmentDate || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <Clock size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Giờ hẹn</span>
                                    <p className="view-appointment__value">{appointment.timeSlot || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Lý do khám</span>
                                    <p className="view-appointment__value">{appointment.notes || "Không có ghi chú"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Trạng thái</span>
                                    <span className={`view-appointment__status ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Thời gian tạo</span>
                                    <p className="view-appointment__value">{formatDateTime(appointment.createdAt)}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Thời gian cập nhật</span>
                                    <p className="view-appointment__value">{formatDateTime(appointment.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="view-appointment__actions">
                        <button onClick={handleBack} className="view-appointment__back-button">
                            <ArrowLeft size={16} className="view-appointment__icon" />
                            Quay lại
                        </button>
                        {appointment.status === "CONFIRMED" && !hasMedicalRecord && (
                            <button
                                className="view-appointment__create-record-button"
                                onClick={handleCreateMedicalRecord}
                                title="Tạo hồ sơ bệnh án"
                            >
                                Tạo hồ sơ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}