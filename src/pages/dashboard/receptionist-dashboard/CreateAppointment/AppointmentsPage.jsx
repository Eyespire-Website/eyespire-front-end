"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, User, Clock, Search, CalendarDays } from "lucide-react"
import "./AppointmentsPage.css"
import { getAllAppointments } from "../../../../services/appointmentsService"

const statusConfig = {
    PENDING: { label: "Chờ xác nhận", className: "appointments-status-pending" },
    CONFIRMED: { label: "Đã xác nhận", className: "appointments-status-confirmed" },
    COMPLETED: { label: "Đã hoàn thành", className: "appointments-status-completed" },
    CANCELLED: { label: "Đã hủy", className: "appointments-status-cancelled" },
    UNKNOWN: { label: "Không xác định", className: "appointments-status-unknown" }
}

export default function AppointmentsPage() {
    const [allAppointments, setAllAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const itemsPerPage = 5

    // Fetch appointments data
    const fetchAppointments = async () => {
        try {
            setLoading(true)
            const data = await getAllAppointments()
            setAllAppointments(data || [])
        } catch (err) {
            setError("Không thể tải danh sách cuộc hẹn")
            console.error("Failed to fetch appointments:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleViewAppointment = (appointment) => {
        navigate("/dashboard/receptionist/create-appointment", {
            state: {
                appointmentData: appointment,
                mode: "edit",
            },
        })
    }

    // Filter appointments to only show PENDING status and apply search query
    const filteredAppointments = useMemo(() => {
        // First filter to only show PENDING appointments
        const pendingAppointments = allAppointments.filter(appointment => appointment.status === 'PENDING')
        
        // Then apply search query if any
        if (!searchQuery.trim()) {
            return pendingAppointments
        }

        const query = searchQuery.toLowerCase().trim()
        return pendingAppointments.filter((appointment) => {
            return (
                appointment.patientName?.toLowerCase().includes(query) ||
                appointment.appointmentDate?.includes(query) ||
                appointment.timeSlot?.toLowerCase().includes(query) ||
                appointment.notes?.toLowerCase().includes(query) ||
                statusConfig[appointment.status]?.label.toLowerCase().includes(query)
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

    // Generate page numbers for pagination
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
        <div className="appointments">
            <div className="appointments__header">
                <h1 className="appointments__title">Danh sách cuộc hẹn</h1>
                <div className="appointments__search-container">
                    <div className="appointments__search-wrapper">
                        <Search className="appointments__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm cuộc hẹn (Tên bệnh nhân, ngày hẹn, trạng thái...)"
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
              Danh sách tất cả cuộc hẹn ({filteredAppointments.length} cuộc hẹn)
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
                                    {searchQuery ? "Không tìm thấy cuộc hẹn nào phù hợp" : "Chưa có cuộc hẹn nào"}
                                </td>
                            </tr>
                        ) : (
                            paginatedAppointments.map((appointment, index) => {
                                const status = statusConfig[appointment.status] || statusConfig.UNKNOWN
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
                                            <button
                                                className="appointments__detail-button"
                                                onClick={() => handleViewAppointment(appointment)}
                                            >
                                                Xem chi tiết
                                            </button>
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
                            {/* Nút Trước */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="appointments__pagination-button"
                            >
                                Trước
                            </button>

                            {/* Các số trang */}
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

                            {/* Nút Sau */}
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
