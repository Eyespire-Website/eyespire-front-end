"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { User, Calendar, Clock, FileText, ArrowLeft } from "lucide-react"
import axios from "axios"
import "./view-appointment.css"
import appointmentService from "../../../services/appointmentService"
import medicalRecordService from "../../../services/medicalRecordService"

// Format ngày giờ cho dễ đọc
const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A"
    try {
        const date = new Date(dateTime)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
    } catch {
        return "N/A"
    }
}

const formatDate = (date) => {
    if (!date) return "N/A"
    try {
        const d = new Date(date)
        return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch {
        return "N/A"
    }
}

const statusConfig = {
    CONFIRMED: { label: "Đã xác nhận", className: "status-confirmed" },
    COMPLETED: { label: "Hoàn thành", className: "status-completed" },
}

export default function ViewAppointmentPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hasMedicalRecord, setHasMedicalRecord] = useState(false)
    const [address, setAddress] = useState("N/A")

    // Fetch address names from API
    const fetchAddressNames = async (provinceCode, districtCode, wardCode, addressDetail) => {
        try {
            // Fetch provinces
            const provincesResponse = await axios.get("https://provinces.open-api.vn/api/p/")
            const provinces = provincesResponse.data
            const province = provinces.find(p => p.code === parseInt(provinceCode))?.name || provinceCode || ""

            let district = districtCode || ""
            let ward = wardCode || ""

            // Fetch districts if provinceCode exists
            if (provinceCode) {
                const districtsResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
                const districts = districtsResponse.data.districts
                district = districts.find(d => d.code === parseInt(districtCode))?.name || districtCode || ""
            }

            // Fetch wards if districtCode exists
            if (districtCode && provinceCode) {
                const wardsResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
                const wards = wardsResponse.data.wards
                ward = wards.find(w => w.code === parseInt(wardCode))?.name || wardCode || ""
            }

            // Construct address
            const addressParts = [
                addressDetail,
                ward ? `Xã ${ward}` : null,
                district ? `Huyện ${district}` : null,
                province ? `Tỉnh ${province}` : null,
            ].filter(Boolean).join(", ") || "N/A"

            return addressParts
        } catch (err) {
            console.error("Failed to fetch address names:", err)
            // Fallback to raw codes if API fails
            return [
                addressDetail,
                wardCode ? `Xã ${wardCode}` : null,
                districtCode ? `Huyện ${districtCode}` : null,
                provinceCode ? `Tỉnh ${provinceCode}` : null,
            ].filter(Boolean).join(", ") || "N/A"
        }
    }

    // Lấy dữ liệu từ state và kiểm tra hồ sơ bệnh án
    useEffect(() => {
        if (!state?.appointmentData) {
            setError("Không tìm thấy thông tin cuộc hẹn.")
            setLoading(false)
            return
        }

        const fetchMedicalRecordStatus = async () => {
            try {
                setLoading(true)
                const exists = await medicalRecordService.checkMedicalRecordExistsByAppointmentId(state.appointmentData.id)
                setHasMedicalRecord(exists)
                setAppointment(state.appointmentData)

                // Fetch address names
                const patient = state.appointmentData.patient || {}
                const resolvedAddress = await fetchAddressNames(
                    patient.province,
                    patient.district,
                    patient.ward,
                    patient.addressDetail
                )
                setAddress(resolvedAddress)
            } catch (err) {
                console.error("Failed to check medical record:", err)
                setError("Không thể kiểm tra hồ sơ bệnh án.")
            } finally {
                setLoading(false)
            }
        }

        fetchMedicalRecordStatus()
    }, [state])

    // Xử lý hoàn thành cuộc hẹn
    const handleCompleteAppointment = async () => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn hoàn thành cuộc hẹn này không?")
        if (!confirmed) return

        try {
            await appointmentService.updateAppointmentStatus(appointment.id, "COMPLETED")
            setAppointment(prev => ({ ...prev, status: "COMPLETED" }))
        } catch (err) {
            console.error("Failed to complete appointment:", err)
            if (err.response?.status === 401) {
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
            } else if (err.response?.status === 404) {
                setError("Không tìm thấy cuộc hẹn.")
            } else {
                setError("Không thể hoàn thành cuộc hẹn. Vui lòng thử lại.")
            }
        }
    }

    // Xử lý quay lại
    const handleBack = () => {
        navigate("/dashboard/doctor/appointments")
    }

    // Xử lý tạo hồ sơ bệnh án
    const handleCreateMedicalRecord = () => {
        if (appointment.status !== "COMPLETED") {
            alert("Chỉ có thể tạo hồ sơ bệnh án cho cuộc hẹn đã hoàn thành!")
            return
        }
        navigate("/dashboard/doctor/create-medical-record", {
            state: {
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                patientName: appointment.patient?.name,
                doctorId: appointment.doctorId
            },
        })
    }

    if (loading) {
        return (
            <div className="view-appointment">
                <div className="view-appointment__loading">
                    <div className="view-appointment__spinner"></div>
                    <p>Đang tải thông tin cuộc hẹn...</p>
                </div>
            </div>
        )
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
        )
    }

    const status = statusConfig[appointment.status] || statusConfig.CONFIRMED
    const patient = appointment.patient || {}
    const doctor = appointment.doctor || {}
    const service = appointment.service || {}

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
                                    <p className="view-appointment__value">{patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "N/A"}</p>
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
                                    <span className="view-appointment__label">Tên dịch vụ</span>
                                    <p className="view-appointment__value">{service.name || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-appointment__info-item">
                                <FileText size={18} className="view-appointment__icon" />
                                <div>
                                    <span className="view-appointment__label">Mô tả</span>
                                    <p className="view-appointment__value">{service.description || "N/A"}</p>
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
                        {appointment.status === "CONFIRMED" && (
                            <button
                                className="view-appointment__complete-button"
                                onClick={handleCompleteAppointment}
                                title="Hoàn thành cuộc hẹn"
                            >
                                Hoàn thành
                            </button>
                        )}
                        {appointment.status === "COMPLETED" && !hasMedicalRecord && (
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
    )
}