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
    
    // State cho modal hủy cuộc hẹn
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [appointmentToCancel, setAppointmentToCancel] = useState(null)
    const [cancellationReason, setCancellationReason] = useState('')

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
                console.log('Appointments data from API:', appointmentsResponse);
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
    
    // Mở modal hủy cuộc hẹn
    const handleCancelAppointment = (appointmentId) => {
        const appointment = allAppointments.find(app => app.id === appointmentId)
        setAppointmentToCancel(appointment)
        setShowCancelModal(true)
        setCancellationReason('')
    }
    
    // Xác nhận hủy cuộc hẹn
    const confirmCancelAppointment = async () => {
        if (!cancellationReason.trim()) {
            alert('Vui lòng nhập lý do hủy cuộc hẹn')
            return
        }
        
        try {
            setProcessingAction(true)
            const cancelResult = await appointmentService.cancelAppointment(appointmentToCancel.id, cancellationReason)
            
            // Cập nhật lại danh sách cuộc hẹn
            setAllAppointments(prev => 
                prev.map(app => app.id === appointmentToCancel.id ? {
                    ...app, 
                    status: "CANCELED",
                    cancellationReason: cancellationReason,
                    requiresManualRefund: true,
                    refundStatus: 'PENDING_MANUAL_REFUND'
                } : app)
            )
            
            // Hiển thị thông báo về việc cần hoàn tiền thủ công
            if (cancelResult?.paidAmount && cancelResult.paidAmount > 0) {
                toast.success(`Hủy cuộc hẹn thành công! Lưu ý: Cần hoàn tiền thủ công ${cancelResult.paidAmount.toLocaleString('vi-VN')} VNĐ cho bệnh nhân.`)
            } else {
                toast.success("Hủy cuộc hẹn thành công!")
            }
            
            // Đóng modal
            setShowCancelModal(false)
            setAppointmentToCancel(null)
            setCancellationReason('')
            
            // Đóng modal chi tiết nếu đang mở
            if (showDetailModal && selectedAppointment?.id === appointmentToCancel.id) {
                setShowDetailModal(false)
            }
        } catch (err) {
            console.error("Lỗi khi hủy cuộc hẹn:", err)
            const errorMessage = err.response?.data?.message || "Không thể hủy cuộc hẹn. Vui lòng thử lại sau."
            toast.error(errorMessage)
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

    // Format date and time from appointment data
    const formatDateTime = (appointment) => {
        if (!appointment) return { date: "N/A", time: "N/A" }
        
        try {
            let appointmentDateTime;
            
            // Try to use appointmentDate and timeSlot first (like patient page)
            if (appointment.appointmentDate && appointment.timeSlot) {
                const dateStr = appointment.appointmentDate; // "2025-07-15"
                const timeStr = appointment.timeSlot; // "09:00"
                appointmentDateTime = new Date(`${dateStr}T${timeStr}:00`);
            }
            // Fallback to appointmentTime if available
            else if (appointment.appointmentTime) {
                appointmentDateTime = new Date(appointment.appointmentTime);
            }
            // If appointment is a string (legacy format)
            else if (typeof appointment === 'string') {
                appointmentDateTime = new Date(appointment);
            }
            else {
                return { date: "N/A", time: "N/A" };
            }
            
            // Check if date is valid
            if (isNaN(appointmentDateTime.getTime())) {
                return { date: "N/A", time: "N/A" };
            }
            
            const day = appointmentDateTime.getDate().toString().padStart(2, "0")
            const month = (appointmentDateTime.getMonth() + 1).toString().padStart(2, "0")
            const year = appointmentDateTime.getFullYear()
            const hours = appointmentDateTime.getHours().toString().padStart(2, "0")
            const minutes = appointmentDateTime.getMinutes().toString().padStart(2, "0")
            
            return {
                date: `${day}/${month}/${year}`,
                time: `${hours}:${minutes}`,
            }
        } catch (error) {
            console.error('Error formatting date/time:', error);
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
                                placeholder="Tìm cuộc hẹn (Ngày hẹn, bác sĩ, dịch vụ, lý do khám, trạng thái...)"
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
                                <th className="customer-appointments-detail__table-head">Lý do khám</th>
                                <th className="customer-appointments-detail__table-head">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedAppointments.map((appointment, index) => {
                                const status = statusConfig[appointment.status] || statusConfig.UNKNOWN
                                const { date, time } = formatDateTime(appointment)

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
                                                    {appointment.services && appointment.services.length > 0
                                                        ? appointment.services.map(service => service.name).join(", ")
                                                        : appointment.service?.name || "Chưa xác định"}
                                                </div>
                                                <div className="customer-appointments-detail__service-price">
                                                    {appointment.services && appointment.services.length > 0
                                                        ? appointment.services.reduce((total, service) => total + (service.price || 0), 0).toLocaleString('vi-VN') + ' VNĐ'
                                                        : appointment.service?.price
                                                        ? appointment.service.price.toLocaleString('vi-VN') + ' VNĐ'
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
                                                    {selectedAppointment ? formatDateTime(selectedAppointment).date : "N/A"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Giờ hẹn</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {selectedAppointment ? formatDateTime(selectedAppointment).time : "N/A"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Dịch vụ</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {appointmentDetail?.services && appointmentDetail.services.length > 0
                                                        ? appointmentDetail.services.map(service => service.name).join(", ")
                                                        : appointmentDetail?.service?.name || "Chưa xác định"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Lý do khám</div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {appointmentDetail?.notes || "Không có lý do khám"}
                                                </div>
                                            </div>
                                            
                                            {/* Hiển thị lý do hủy nếu cuộc hẹn đã bị hủy */}
                                            {selectedAppointment?.status === "CANCELED" && appointmentDetail?.cancellationReason && (
                                                <div className="appointment-detail-modal__info-item appointment-detail-modal__info-item--cancellation">
                                                    <div className="appointment-detail-modal__info-label">Lý do hủy</div>
                                                    <div className="appointment-detail-modal__info-value appointment-detail-modal__info-value--cancellation">
                                                        {appointmentDetail.cancellationReason}
                                                    </div>
                                                </div>
                                            )}
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
                                                            {appointmentDetail?.services && appointmentDetail.services.length > 0
                                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                                    appointmentDetail.services.reduce((total, service) => total + (service.price || 0), 0)
                                                                  )
                                                                : appointmentDetail?.service?.price 
                                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appointmentDetail.service.price)
                                                                : "0 đ"}
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
                                                                const servicePrice = appointmentDetail?.services && appointmentDetail.services.length > 0
                                                                    ? appointmentDetail.services.reduce((total, service) => total + (service.price || 0), 0)
                                                                    : Number(appointmentDetail?.service?.price || 0);
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
                                                            const servicePrice = appointmentDetail?.services && appointmentDetail.services.length > 0
                                                                ? appointmentDetail.services.reduce((total, service) => total + (service.price || 0), 0)
                                                                : Number(appointmentDetail?.service?.price || 0);
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
            
            {/* Modal hủy cuộc hẹn đơn giản */}
            {showCancelModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '400px',
                        maxWidth: '90%'
                    }}>
                        <h3 style={{margin: '0 0 15px 0'}}>Hủy cuộc hẹn</h3>
                        
                        <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>
                            <p style={{margin: '5px 0'}}><strong>Bệnh nhân:</strong> {appointmentToCancel?.patientName}</p>
                            <p style={{margin: '5px 0'}}><strong>Ngày hẹn:</strong> {appointmentToCancel ? formatDateTime(appointmentToCancel).date : 'N/A'}</p>
                            <p style={{margin: '5px 0'}}><strong>Giờ hẹn:</strong> {appointmentToCancel ? formatDateTime(appointmentToCancel).time : 'N/A'}</p>
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Lý do hủy cuộc hẹn *</label>
                            <textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Vui lòng nhập lý do hủy cuộc hẹn..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        
                        <div style={{textAlign: 'right'}}>
                            <button 
                                onClick={() => {
                                    setShowCancelModal(false)
                                    setAppointmentToCancel(null)
                                    setCancellationReason('')
                                }}
                                disabled={processingAction}
                                style={{
                                    padding: '8px 16px',
                                    marginRight: '10px',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={confirmCancelAppointment}
                                disabled={processingAction || !cancellationReason.trim()}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: processingAction || !cancellationReason.trim() ? 'not-allowed' : 'pointer',
                                    opacity: processingAction || !cancellationReason.trim() ? 0.6 : 1
                                }}
                            >
                                {processingAction ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
