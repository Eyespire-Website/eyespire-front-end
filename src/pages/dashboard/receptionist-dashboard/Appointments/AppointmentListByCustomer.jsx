"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { ArrowLeft, Calendar, Search, Clock, Eye, XCircle, CheckCircle } from "lucide-react"
import appointmentService from "../../../../services/appointmentService"
import userService from "../../../../services/userService"
import medicalRecordService from "../../../../services/medicalRecordService"
import { toast } from "react-toastify"
import "./AppointmentListByCustomer.css"

const statusConfig = {
    PENDING: { label: "Chờ xác nhận", className: "customer-appointments-status-pending" },
    CONFIRMED: { label: "Đã xác nhận", className: "customer-appointments-status-confirmed" },
    CANCELED: { label: "Đã hủy", className: "customer-appointments-status-cancelled" },
    COMPLETED: { label: "Hoàn thành", className: "customer-appointments-status-completed" },
    WAITING_PAYMENT: { label: "Chờ thanh toán", className: "customer-appointments-status-waiting-payment" },
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
    
    // State cho modal chi tiết cuộc hẹn
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [appointmentDetail, setAppointmentDetail] = useState(null)
    const [invoiceDetail, setInvoiceDetail] = useState(null)
    const [medicationDetails, setMedicationDetails] = useState({ products: [], totalAmount: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [processingAction, setProcessingAction] = useState(false)

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
        navigate("/dashboard/receptionist/appointments", { state: { fromPage } })
    }
    
    // Xem chi tiết cuộc hẹn và thông tin thanh toán
    const handleViewDetail = async (appointment) => {
        try {
            setSelectedAppointment(appointment)
            setLoadingDetail(true)
            setShowDetailModal(true)
            
            // Lấy chi tiết cuộc hẹn
            const detail = await appointmentService.getAppointmentById(appointment.id)
            setAppointmentDetail(detail)
            
            // Lấy thông tin hóa đơn
            try {
                const invoice = await appointmentService.getAppointmentInvoice(appointment.id)
                setInvoiceDetail(invoice)
            } catch (err) {
                console.error("Lỗi khi lấy hóa đơn:", err)
                setInvoiceDetail(null)
            }
            
            // Lấy thông tin thuốc từ hồ sơ y tế
            try {
                const medications = await medicalRecordService.getMedicationsByAppointmentId(appointment.id)
                setMedicationDetails(medications)
                console.log("Medication details:", medications)
            } catch (medicationError) {
                console.log("Không có thông tin thuốc hoặc lỗi khi lấy thông tin thuốc:", medicationError)
                setMedicationDetails({ products: [], totalAmount: 0 })
            }
            
            // Log ra để kiểm tra tính toán
            setTimeout(() => {
                if (detail && invoiceDetail) {
                    const servicePrice = detail.service?.price || 0;
                    const medicationAmount = medicationDetails?.totalAmount || 0;
                    const totalAmount = invoiceDetail.totalAmount || 0;
                    const treatmentCost = totalAmount - servicePrice - medicationAmount;
                    
                    console.log("Tính toán hóa đơn:", {
                        servicePrice,
                        medicationAmount,
                        totalAmount,
                        treatmentCost
                    });
                }
            }, 500);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết cuộc hẹn:", err)
            setError("Không thể tải chi tiết cuộc hẹn. Vui lòng thử lại sau.")
        } finally {
            setLoadingDetail(false)
        }
    }
    
    // Hủy cuộc hẹn
    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này không?")) return
        
        try {
            setProcessingAction(true)
            await appointmentService.cancelAppointment(appointmentId)
            
            // Cập nhật lại danh sách cuộc hẹn
            setAllAppointments(prev => 
                prev.map(app => app.id === appointmentId ? {...app, status: "CANCELED"} : app)
            )
            
            alert("Hủy cuộc hẹn thành công!")
            
            // Đóng modal nếu đang mở
            if (showDetailModal && selectedAppointment?.id === appointmentId) {
                setShowDetailModal(false)
            }
        } catch (err) {
            console.error("Lỗi khi hủy cuộc hẹn:", err)
            alert("Không thể hủy cuộc hẹn. Vui lòng thử lại sau.")
        } finally {
            setProcessingAction(false)
        }
    }
    
    // Xác nhận hoàn thành cuộc hẹn (đã thanh toán)
    const handleCompleteAppointment = async (appointmentId) => {
        if (!window.confirm("Xác nhận bệnh nhân đã thanh toán và hoàn thành cuộc hẹn?")) return
        
        try {
            setProcessingAction(true)
            // Tạo một transactionId tạm thời cho thanh toán trực tiếp
            // Format: CASH-{appointmentId}-{timestamp}
            const transactionId = `CASH-${appointmentId}-${Date.now()}`
            
            // Gọi API với transactionId đã tạo
            await appointmentService.markAppointmentAsPaid(appointmentId, transactionId)
            
            // Cập nhật lại danh sách cuộc hẹn
            setAllAppointments(prev => 
                prev.map(app => app.id === appointmentId ? {...app, status: "COMPLETED"} : app)
            )
            
            alert("Xác nhận thanh toán và hoàn thành cuộc hẹn thành công!")
            
            // Đóng modal nếu đang mở
            if (showDetailModal && selectedAppointment?.id === appointmentId) {
                setShowDetailModal(false)
            }
        } catch (err) {
            console.error("Lỗi khi xác nhận hoàn thành cuộc hẹn:", err)
            alert("Không thể xác nhận hoàn thành cuộc hẹn. Vui lòng thử lại sau.")
        } finally {
            setProcessingAction(false)
        }
    }
    
    // Đóng modal chi tiết
    const handleCloseModal = () => {
        setShowDetailModal(false)
        setSelectedAppointment(null)
        setAppointmentDetail(null)
        setInvoiceDetail(null)
    }

    // Filter appointments based on search query and exclude PENDING status
    const filteredAppointments = useMemo(() => {
        // First filter to exclude appointments with PENDING status
        const nonPendingAppointments = allAppointments.filter(appointment => 
            appointment.status !== 'PENDING' && 
            appointment.status !== 'CHỜ XÁC NHẬN' && 
            statusConfig[appointment.status]?.label !== "Chờ xác nhận"
        );
        
        // Then apply search query if any
        if (!searchQuery.trim()) {
            return nonPendingAppointments;
        }

        const query = searchQuery.toLowerCase().trim();
        return nonPendingAppointments.filter((appointment) => {
            return (
                appointment.notes?.toLowerCase().includes(query) ||
                appointment.patientName?.toLowerCase().includes(query) ||
                appointment.appointmentTime?.includes(query) ||
                appointment.doctor?.name?.toLowerCase().includes(query) ||
                appointment.doctor?.specialization?.toLowerCase().includes(query) ||
                appointment.service?.name?.toLowerCase().includes(query) ||
                statusConfig[appointment.status]?.label.toLowerCase().includes(query)
            );
        });
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
                                <th className="customer-appointments-detail__table-head customer-appointments-detail__table-head--number">#</th>
                                <th className="customer-appointments-detail__table-head">Ngày</th>
                                <th className="customer-appointments-detail__table-head">Giờ</th>
                                <th className="customer-appointments-detail__table-head">Bác sĩ</th>
                                <th className="customer-appointments-detail__table-head">Dịch vụ</th>
                                <th className="customer-appointments-detail__table-head">Trạng thái</th>
                                <th className="customer-appointments-detail__table-head">Ghi chú</th>
                                <th className="customer-appointments-detail__table-head">Thao tác</th>
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
                                                    {appointment.service?.name || "Chưa xác định"}
                                                </div>
                                                <div className="customer-appointments-detail__service-price">
                                                    {appointment.service?.price
                                                        ? ``
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
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__action-buttons">
                                                {/* Nút xem chi tiết - luôn hiển thị */}
                                                <button 
                                                    onClick={() => handleViewDetail(appointment)}
                                                    className="customer-appointments-detail__action-button customer-appointments-detail__action-button--view"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                
                                                {/* Nút hủy cuộc hẹn - chỉ hiển thị khi trạng thái là CONFIRMED */}
                                                {appointment.status === "CONFIRMED" && (
                                                    <button 
                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                        className="customer-appointments-detail__action-button customer-appointments-detail__action-button--cancel"
                                                        title="Hủy cuộc hẹn"
                                                        disabled={processingAction}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                                
                                                {/* Nút xác nhận hoàn thành - chỉ hiển thị khi trạng thái là WAITING_PAYMENT */}
                                                {appointment.status === "WAITING_PAYMENT" && (
                                                    <button 
                                                        onClick={() => handleCompleteAppointment(appointment.id)}
                                                        className="customer-appointments-detail__action-button customer-appointments-detail__action-button--complete"
                                                        title="Xác nhận thanh toán và hoàn thành"
                                                        disabled={processingAction}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
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
            
            {/* Modal chi tiết cuộc hẹn */}
            {showDetailModal && (
                <div className="appointment-detail-modal-overlay" onClick={handleCloseModal}>
                    <div className="appointment-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="appointment-detail-modal__close" onClick={handleCloseModal}>×</button>
                        
                        {loadingDetail ? (
                            <div className="appointment-detail-modal__loading">
                                <div className="appointment-detail-modal__spinner"></div>
                                <p>Đang tải thông tin chi tiết...</p>
                            </div>
                        ) : (
                            <>
                                <div className="appointment-detail-modal__header">
                                    <h2 className="appointment-detail-modal__title">Chi tiết cuộc hẹn</h2>
                                    <p className="appointment-detail-modal__subtitle">
                                        Mã cuộc hẹn: #{selectedAppointment?.id} - 
                                        <span className={`customer-appointments-detail__status-badge ${statusConfig[selectedAppointment?.status]?.className || statusConfig.UNKNOWN.className}`}>
                                            {statusConfig[selectedAppointment?.status]?.label || statusConfig.UNKNOWN.label}
                                        </span>
                                    </p>
                                </div>
                                
                                <div className="appointment-detail-modal__content">
                                    <div className="appointment-detail-modal__section">
                                        <h3 className="appointment-detail-modal__section-title">
                                            <Calendar size={18} /> Thông tin cuộc hẹn
                                        </h3>
                                        <div className="appointment-detail-modal__info-grid">
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Ngày hẹn</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {selectedAppointment?.appointmentTime ? new Date(selectedAppointment.appointmentTime).toLocaleDateString("vi-VN") : "N/A"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Giờ hẹn</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {selectedAppointment?.appointmentTime ? new Date(selectedAppointment.appointmentTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Dịch vụ</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {appointmentDetail?.service?.name || "Chưa xác định"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Ghi chú</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {appointmentDetail?.notes || "Không có ghi chú"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="appointment-detail-modal__section">
                                        <h3 className="appointment-detail-modal__section-title">
                                            <Eye size={18} /> Thông tin bệnh nhân
                                        </h3>
                                        <div className="appointment-detail-modal__info-grid">
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Tên bệnh nhân</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {customerInfo?.name || "Chưa xác định"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Số điện thoại</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {customerInfo?.phone || "Chưa xác định"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Email</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {customerInfo?.email || "Chưa xác định"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="appointment-detail-modal__section">
                                    <h3 className="appointment-detail-modal__section-title">
                                        <Clock size={18} /> Thông tin bác sĩ
                                    </h3>
                                    <div className="appointment-detail-modal__info-grid">
                                        <div className="appointment-detail-modal__info-item">
                                            <div className="appointment-detail-modal__info-label">Tên bác sĩ</div>
                                            <div className="appointment-detail-modal__info-value">
                                                {appointmentDetail?.doctor?.name || "Chưa xác định"}
                                            </div>
                                        </div>
                                        <div className="appointment-detail-modal__info-item">
                                            <div className="appointment-detail-modal__info-label">Chuyên khoa</div>
                                            <div className="appointment-detail-modal__info-value">
                                                {appointmentDetail?.doctor?.specialization || "Chưa xác định"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Hiển thị thông tin hóa đơn nếu có */}
                                {(selectedAppointment?.status === "WAITING_PAYMENT" || selectedAppointment?.status === "COMPLETED" || selectedAppointment?.status === "CONFIRMED") && (
                                    <div className="appointment-detail-modal__section">
                                        <h3 className="appointment-detail-modal__section-title">
                                            <Clock size={18} /> Thông tin thanh toán
                                        </h3>
                                        
                                        {invoiceDetail ? (
                                            <div className="appointment-detail-modal__invoice">
                                                <div className="appointment-detail-modal__invoice-header">
                                                    <div className="appointment-detail-modal__invoice-title">Hóa đơn #{invoiceDetail.id}</div>
                                                    <div className={`appointment-detail-modal__invoice-status ${selectedAppointment?.status === "COMPLETED" ? "appointment-detail-modal__invoice-status--paid" : "appointment-detail-modal__invoice-status--waiting"}`}>
                                                        {selectedAppointment?.status === "COMPLETED" ? "Đã thanh toán" : "Chờ thanh toán"}
                                                    </div>
                                                </div>
                                                
                                                <div className="appointment-detail-modal__invoice-items">
                                                    {/* Phí dịch vụ khám */}
                                                    <div className="appointment-detail-modal__invoice-item">
                                                        <div>Phí dịch vụ khám</div>
                                                        <div>
                                                            {appointmentDetail?.service?.price ? 
                                                                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appointmentDetail.service.price) : 
                                                                "0 đ"}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Tiền thuốc */}
                                                    {medicationDetails && medicationDetails.totalAmount > 0 && (
                                                        <div className="appointment-detail-modal__invoice-item">
                                                            <div>Tiền thuốc</div>
                                                            <div>
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(medicationDetails.totalAmount)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Không có chi phí điều trị */}
                                                    
                                                    {/* Tạm tính */}
                                                    <div className="appointment-detail-modal__invoice-subtotal">
                                                        <div>Tạm tính</div>
                                                        <div>
                                                            {(() => {
                                                                // Tính lại tạm tính = phí dịch vụ khám + tiền thuốc
                                                                const servicePrice = Number(appointmentDetail?.service?.price || 0);
                                                                const medicationAmount = Number(medicationDetails?.totalAmount || 0);
                                                                const calculatedTotal = servicePrice + medicationAmount;
                                                                
                                                                console.log('Tính toán tạm tính:', {
                                                                    servicePrice,
                                                                    medicationAmount,
                                                                    calculatedTotal
                                                                });
                                                                
                                                                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculatedTotal);
                                                            })()}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Tiền cọc */}
                                                    {invoiceDetail.depositAmount > 0 && (
                                                        <div className="appointment-detail-modal__invoice-item appointment-detail-modal__invoice-item--deposit">
                                                            <div>Tiền cọc đã thanh toán</div>
                                                            <div>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoiceDetail.depositAmount)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="appointment-detail-modal__invoice-total">
                                                    <div>Số tiền cần thanh toán</div>
                                                    <div>
                                                        {(() => {
                                                            // Tính lại số tiền cần thanh toán = phí dịch vụ + tiền thuốc - tiền cọc
                                                            const servicePrice = Number(appointmentDetail?.service?.price || 0);
                                                            const medicationAmount = Number(medicationDetails?.totalAmount || 0);
                                                            const depositAmount = Number(invoiceDetail?.depositAmount || 0);
                                                            
                                                            // Tổng = phí dịch vụ + tiền thuốc
                                                            const subtotal = servicePrice + medicationAmount;
                                                            
                                                            // Số tiền cần thanh toán = tổng - tiền cọc
                                                            const finalAmount = subtotal - depositAmount;
                                                            
                                                            console.log('Tính toán số tiền cần thanh toán:', {
                                                                servicePrice,
                                                                medicationAmount,
                                                                subtotal,
                                                                depositAmount,
                                                                finalAmount
                                                            });
                                                            
                                                            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalAmount);
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>Đang tải thông tin hóa đơn...</p>
                                        )}
                                    </div>
                                )}
                                
                                <div className="appointment-detail-modal__actions">
                                    {/* Nút hủy cuộc hẹn - chỉ hiển thị khi trạng thái là CONFIRMED */}
                                    {selectedAppointment?.status === "CONFIRMED" && (
                                        <button 
                                            onClick={() => handleCancelAppointment(selectedAppointment.id)}
                                            className="appointment-detail-modal__button appointment-detail-modal__button--cancel"
                                            disabled={processingAction}
                                        >
                                            <XCircle size={18} /> Hủy cuộc hẹn
                                        </button>
                                    )}
                                    
                                    {/* Nút xác nhận hoàn thành - chỉ hiển thị khi trạng thái là WAITING_PAYMENT */}
                                    {selectedAppointment?.status === "WAITING_PAYMENT" && (
                                        <button 
                                            onClick={() => handleCompleteAppointment(selectedAppointment.id)}
                                            className="appointment-detail-modal__button appointment-detail-modal__button--complete"
                                            disabled={processingAction}
                                        >
                                            <CheckCircle size={18} /> Xác nhận thanh toán và hoàn thành
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={handleCloseModal}
                                        className="appointment-detail-modal__button appointment-detail-modal__button--close"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
