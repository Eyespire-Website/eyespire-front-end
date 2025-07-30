"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Calendar, User, Clock, Search, CalendarDays, Eye } from "lucide-react"
import "./doctor-appointments.css"
import "./doctor-appointments-unified.css"
import appointmentService from "../../../services/appointmentService"
import authService from "../../../services/authService"
import medicalRecordService from "../../../services/medicalRecordService"

// Hàm format ngày giờ từ appointmentTime (LocalDateTime)
const formatAppointmentTime = (appointmentTime) => {
    if (!appointmentTime) {
        return { date: "N/A", time: "N/A" }
    }
    try {
        const dateTime = new Date(appointmentTime)
        const date = dateTime.toISOString().split('T')[0] // Lấy ngày YYYY-MM-DD
        const time = dateTime.toTimeString().split(' ')[0].slice(0, 5) // Lấy giờ HH:MM
        return { date, time }
    } catch (error) {
        console.error("Lỗi khi format appointmentTime:", appointmentTime, error)
        return { date: "N/A", time: "N/A" }
    }
}

const statusConfig = {
    CONFIRMED: { label: "Đã xác nhận", className: "appointments-status-confirmed" },
}

export default function DoctorAppointmentsPage() {
    const [allAppointments, setAllAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const location = useLocation()
    const itemsPerPage = 5

    const currentUser = authService.getCurrentUser()
    const userId = currentUser?.id || null

    const fetchAppointments = async () => {
        if (!userId) {
            setError("Không tìm thấy thông tin bác sĩ.")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await appointmentService.getDoctorAppointmentsByUserId(userId)
            console.log("API Response:", JSON.stringify(data, null, 2))

            const formattedAppointments = await Promise.all(data.map(async (appointment) => {
                const { date, time } = appointment.appointmentTime
                    ? formatAppointmentTime(appointment.appointmentTime)
                    : { date: appointment.appointmentDate || "N/A", time: appointment.timeSlot || "N/A" }

                const isConfirmed = appointment.status === "CONFIRMED"
                const hasMedicalRecord = await medicalRecordService.checkMedicalRecordExistsByAppointmentId(appointment.id)

                // Handle multiple services
                const services = Array.isArray(appointment.services)
                    ? appointment.services.map(service => ({
                        id: service.id,
                        name: service.name || "Chưa chọn dịch vụ",
                        description: service.description || "N/A"
                    }))
                    : []
                const serviceIds = services.map(service => service.id)

                console.log(`Appointment ID ${appointment.id}:`, {
                    isConfirmed,
                    status: appointment.status,
                    appointmentTime: appointment.appointmentTime,
                    appointmentDate: appointment.appointmentDate,
                    timeSlot: appointment.timeSlot,
                    patientId: appointment.patient?.id,
                    patientName: appointment.patient?.name,
                    doctorId: appointment.doctor?.id,
                    services,
                    serviceIds,
                    formattedDate: date,
                    formattedTime: time,
                    hasMedicalRecord
                })

                return {
                    id: appointment.id,
                    appointmentDate: date,
                    timeSlot: time,
                    patient: {
                        id: appointment.patient?.id || appointment.patientId || "N/A",
                        name: appointment.patient?.name || appointment.patientName || "N/A",
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
                    services, // Store array of services
                    serviceIds, // Store array of service IDs
                    notes: appointment.notes || "Không có lý do khám",
                    status: appointment.status,
                    createdAt: appointment.createdAt || new Date().toISOString(),
                    updatedAt: appointment.updatedAt || new Date().toISOString(),
                    hasMedicalRecord
                }
            }))

            const filteredAppointments = formattedAppointments.filter(
                appointment => appointment.status === "CONFIRMED"
            )

            console.log("Filtered Appointments:", JSON.stringify(filteredAppointments, null, 2))
            setAllAppointments(filteredAppointments || [])
        } catch (err) {
            console.error("Failed to fetch appointments:", err)
            if (err.response?.status === 401) {
                setError("Không thể xác thực. Vui lòng kiểm tra phiên đăng nhập.")
            } else if (err.response?.status === 404) {
                setError("Không tìm thấy bác sĩ liên kết với tài khoản này.")
            } else {
                setError("Không thể tải danh sách cuộc hẹn. Vui lòng thử lại sau.")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [userId])

    useEffect(() => {
        if (location.state?.refresh) {
            fetchAppointments()
        }
    }, [location.state])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleViewAppointment = (appointment) => {
        navigate("/dashboard/doctor/view-appointment", {
            state: {
                appointmentData: appointment,
                returnPath: "/dashboard/doctor/appointments",
            },
        })
    }

    const handleCreateMedicalRecord = (appointment) => {
        navigate("/dashboard/doctor/create-medical-record", {
            state: {
                appointmentId: appointment.id,
                patientId: appointment.patient?.id,
                patientName: appointment.patient?.name,
                doctorId: appointment.doctor?.id,
                serviceIds: appointment.serviceIds || [],
            },
        })
    }

    const filteredAppointments = useMemo(() => {
        if (!searchQuery.trim()) {
            return allAppointments
        }

        const query = searchQuery.toLowerCase().trim()
        return allAppointments.filter((appointment) => {
            return (
                (appointment.patient?.name?.toLowerCase() || "").includes(query) ||
                (appointment.appointmentDate || "").includes(query) ||
                (appointment.timeSlot?.toLowerCase() || "").includes(query) ||
                appointment.services.some(service => (service.name?.toLowerCase() || "").includes(query)) ||
                (appointment.notes?.toLowerCase() || "").includes(query)
            )
        })
    }, [allAppointments, searchQuery])

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredAppointments.slice(startIndex, endIndex)
    }, [filteredAppointments, currentPage, itemsPerPage])

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
    }

    const getPageNumbers = () => {
        const pageNumbers = []
        const maxPagesToShow = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
        }

        return pageNumbers
    }

    if (!currentUser) {
        return (
            <div className="appointments">
                <div className="appointments__error">
                    <p>Vui lòng đăng nhập để xem danh sách cuộc hẹn.</p>
                    <button onClick={() => navigate("/login")} className="appointments__retry-button">
                        Đăng nhập
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="appointments">
                <div className="appointments__loading">
                    <div className="appointments__spinner"></div>
                    <p>Đang tải danh sách cuộc hẹn...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="appointments">
                <div className="appointments__error">
                    <p>{error}</p>
                    <button onClick={fetchAppointments} className="appointments__retry-button">
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="doctor-appointments-content">
            {/* Header with search */}
            <div className="doctor-appointments-content__header">
                <div className="doctor-appointments-content__header-content">
                    <div className="doctor-appointments-content__title-section">
                        <CalendarDays className="doctor-appointments-content__title-icon" />
                        <h1 className="doctor-appointments-content__title">Danh sách cuộc hẹn</h1>
                    </div>
                    <div className="doctor-appointments-content__search-container">
                        <div className="doctor-appointments-content__search-wrapper">
                            <Search className="doctor-appointments-content__search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm cuộc hẹn (Tên bệnh nhân, ngày hẹn, dịch vụ...)"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="doctor-appointments-content__search-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="doctor-appointments-content__table-container">
                <div className="doctor-appointments-content__table-header">
                    <div className="doctor-appointments-content__table-header-content">
                        <CalendarDays className="doctor-appointments-content__table-header-icon" />
                        <span className="doctor-appointments-content__table-header-text">
                            Danh sách cuộc hẹn ({filteredAppointments.length} cuộc hẹn)
                        </span>
                    </div>
                </div>

                <div className="doctor-appointments-content__table-wrapper">
                    <table className="doctor-appointments-content__table">
                        <thead>
                        <tr>
                            <th className="doctor-appointments-content__table-head doctor-appointments-content__table-head--number">#</th>
                            <th className="doctor-appointments-content__table-head">Bệnh nhân</th>
                            <th className="doctor-appointments-content__table-head">Ngày hẹn</th>
                            <th className="doctor-appointments-content__table-head">Giờ hẹn</th>
                            <th className="doctor-appointments-content__table-head">Dịch vụ</th>
                            <th className="doctor-appointments-content__table-head">Trạng thái</th>
                            <th className="doctor-appointments-content__table-head">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="doctor-appointments-content__no-results">
                                    {searchQuery ? "Không tìm thấy cuộc hẹn nào phù hợp" : "Chưa có cuộc hẹn"}
                                </td>
                            </tr>
                        ) : (
                            paginatedAppointments.map((appointment, index) => {
                                const status = statusConfig[appointment.status] || statusConfig.CONFIRMED
                                const serviceNames = appointment.services.length > 0
                                    ? appointment.services.map(s => s.name).join(", ")
                                    : "Chưa chọn dịch vụ"
                                return (
                                    <tr key={appointment.id} className="doctor-appointments-content__table-row">
                                        <td className="doctor-appointments-content__table-cell doctor-appointments-content__table-cell--number">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="doctor-appointments-content__table-cell">
                                            <div className="doctor-appointments-content__icon-text">
                                                <User className="doctor-appointments-content__icon" />
                                                <span>{appointment.patient?.name || "Không xác định"}</span>
                                            </div>
                                        </td>
                                        <td className="doctor-appointments-content__table-cell">
                                            <div className="doctor-appointments-content__icon-text">
                                                <Calendar className="doctor-appointments-content__icon" />
                                                <span>{appointment.appointmentDate || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="doctor-appointments-content__table-cell">
                                            <div className="doctor-appointments-content__icon-text">
                                                <Clock className="doctor-appointments-content__icon" />
                                                <span>{appointment.timeSlot || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="doctor-appointments-content__table-cell">
                                            <span className="doctor-appointments-content__service-text">{serviceNames}</span>
                                        </td>
                                        <td className="doctor-appointments-content__table-cell">
                                            <span className={`doctor-appointments-content__status-badge ${status.className}`}>{status.label}</span>
                                        </td>
                                        <td className="doctor-appointments-content__table-cell">
                                            <div className="doctor-appointments-content__actions">
                                                <button
                                                    className="doctor-appointments-content__detail-button"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {appointment.status === "CONFIRMED" && !appointment.hasMedicalRecord && (
                                                    <button
                                                        className="doctor-appointments-content__action-button doctor-appointments-content__action-button--create"
                                                        onClick={() => handleCreateMedicalRecord(appointment)}
                                                        title="Tạo hồ sơ bệnh án"
                                                    >
                                                        Tạo hồ sơ
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Compact Pagination */}
                {filteredAppointments.length > 0 && (
                    <div className="doctor-appointments-content__pagination">
                        <button
                            className="doctor-appointments-content__pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`doctor-appointments-content__pagination-btn ${
                                    currentPage === i + 1 ? 'doctor-appointments-content__pagination-btn--active' : ''
                                }`}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="doctor-appointments-content__pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}