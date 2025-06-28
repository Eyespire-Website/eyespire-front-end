"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Calendar, User, Clock, Search, CalendarDays } from "lucide-react"
import "./doctor-appointments.css"
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
    COMPLETED: { label: "Hoàn thành", className: "appointments-status-completed" },
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

    // Lấy userId từ người dùng hiện tại
    const currentUser = authService.getCurrentUser()
    const userId = currentUser?.id || null

    // Fetch confirmed and completed appointments for the logged-in doctor
    const fetchAppointments = async () => {
        if (!userId) {
            setError("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await appointmentService.getDoctorAppointmentsByUserId(userId)
            console.log("API Response:", JSON.stringify(data, null, 2))

            // Xử lý và format dữ liệu
            const formattedAppointments = await Promise.all(data.map(async (appointment) => {
                const { date, time } = appointment.appointmentTime
                    ? formatAppointmentTime(appointment.appointmentTime)
                    : { date: appointment.appointmentDate || "N/A", time: appointment.timeSlot || "N/A" }

                const isConfirmedOrCompleted = ["CONFIRMED", "COMPLETED"].includes(appointment.status)
                // Kiểm tra sự tồn tại của hồ sơ bệnh án
                const hasMedicalRecord = await medicalRecordService.checkMedicalRecordExistsByAppointmentId(appointment.id)

                console.log(`Appointment ID ${appointment.id}:`, {
                    isConfirmedOrCompleted,
                    status: appointment.status,
                    appointmentTime: appointment.appointmentTime,
                    appointmentDate: appointment.appointmentDate,
                    timeSlot: appointment.timeSlot,
                    patientId: appointment.patient?.id,
                    patientName: appointment.patient?.name,
                    doctorId: appointment.doctor?.id,
                    formattedDate: date,
                    formattedTime: time,
                    hasMedicalRecord
                })

                return {
                    ...appointment,
                    appointmentDate: date,
                    timeSlot: time,
                    patientId: appointment.patient?.id,
                    patientName: appointment.patient?.name || appointment.patientName,
                    doctorId: appointment.doctor?.id,
                    hasMedicalRecord // Thêm thuộc tính hasMedicalRecord
                }
            }))

            // Lọc các cuộc hẹn có trạng thái CONFIRMED hoặc COMPLETED
            const filteredAppointments = formattedAppointments.filter(
                appointment => ["CONFIRMED", "COMPLETED"].includes(appointment.status)
            )

            console.log("Filtered Appointments:", JSON.stringify(filteredAppointments, null, 2))
            setAllAppointments(filteredAppointments || [])
        } catch (err) {
            console.error("Failed to fetch appointments:", err)
            if (err.response?.status === 401) {
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
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

    // Làm mới danh sách nếu nhận được tín hiệu từ state
    useEffect(() => {
        if (location.state?.refresh) {
            fetchAppointments()
        }
    }, [location.state])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    // Handle view appointment details
    const handleViewAppointment = (appointment) => {
        navigate("/dashboard/doctor/view-appointment", {
            state: {
                appointmentData: appointment,
                mode: "view",
            },
        })
    }



    // Handle create medical record
    const handleCreateMedicalRecord = (appointment) => {
        if (appointment.status !== "CONFIRMED") {
            alert("Chỉ có thể tạo hồ sơ bệnh án cho cuộc hẹn đã xác nhận!")
            return
        }
        navigate("/dashboard/doctor/create-medical-record", {
            state: {
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                doctorId: appointment.doctorId
            },
        })
    }

    // Filter appointments based on search query
    const filteredAppointments = useMemo(() => {
        if (!searchQuery.trim()) {
            return allAppointments
        }

        const query = searchQuery.toLowerCase().trim()
        return allAppointments.filter((appointment) => {
            return (
                (appointment.patientName?.toLowerCase() || "").includes(query) ||
                (appointment.appointmentDate || "").includes(query) ||
                (appointment.timeSlot?.toLowerCase() || "").includes(query) ||
                (appointment.notes?.toLowerCase() || "").includes(query)
            )
        })
    }, [allAppointments, searchQuery])

    // Pagination logic
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
                    {error.includes("đăng nhập") && (
                        <button onClick={() => navigate("/login")} className="appointments__retry-button">
                            Đăng nhập lại
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="appointments">
            <div className="appointments__header">
                <h1 className="appointments__title">Danh sách cuộc hẹn</h1>
                <div className="appointments__search-container">
                    <div className="appointments__search-wrapper">
                        <Search className="appointments__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm cuộc hẹn (Tên bệnh nhân, ngày hẹn...)"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="appointments__search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="appointments__table-container">
                <div className="appointments__table-header">
                    <div className="appointments__table-header-content">
                        <CalendarDays className="appointments__table-header-icon" />
                        <span className="appointments__table-header-text">
                            Danh sách cuộc hẹn ({filteredAppointments.length} cuộc hẹn)
                        </span>
                    </div>
                </div>

                <div className="appointments__table-wrapper">
                    <table className="appointments__table">
                        <thead>
                        <tr>
                            <th className="appointments__table-head appointments__table-head--number">#</th>
                            <th className="appointments__table-head">Bệnh nhân</th>
                            <th className="appointments__table-head">Ngày hẹn</th>
                            <th className="appointments__table-head">Giờ hẹn</th>
                            <th className="appointments__table-head">Trạng thái</th>
                            <th className="appointments__table-head">Lý do khám</th>
                            <th className="appointments__table-head">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="appointments__no-results">
                                    {searchQuery ? "Không tìm thấy cuộc hẹn nào phù hợp" : "Chưa có cuộc hẹn"}
                                </td>
                            </tr>
                        ) : (
                            paginatedAppointments.map((appointment, index) => {
                                const status = statusConfig[appointment.status] || statusConfig.CONFIRMED
                                return (
                                    <tr key={appointment.id} className="appointments__table-row">
                                        <td className="appointments__table-cell">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="appointments__table-cell">
                                            <div className="appointments__icon-text">
                                                <User className="appointments__icon" />
                                                <span>{appointment.patientName || "Không xác định"}</span>
                                            </div>
                                        </td>
                                        <td className="appointments__table-cell">
                                            <div className="appointments__icon-text">
                                                <Calendar className="appointments__icon" />
                                                <span>{appointment.appointmentDate || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="appointments__table-cell">
                                            <div className="appointments__icon-text">
                                                <Clock className="appointments__icon" />
                                                <span>{appointment.timeSlot || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="appointments__table-cell">
                                            <span className={`appointments__status-badge ${status.className}`}>{status.label}</span>
                                        </td>
                                        <td className="appointments__table-cell">
                                            <div className="appointments__reason-text">{appointment.notes || "Không có ghi chú"}</div>
                                        </td>
                                        <td className="appointments__table-cell">
                                            <div className="appointments__actions">
                                                <button
                                                    className="appointments__detail-button"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                >
                                                    Xem chi tiết
                                                </button>

                                                {appointment.status === "CONFIRMED" && !appointment.hasMedicalRecord && (
                                                    <button
                                                        className="appointments__create-record-button"
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

                {totalPages > 1 && (
                    <div className="appointments__pagination">
                        <div className="appointments__pagination-info">
                            Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAppointments.length)} -{" "}
                            {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} trong tổng số{" "}
                            {filteredAppointments.length} cuộc hẹn
                        </div>
                        <div className="appointments__pagination-controls">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="appointments__pagination-button"
                            >
                                Trước
                            </button>
                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`appointments__pagination-button ${
                                        currentPage === pageNum ? "appointments__pagination-button--active" : ""
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="appointments__pagination-button"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}