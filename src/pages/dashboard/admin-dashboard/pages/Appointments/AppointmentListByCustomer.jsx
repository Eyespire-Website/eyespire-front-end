"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { ArrowLeft, Calendar, Search, Clock } from "lucide-react"
import appointmentService from "../../../../../services/appointmentService"
import userService from "../../../../../services/userService"
import "./AppointmentListByCustomer.css"

const statusConfig = {
    PENDING: { label: "Chờ xác nhận", className: "customer-appointments-status-pending" },
    CONFIRMED: { label: "Đã xác nhận", className: "customer-appointments-status-confirmed" },
    CANCELED: { label: "Đã hủy", className: "customer-appointments-status-cancelled" },
    COMPLETED: { label: "Hoàn thành", className: "customer-appointments-status-completed" },
    UNKNOWN: { label: "Không xác định", className: "customer-appointments-status-unknown" },
}

export default function AppointmentListByCustomer() {
    const { customerId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [allAppointments, setAllAppointments] = useState([])
    const [customerInfo, setCustomerInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch customer info and appointments in parallel
                const [customerResponse, appointmentsResponse] = await Promise.all([
                    userService.getPatientById(customerId),
                    appointmentService.getAppointmentsByPatientId(customerId),
                ])

                setCustomerInfo(customerResponse)
                setAllAppointments(appointmentsResponse || [])
            } catch (err) {
                console.error("Error fetching data:", err)
                setError("Không thể tải thông tin khách hàng và lịch hẹn")
            } finally {
                setLoading(false)
            }
        }

        if (customerId) {
            fetchData()
        }
    }, [customerId])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleBack = () => {
        const fromPage = location.state?.fromPage || 1
        navigate("/dashboard/admin/appointments", { state: { fromPage } })
    }

    // Filter appointments based on search query
    const filteredAppointments = useMemo(() => {
        if (!searchQuery.trim()) {
            return allAppointments
        }

        const query = searchQuery.toLowerCase().trim()
        return allAppointments.filter((appointment) => {
            return (
                appointment.notes?.toLowerCase().includes(query) ||
                appointment.patientName?.toLowerCase().includes(query) ||
                appointment.appointmentTime?.includes(query) ||
                appointment.doctor?.name?.toLowerCase().includes(query) ||
                appointment.doctor?.specialization?.toLowerCase().includes(query) ||
                appointment.service?.name?.toLowerCase().includes(query) ||
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

    // Format date and time from appointmentTime
    const formatDateTime = (appointmentTime) => {
        if (!appointmentTime) return { date: "N/A", time: "N/A" }
        try {
            const date = new Date(appointmentTime)
            return {
                date: date.toLocaleDateString("vi-VN"),
                time: date.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
            }
        } catch (error) {
            return { date: "N/A", time: "N/A" }
        }
    }

    if (loading) {
        return (
            <div className="customer-appointments-detail">
                <div className="customer-appointments-detail__loading">
                    <div className="customer-appointments-detail__spinner"></div>
                    <p>Đang tải thông tin khách hàng và lịch hẹn...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="customer-appointments-detail">
                <div className="customer-appointments-detail__error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="customer-appointments-detail__retry-button">
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="customer-appointments-detail">
            <div className="customer-appointments-detail__header">
                <div className="customer-appointments-detail__header-top">
                    <button onClick={handleBack} className="customer-appointments-detail__back-button">
                        <ArrowLeft className="customer-appointments-detail__back-icon" />
                        Quay lại
                    </button>
                </div>
                <div className="customer-appointments-detail__header-main">
                    <h1 className="customer-appointments-detail__title">
                        Lịch hẹn của: {customerInfo?.name || `khách hàng #${customerId}`}
                    </h1>
                    <div className="customer-appointments-detail__search-container">
                        <div className="customer-appointments-detail__search-wrapper">
                            <Search className="customer-appointments-detail__search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm cuộc hẹn (Ngày hẹn, bác sĩ, dịch vụ, ghi chú, trạng thái...)"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="customer-appointments-detail__search-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="customer-appointments-detail__table-container">
                    <div className="customer-appointments-detail__table-header">
                        <div className="customer-appointments-detail__table-header-content">
                            <Calendar className="customer-appointments-detail__table-header-icon" />
                            <span className="customer-appointments-detail__table-header-text">Danh sách lịch hẹn (0 cuộc hẹn)</span>
                        </div>
                    </div>
                    <div className="customer-appointments-detail__no-results">
                        {searchQuery ? "Không tìm thấy cuộc hẹn nào phù hợp" : "Khách hàng này chưa có cuộc hẹn nào"}
                    </div>
                </div>
            ) : (
                <div className="customer-appointments-detail__table-container">
                    <div className="customer-appointments-detail__table-header">
                        <div className="customer-appointments-detail__table-header-content">
                            <Calendar className="customer-appointments-detail__table-header-icon" />
                            <span className="customer-appointments-detail__table-header-text">
                Danh sách lịch hẹn ({filteredAppointments.length} cuộc hẹn)
              </span>
                        </div>
                    </div>

                    <div className="customer-appointments-detail__table-wrapper">
                        <table className="customer-appointments-detail__table">
                            <thead>
                            <tr>
                                <th className="customer-appointments-detail__table-head customer-appointments-detail__table-head--number">
                                    #
                                </th>
                                <th className="customer-appointments-detail__table-head">Ngày hẹn</th>
                                <th className="customer-appointments-detail__table-head">Giờ hẹn</th>
                                <th className="customer-appointments-detail__table-head">Bác sĩ</th>
                                <th className="customer-appointments-detail__table-head">Dịch vụ</th>
                                <th className="customer-appointments-detail__table-head">Trạng thái</th>
                                <th className="customer-appointments-detail__table-head">Lý do khám</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedAppointments.map((appointment, index) => {
                                const status = statusConfig[appointment.status] || statusConfig.UNKNOWN
                                const { date, time } = formatDateTime(appointment.appointmentTime)

                                return (
                                    <tr key={appointment.id} className="customer-appointments-detail__table-row">
                                        <td className="customer-appointments-detail__table-cell">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__icon-text">
                                                <Calendar className="customer-appointments-detail__icon" />
                                                <span>{date}</span>
                                            </div>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__icon-text">
                                                <Clock className="customer-appointments-detail__icon" />
                                                <span>{time}</span>
                                            </div>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__doctor-info">
                                                <div className="customer-appointments-detail__doctor-name">
                                                    {appointment.doctor?.name || "Chưa xác định"}
                                                </div>
                                                <div className="customer-appointments-detail__doctor-specialty">
                                                    {appointment.doctor?.specialization || ""}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__service-info">
                                                <div className="customer-appointments-detail__service-name">
                                                    {typeof appointment.service === 'string' 
                                                        ? appointment.service 
                                                        : appointment.service?.name || "Chưa xác định"}
                                                </div>
                                                <div className="customer-appointments-detail__service-price">
                                                    {typeof appointment.service === 'string'
                                                        ? ""
                                                        : appointment.service?.price
                                                            ? `${appointment.service.price.toLocaleString('vi-VN')} VNĐ`
                                                            : ""}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                        <span className={`customer-appointments-detail__status-badge ${status.className}`}>
                          {status.label}
                        </span>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__reason-text">
                                                {appointment.notes || "Không có ghi chú"}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="customer-appointments-detail__pagination">
                            <div className="customer-appointments-detail__pagination-info">
                                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAppointments.length)} -{" "}
                                {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} trong tổng số{" "}
                                {filteredAppointments.length} cuộc hẹn
                            </div>
                            <div className="customer-appointments-detail__pagination-controls">
                                {/* Nút Trước */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="customer-appointments-detail__pagination-button"
                                >
                                    Trước
                                </button>

                                {/* Các số trang */}
                                {getPageNumbers().map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`customer-appointments-detail__pagination-button ${
                                            currentPage === pageNum ? "customer-appointments-detail__pagination-button--active" : ""
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                {/* Nút Sau */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="customer-appointments-detail__pagination-button"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
