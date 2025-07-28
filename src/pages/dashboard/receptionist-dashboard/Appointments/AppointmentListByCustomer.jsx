"use client"

import {useParams, useNavigate, useLocation} from "react-router-dom"
import {useEffect, useState, useMemo} from "react"
import {ArrowLeft, Calendar, Search, Clock, Eye, XCircle, CheckCircle, FileText} from "lucide-react"
import appointmentService from "../../../../services/appointmentService"
import userService from "../../../../services/userService"
import medicalRecordService from "../../../../services/medicalRecordService"
import {toast} from "react-toastify"
import "./AppointmentListByCustomer.css"

const statusConfig = {
    PENDING: {label: "Chờ xác nhận", className: "customer-appointments-status-pending"},
    CONFIRMED: {label: "Đã xác nhận", className: "customer-appointments-status-confirmed"},
    DOCTOR_FINISHED: {label: "Bác sĩ đã khám xong", className: "customer-appointments-status-doctor-finished"},
    WAITING_PAYMENT: {label: "Chờ thanh toán", className: "customer-appointments-status-waiting-payment"},
    COMPLETED: {label: "Hoàn thành", className: "customer-appointments-status-completed"},
    CANCELED: {label: "Đã hủy", className: "customer-appointments-status-cancelled"},
    NO_SHOW: {label: "Không đến", className: "customer-appointments-status-no-show"},
    UNKNOWN: {label: "Không xác định", className: "customer-appointments-status-unknown"},
}

const prescriptionStatusConfig = {
    NOT_BUY: {label: "Không mua thuốc", className: "prescription-status-not-buy"},
    PENDING: {label: "Chờ nhận thuốc", className: "prescription-status-pending"},
    DELIVERED: {label: "Đã nhận thuốc", className: "prescription-status-delivered"},
    UNKNOWN: {label: "Không xác định", className: "prescription-status-unknown"},
}

export default function AppointmentListByCustomer() {
    const {customerId} = useParams()
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
    const [medicationDetails, setMedicationDetails] = useState({
        products: [],
        totalAmount: 0,
        prescriptionStatus: "UNKNOWN"
    })
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [processingAction, setProcessingAction] = useState(false)

    // State cho modal hủy cuộc hẹn
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [appointmentToCancel, setAppointmentToCancel] = useState(null)
    const [cancellationReason, setCancellationReason] = useState('')

    // State cho modal tạo hóa đơn
    const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false)
    const [appointmentToCreateInvoice, setAppointmentToCreateInvoice] = useState(null)
    const [includeMedications, setIncludeMedications] = useState(false)
    const [availableMedications, setAvailableMedications] = useState([])
    const [selectedMedications, setSelectedMedications] = useState([])
    const [loadingMedications, setLoadingMedications] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const [customerResponse, appointmentsResponse] = await Promise.all([
                    userService.getPatientById(customerId),
                    appointmentService.getAppointmentsByPatientId(customerId),
                ])

                setCustomerInfo(customerResponse)
                console.log('Appointments data from API:', appointmentsResponse)
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

    // Fetch medications when opening create invoice modal
    const fetchMedicationsForAppointment = async (appointmentId) => {
        try {
            setLoadingMedications(true)
            const medications = await medicalRecordService.getMedicationsByAppointmentId(appointmentId)
            console.log("Medications from API:", medications)

            if (!medications || !medications.products || medications.products.length === 0) {
                console.warn("No medications found for appointment ID:", appointmentId)
                setAvailableMedications([])
                setSelectedMedications([])
                setMedicationDetails({products: [], totalAmount: 0, prescriptionStatus: "NOT_BUY"})
                return
            }

            const productDetails = medications.products.map((med) => ({
                id: med.id,
                name: med.name,
                price: med.price,
                quantity: med.quantity || 1,
            }))

            setAvailableMedications(productDetails)
            setSelectedMedications(
                productDetails.map((med) => ({
                    id: med.id,
                    name: med.name,
                    quantity: med.quantity || 1,
                }))
            )
            setMedicationDetails({
                products: medications.products,
                totalAmount: medications.totalAmount,
                prescriptionStatus: medications.prescriptionStatus || "NOT_BUY"
            })
        } catch (err) {
            console.error("Lỗi khi lấy danh sách thuốc:", err)
            setAvailableMedications([])
            setSelectedMedications([])
            setMedicationDetails({products: [], totalAmount: 0, prescriptionStatus: "UNKNOWN"})
            toast.error(
                err.response?.status === 400
                    ? "Dữ liệu thuốc không hợp lệ. Vui lòng kiểm tra lại."
                    : "Không thể tải danh sách thuốc. Vui lòng thử lại."
            )
        } finally {
            setLoadingMedications(false)
        }
    }

    const handleBack = () => {
        const fromPage = location.state?.fromPage || 1
        navigate("/dashboard/receptionist/appointments", {state: {fromPage}})
    }

    const handleViewDetail = async (appointment) => {
        try {
            setSelectedAppointment(appointment);
            setLoadingDetail(true);
            setShowDetailModal(true);

            // Fetch appointment details
            const detail = await appointmentService.getAppointmentById(appointment.id);
            setAppointmentDetail(detail);

            let invoice = null;
            let medications = {products: [], totalAmount: 0, prescriptionStatus: "NOT_BUY"};

            // Fetch invoice details if applicable
            if (appointment.status === "WAITING_PAYMENT" || appointment.status === "COMPLETED") {
                try {
                    invoice = await appointmentService.getAppointmentInvoice(appointment.id);
                    setInvoiceDetail(invoice);
                } catch (err) {
                    console.error("Lỗi khi lấy hóa đơn:", err);
                    setInvoiceDetail(null);
                }
            } else {
                setInvoiceDetail(null);
            }

            // Fetch medication details
            try {
                const medicationData = await medicalRecordService.getMedicationsByAppointmentId(appointment.id);
                console.log("Medication response:", medicationData);
                const prescriptionStatus = invoice?.prescriptionStatus || medicationData.prescriptionStatus || "NOT_BUY";
                medications = {
                    products: prescriptionStatus === "NOT_BUY" ? [] : (medicationData.products || []),
                    totalAmount: prescriptionStatus === "NOT_BUY" ? 0 : (medicationData.totalAmount || 0),
                    prescriptionStatus
                };
                console.log("Invoice response:", invoice);
            } catch (medicationError) {
                console.log("Không có thông tin thuốc hoặc lỗi:", medicationError);
                // Fallback to invoice's prescriptionStatus if available
                medications.prescriptionStatus = invoice?.prescriptionStatus || "NOT_BUY";
                medications.products = [];
                medications.totalAmount = 0;
            }

            setMedicationDetails(medications);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết cuộc hẹn:", err);
            setError("Không thể tải chi tiết cuộc hẹn. Vui lòng thử lại sau.");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Mở modal tạo hóa đơn
    const handleCreateInvoice = async (appointment) => {
        setAppointmentToCreateInvoice(appointment)
        setIncludeMedications(false)
        setAvailableMedications([])
        setSelectedMedications([])
        setShowCreateInvoiceModal(true)
        await fetchMedicationsForAppointment(appointment.id)
    }

    // Xác nhận tạo hóa đơn
    const confirmCreateInvoice = async () => {
        if (!appointmentToCreateInvoice) {
            toast.error("Không tìm thấy thông tin cuộc hẹn để cập nhật hóa đơn.")
            return
        }

        let existingInvoice = null
        try {
            existingInvoice = await appointmentService.getAppointmentInvoice(appointmentToCreateInvoice.id)
        } catch (err) {
            if (err.response?.status !== 404) {
                toast.error("Lỗi khi kiểm tra hóa đơn. Vui lòng thử lại.")
                return
            }
        }

        // Kiểm tra xem hóa đơn đã tồn tại chưa
        if (!existingInvoice) {
            toast.error("Không tìm thấy hóa đơn hiện có để cập nhật.")
            return
        }

        const action = "cập nhật"
        if (!window.confirm(`Bạn có chắc muốn ${action} hóa đơn cho cuộc hẹn này?`)) return

        try {
            setProcessingAction(true)
            const serviceIds = appointmentToCreateInvoice.services?.map(service => service.id) || []
            const medications = includeMedications ? selectedMedications.map(med => {
                const medInfo = availableMedications.find(m => m.id === med.id)
                return {
                    id: med.id,
                    quantity: med.quantity,
                    price: medInfo?.price || 0
                }
            }) : []

            console.log(`Updating invoice with payload:`, {
                appointmentId: appointmentToCreateInvoice.id,
                serviceIds,
                includeMedications,
                medications
            })

            const updatedAppointment = await appointmentService.updateInvoiceAndSetWaitingPayment(
                appointmentToCreateInvoice.id,
                serviceIds,
                includeMedications,
                medications
            )

            setAllAppointments(prev =>
                prev.map(app => app.id === appointmentToCreateInvoice.id ? {
                    ...app,
                    status: "WAITING_PAYMENT",
                    ...updatedAppointment
                } : app)
            )

            toast.success(`Cập nhật hóa đơn thành công! Tổng chi phí: ${formatCurrency(totalCost)}`)
            setShowCreateInvoiceModal(false)
            setAppointmentToCreateInvoice(null)
            setSelectedMedications([])
            setIncludeMedications(false)
            if (showDetailModal && selectedAppointment?.id === appointmentToCreateInvoice.id) {
                setShowDetailModal(false)
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật hóa đơn:", err)
            const errorMessage = err.response?.status === 500
                ? "Lỗi server khi cập nhật hóa đơn. Vui lòng kiểm tra cấu hình server hoặc liên hệ quản trị viên."
                : err.response?.status === 404
                    ? "Không tìm thấy hóa đơn để cập nhật."
                    : err.response?.data?.message || "Không thể cập nhật hóa đơn. Vui lòng thử lại sau."
            toast.error(errorMessage)
        } finally {
            setProcessingAction(false)
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
            toast.error('Vui lòng nhập lý do hủy cuộc hẹn')
            return
        }

        try {
            setProcessingAction(true)
            const cancelResult = await appointmentService.cancelAppointment(appointmentToCancel.id, cancellationReason)

            setAllAppointments(prev =>
                prev.map(app => app.id === appointmentToCancel.id ? {
                    ...app,
                    status: "CANCELED",
                    cancellationReason: cancellationReason,
                    requiresManualRefund: true,
                    refundStatus: 'PENDING_MANUAL_REFUND'
                } : app)
            )

            if (cancelResult?.paidAmount && cancelResult.paidAmount > 0) {
                toast.success(`Hủy cuộc hẹn thành công! Cần hoàn tiền thủ công ${cancelResult.paidAmount.toLocaleString('vi-VN')} VNĐ.`)
            } else {
                toast.success("Hủy cuộc hẹn thành công!")
            }

            setShowCancelModal(false)
            setAppointmentToCancel(null)
            setCancellationReason('')

            if (showDetailModal && selectedAppointment?.id === appointmentToCancel.id) {
                setShowDetailModal(false)
            }
        } catch (err) {
            console.error("Lỗi khi hủy cuộc hẹn:", err)
            toast.error(err.response?.data?.message || "Không thể hủy cuộc hẹn. Vui lòng thử lại sau.")
        } finally {
            setProcessingAction(false)
        }
    }

    // Xác nhận hoàn thành cuộc hẹn
    const handleCompleteAppointment = async (appointmentId) => {
        if (!window.confirm("Xác nhận bệnh nhân đã thanh toán và hoàn thành cuộc hẹn?")) return

        try {
            setProcessingAction(true)
            const transactionId = `CASH-${appointmentId}-${Date.now()}`
            await appointmentService.markAppointmentAsPaid(appointmentId, transactionId)

            setAllAppointments(prev =>
                prev.map(app => app.id === appointmentId ? {...app, status: "COMPLETED"} : app)
            )

            toast.success("Xác nhận thanh toán và hoàn thành cuộc hẹn thành công!")
            if (showDetailModal && selectedAppointment?.id === appointmentId) {
                setShowDetailModal(false)
            }
        } catch (err) {
            console.error("Lỗi khi xác nhận hoàn thành:", err)
            toast.error("Không thể xác nhận hoàn thành cuộc hẹn. Vui lòng thử lại sau.")
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
        setMedicationDetails({products: [], totalAmount: 0, prescriptionStatus: "UNKNOWN"})
    }

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        const nonPendingAppointments = allAppointments.filter(appointment =>
            appointment.status !== 'PENDING' &&
            appointment.status !== 'CHỜ XÁC NHẬN' &&
            statusConfig[appointment.status]?.label !== "Chờ xác nhận"
        )

        if (!searchQuery.trim()) {
            return nonPendingAppointments
        }

        const query = searchQuery.toLowerCase().trim()
        return nonPendingAppointments.filter((appointment) => {
            return (
                appointment.notes?.toLowerCase().includes(query) ||
                appointment.patientName?.toLowerCase().includes(query) ||
                appointment.appointmentTime?.includes(query) ||
                appointment.doctor?.name?.toLowerCase().includes(query) ||
                appointment.doctor?.specialization?.toLowerCase().includes(query) ||
                appointment.services?.some(service => service.name?.toLowerCase().includes(query)) ||
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

    const formatDateTime = (appointment) => {
        if (!appointment) return {date: "N/A", time: "N/A"}

        try {
            let appointmentDateTime
            if (appointment.appointmentDate && appointment.timeSlot) {
                const dateStr = appointment.appointmentDate
                const timeStr = appointment.timeSlot
                appointmentDateTime = new Date(`${dateStr}T${timeStr}:00`)
            } else if (appointment.appointmentTime) {
                appointmentDateTime = new Date(appointment.appointmentTime)
            } else {
                return {date: "N/A", time: "N/A"}
            }

            if (isNaN(appointmentDateTime.getTime())) {
                return {date: "N/A", time: "N/A"}
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
            console.error('Error formatting date/time:', error)
            return {date: "N/A", time: "N/A"}
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const totalServiceCost = appointmentToCreateInvoice?.services?.reduce((total, service) => total + (service.price || 0), 0) || 0
    const totalMedicationCost = includeMedications ? selectedMedications.reduce((total, med) => {
        const medInfo = availableMedications.find(m => m.id === med.id)
        return total + (medInfo?.price || 0) * med.quantity
    }, 0) : 0
    const totalCost = totalServiceCost + totalMedicationCost - 10000

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
                    <button onClick={() => window.location.reload()}
                            className="customer-appointments-detail__retry-button">
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
                        <ArrowLeft className="customer-appointments-detail__back-icon"/>
                        Quay lại
                    </button>
                </div>
                <div className="customer-appointments-detail__header-main">
                    <h1 className="customer-appointments-detail__title">
                        Lịch hẹn của: {customerInfo?.name || `khách hàng #${customerId}`}
                    </h1>
                    <div className="customer-appointments-detail__search-container">
                        <div className="customer-appointments-detail__search-wrapper">
                            <Search className="customer-appointments-detail__search-icon"/>
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
                            <Calendar className="customer-appointments-detail__table-header-icon"/>
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
                            <Calendar className="customer-appointments-detail__table-header-icon"/>
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
                                const {date, time} = formatDateTime(appointment)

                                return (
                                    <tr key={appointment.id} className="customer-appointments-detail__table-row">
                                        <td className="customer-appointments-detail__table-cell">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__icon-text">
                                                <Calendar className="customer-appointments-detail__icon"/>
                                                <span>{date}</span>
                                            </div>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <div className="customer-appointments-detail__icon-text">
                                                <Clock className="customer-appointments-detail__icon"/>
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
                                                        ? formatCurrency(appointment.services.reduce((total, service) => total + (service.price || 0), 0))
                                                        : appointment.service?.price
                                                            ? formatCurrency(appointment.service.price)
                                                            : ""}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="customer-appointments-detail__table-cell">
                                            <span
                                                className={`customer-appointments-detail__status-badge ${status.className}`}>
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
                                                <button
                                                    onClick={() => handleViewDetail(appointment)}
                                                    className="customer-appointments-detail__action-button customer-appointments-detail__action-button--view"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16}/>
                                                </button>
                                                {appointment.status === "CONFIRMED" && (
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                        className="customer-appointments-detail__action-button customer-appointments-detail__action-button--cancel"
                                                        title="Hủy cuộc hẹn"
                                                        disabled={processingAction}
                                                    >
                                                        <XCircle size={16}/>
                                                    </button>
                                                )}
                                                {appointment.status === "DOCTOR_FINISHED" && (
                                                    <button
                                                        onClick={() => handleCreateInvoice(appointment)}
                                                        className="customer-appointments-detail__action-button customer-appointments-detail__action-button--create-invoice"
                                                        title="Tạo hóa đơn"
                                                        disabled={processingAction}
                                                    >
                                                        <FileText size={16}/>
                                                    </button>
                                                )}
                                                {appointment.status === "WAITING_PAYMENT" && (
                                                    <button
                                                        onClick={() => handleCompleteAppointment(appointment.id)}
                                                        className="customer-appointments-detail__action-button customer-appointments-detail__action-button--complete"
                                                        title="Xác nhận thanh toán và hoàn thành"
                                                        disabled={processingAction}
                                                    >
                                                        <CheckCircle size={16}/>
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
                                Hiển
                                thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAppointments.length)} -{" "}
                                {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} trong tổng số{" "}
                                {filteredAppointments.length} cuộc hẹn
                            </div>
                            <div className="customer-appointments-detail__pagination-controls">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="customer-appointments-detail__pagination-button"
                                >
                                    Trước
                                </button>
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
                                        <span
                                            className={`customer-appointments-detail__status-badge ${statusConfig[selectedAppointment?.status]?.className || statusConfig.UNKNOWN.className}`}
                                        >
                                            {statusConfig[selectedAppointment?.status]?.label || statusConfig.UNKNOWN.label}
                                        </span>
                                        {selectedAppointment?.status === 'COMPLETED' &&
                                            medicationDetails?.prescriptionStatus && (
                                                <>
                                                    {" - "}
                                                    <span
                                                        className={`prescription-status-badge ${prescriptionStatusConfig[medicationDetails.prescriptionStatus]?.className || prescriptionStatusConfig.UNKNOWN.className}`}
                                                    >
                {prescriptionStatusConfig[medicationDetails.prescriptionStatus]?.label || prescriptionStatusConfig.UNKNOWN.label}
            </span>
                                                </>
                                            )}
                                    </p>
                                </div>
                                <div className="appointment-detail-modal__content">
                                    <div className="appointment-detail-modal__section">
                                        <h3 className="appointment-detail-modal__section-title">
                                            <Calendar size={18}/> Thông tin cuộc hẹn
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
                                            {selectedAppointment?.status === "CANCELED" && appointmentDetail?.cancellationReason && (
                                                <div
                                                    className="appointment-detail-modal__info-item appointment-detail-modal__info-item--cancellation">
                                                    <div className="appointment-detail-modal__info-label">Lý do hủy
                                                    </div>
                                                    <div
                                                        className="appointment-detail-modal__info-value appointment-detail-modal__info-value--cancellation">
                                                        {appointmentDetail.cancellationReason}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="appointment-detail-modal__section">
                                        <h3 className="appointment-detail-modal__section-title">
                                            <Eye size={18}/> Thông tin bệnh nhân
                                        </h3>
                                        <div className="appointment-detail-modal__info-grid">
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Tên bệnh nhân
                                                </div>
                                                <div className="appointment-detail-modal__info-value">
                                                    {customerInfo?.name || "Chưa xác định"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__info-item">
                                                <div className="appointment-detail-modal__info-label">Số điện thoại
                                                </div>
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
                                    <div className="appointment-detail-modal__section">
                                        <h3 className="appointment-detail-modal__section-title">
                                            <Clock size={18}/> Thông tin bác sĩ
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
                                    {(selectedAppointment?.status === "WAITING_PAYMENT" || selectedAppointment?.status === "COMPLETED") && invoiceDetail && (
                                        <div className="appointment-detail-modal__section">
                                            <h3 className="appointment-detail-modal__section-title">
                                                <Clock size={18}/> Thông tin thanh toán
                                            </h3>
                                            <div className="appointment-detail-modal__invoice">
                                                <div className="appointment-detail-modal__invoice-header">
                                                    <div className="appointment-detail-modal__invoice-title">Hóa đơn
                                                        #{invoiceDetail.id}</div>
                                                    {/* CHANGED: Display prescriptionStatus for COMPLETED, keep Chờ thanh toán for WAITING_PAYMENT */}
                                                    <div
                                                        className={`appointment-detail-modal__invoice-status ${
                                                            selectedAppointment?.status === "COMPLETED"
                                                                ? prescriptionStatusConfig[medicationDetails.prescriptionStatus]?.className || prescriptionStatusConfig.UNKNOWN.className
                                                                : "appointment-detail-modal__invoice-status--waiting"
                                                        }`}
                                                    >
                                                        {selectedAppointment?.status === "COMPLETED"
                                                            ? prescriptionStatusConfig[medicationDetails.prescriptionStatus]?.label || prescriptionStatusConfig.UNKNOWN.label
                                                            : "Chờ thanh toán"}
                                                    </div>
                                                    {/* END CHANGE */}
                                                </div>
                                                <div className="appointment-detail-modal__invoice-items">
                                                    <div className="appointment-detail-modal__invoice-item">
                                                        <div>Phí dịch vụ khám</div>
                                                        <div>
                                                            {appointmentDetail?.services && appointmentDetail.services.length > 0
                                                                ? formatCurrency(
                                                                    appointmentDetail.services.reduce((total, service) => total + (service.price || 0), 0)
                                                                )
                                                                : appointmentDetail?.service?.price
                                                                    ? formatCurrency(appointmentDetail.service.price)
                                                                    : "0 đ"}
                                                        </div>
                                                    </div>
                                                    {medicationDetails && medicationDetails.totalAmount > 0 && medicationDetails.prescriptionStatus !== "NOT_BUY" && (
                                                        <div className="appointment-detail-modal__invoice-item">
                                                            <div>Tiền thuốc</div>
                                                            <div>{formatCurrency(medicationDetails.totalAmount)}</div>
                                                        </div>
                                                    )}
                                                    <div className="appointment-detail-modal__invoice-subtotal">
                                                        <div>Tạm tính</div>
                                                        <div>
                                                            {(() => {
                                                                const servicePrice = appointmentDetail?.services && appointmentDetail.services.length > 0
                                                                    ? appointmentDetail.services.reduce((total, service) => total + (service.price || 0), 0)
                                                                    : Number(appointmentDetail?.service?.price || 0)
                                                                const medicationAmount = medicationDetails.prescriptionStatus === "NOT_BUY" ? 0 : Number(medicationDetails?.totalAmount || 0)
                                                                const calculatedTotal = servicePrice + medicationAmount
                                                                return formatCurrency(calculatedTotal)
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="appointment-detail-modal__invoice-item appointment-detail-modal__invoice-item--deposit">
                                                        <div>Tiền cọc đã thanh toán</div>
                                                        <div>-{formatCurrency(10000)}</div>
                                                    </div>
                                                    <div className="appointment-detail-modal__invoice-total">
                                                        <div>Số tiền cần thanh toán</div>
                                                        <div>
                                                            {(() => {
                                                                const servicePrice = appointmentDetail?.services && appointmentDetail.services.length > 0
                                                                    ? appointmentDetail.services.reduce((total, service) => total + (service.price || 0), 0)
                                                                    : Number(appointmentDetail?.service?.price || 0)
                                                                const medicationAmount = medicationDetails.prescriptionStatus === "NOT_BUY" ? 0 : Number(medicationDetails?.totalAmount || 0)
                                                                const finalAmount = servicePrice + medicationAmount - 10000
                                                                return formatCurrency(finalAmount)
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="appointment-detail-modal__actions">
                                    {selectedAppointment?.status === "CONFIRMED" && (
                                        <button
                                            onClick={() => handleCancelAppointment(selectedAppointment.id)}
                                            className="appointment-detail-modal__button appointment-detail-modal__button--cancel"
                                            disabled={processingAction}
                                        >
                                            <XCircle size={18}/> Hủy cuộc hẹn
                                        </button>
                                    )}
                                    {selectedAppointment?.status === "DOCTOR_FINISHED" && (
                                        <button
                                            onClick={() => handleCreateInvoice(selectedAppointment)}
                                            className="appointment-detail-modal__button appointment-detail-modal__button--create-invoice"
                                            disabled={processingAction}
                                        >
                                            <FileText size={18}/> Tạo hóa đơn
                                        </button>
                                    )}
                                    {selectedAppointment?.status === "WAITING_PAYMENT" && (
                                        <button
                                            onClick={() => handleCompleteAppointment(selectedAppointment.id)}
                                            className="appointment-detail-modal__button appointment-detail-modal__button--complete"
                                            disabled={processingAction}
                                        >
                                            <CheckCircle size={18}/> Xác nhận thanh toán và hoàn thành
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

            {/* Modal tạo hóa đơn */}
            {showCreateInvoiceModal && (
                <div className="create-invoice-modal-overlay">
                    <div className="create-invoice-modal">
                        <button
                            className="create-invoice-modal__close"
                            onClick={() => {
                                setShowCreateInvoiceModal(false)
                                setAppointmentToCreateInvoice(null)
                                setSelectedMedications([])
                                setIncludeMedications(false)
                            }}
                        >
                            ×
                        </button>
                        <h3 className="create-invoice-modal__title">Tạo hóa đơn cho cuộc hẹn</h3>
                        <div className="create-invoice-modal__content">
                            {/* Thông tin cuộc hẹn */}
                            <div className="create-invoice-modal__section">
                                <h3 className="create-invoice-modal__section-title">
                                    <Calendar size={18}/> Thông tin cuộc hẹn
                                </h3>
                                <div className="create-invoice-modal__info-grid">
                                    <div className="create-invoice-modal__info-item">
                                        <div className="create-invoice-modal__info-label">Bệnh nhân</div>
                                        <div className="create-invoice-modal__info-value">
                                            {appointmentToCreateInvoice?.patientName || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="create-invoice-modal__info-item">
                                        <div className="create-invoice-modal__info-label">Ngày hẹn</div>
                                        <div className="create-invoice-modal__info-value">
                                            {appointmentToCreateInvoice ? formatDateTime(appointmentToCreateInvoice).date : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="create-invoice-modal__info-item">
                                        <div className="create-invoice-modal__info-label">Giờ hẹn</div>
                                        <div className="create-invoice-modal__info-value">
                                            {appointmentToCreateInvoice ? formatDateTime(appointmentToCreateInvoice).time : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="create-invoice-modal__info-item">
                                        <div className="create-invoice-modal__info-label">Dịch vụ</div>
                                        <div className="create-invoice-modal__info-value">
                                            {appointmentToCreateInvoice?.services?.map(service => service.name).join(", ") || "Chưa xác định"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phần chọn mua thuốc */}
                            <div className="create-invoice-modal__section">
                                <h3 className="create-invoice-modal__section-title">
                                    <FileText size={18}/> Đơn thuốc
                                </h3>
                                {loadingMedications ? (
                                    <p className="create-invoice-modal__loading-text">Đang tải danh sách thuốc...</p>
                                ) : (
                                    <>
                                        <label className="create-invoice-modal__medication-label">Bao gồm đơn thuốc
                                            trong hóa đơn:</label>
                                        <div className="create-invoice-modal__radio-group">
                                            <label className="create-invoice-modal__radio-label">
                                                <input
                                                    type="radio"
                                                    name="includeMedications"
                                                    checked={!includeMedications}
                                                    onChange={() => {
                                                        setIncludeMedications(false)
                                                        setSelectedMedications([])
                                                    }}
                                                />
                                                Không mua thuốc
                                            </label>
                                            <label className="create-invoice-modal__radio-label">
                                                <input
                                                    type="radio"
                                                    name="includeMedications"
                                                    checked={includeMedications}
                                                    onChange={() => setIncludeMedications(true)}
                                                    disabled={availableMedications.length === 0}
                                                />
                                                Mua
                                                thuốc {availableMedications.length === 0 && "(Không có thuốc được kê đơn)"}
                                            </label>
                                        </div>
                                        {includeMedications && availableMedications.length > 0 && (
                                            <div className="create-invoice-modal__medication-list">
                                                <h4 className="create-invoice-modal__medication-title">Danh sách
                                                    thuốc</h4>
                                                <table className="create-invoice-modal__medication-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Tên thuốc</th>
                                                        <th>Giá</th>
                                                        <th>Số lượng</th>
                                                        <th>Tổng</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {availableMedications.map(med => (
                                                        <tr key={med.id}>
                                                            <td>
                                                                <label
                                                                    className="create-invoice-modal__medication-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedMedications.some(m => m.id === med.id)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedMedications([...selectedMedications, {
                                                                                    id: med.id,
                                                                                    name: med.name,
                                                                                    quantity: med.quantity || 1
                                                                                }])
                                                                            } else {
                                                                                setSelectedMedications(selectedMedications.filter(m => m.id !== med.id))
                                                                            }
                                                                        }}
                                                                        disabled={medicationDetails.prescriptionStatus === "DELIVERED"}
                                                                    />
                                                                    {med.name}
                                                                </label>
                                                            </td>
                                                            <td>{formatCurrency(med.price)}</td>
                                                            <td>
                                                                {selectedMedications.some(m => m.id === med.id) && (
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={selectedMedications.find(m => m.id === med.id)?.quantity || 1}
                                                                        onChange={(e) => {
                                                                            setSelectedMedications(prev =>
                                                                                prev.map(m =>
                                                                                    m.id === med.id ? {
                                                                                        ...m,
                                                                                        quantity: parseInt(e.target.value) || 1
                                                                                    } : m
                                                                                )
                                                                            )
                                                                        }}
                                                                        className="create-invoice-modal__quantity-input"
                                                                        disabled={medicationDetails.prescriptionStatus === "DELIVERED"}
                                                                    />
                                                                )}
                                                            </td>
                                                            <td>
                                                                {selectedMedications.some(m => m.id === med.id) && (
                                                                    formatCurrency(
                                                                        med.price * (selectedMedications.find(m => m.id === med.id)?.quantity || 1)
                                                                    )
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {includeMedications && availableMedications.length === 0 && !loadingMedications && (
                                            <p className="create-invoice-modal__no-medications">Không có thuốc được kê
                                                đơn cho cuộc hẹn này.</p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Thông tin thanh toán */}
                            <div className="create-invoice-modal__section">
                                <h3 className="create-invoice-modal__section-title">
                                    <Clock size={18}/> Thông tin thanh toán
                                </h3>
                                <div className="appointment-detail-modal__invoice">
                                    <div className="appointment-detail-modal__invoice-header">
                                        <div className="appointment-detail-modal__invoice-title">Hóa đơn dự kiến</div>
                                        <div
                                            className="appointment-detail-modal__invoice-status appointment-detail-modal__invoice-status--waiting">
                                            Chờ thanh toán
                                        </div>
                                    </div>
                                    <div className="appointment-detail-modal__invoice-items">
                                        <div className="appointment-detail-modal__invoice-item">
                                            <div>Phí dịch vụ khám</div>
                                            <div>{formatCurrency(totalServiceCost)}</div>
                                        </div>
                                        {includeMedications && totalMedicationCost > 0 && (
                                            <div className="appointment-detail-modal__invoice-item">
                                                <div>Tiền thuốc</div>
                                                <div>{formatCurrency(totalMedicationCost)}</div>
                                            </div>
                                        )}
                                        <div className="appointment-detail-modal__invoice-subtotal">
                                            <div>Tạm tính</div>
                                            <div>{formatCurrency(totalServiceCost + totalMedicationCost)}</div>
                                        </div>
                                        <div
                                            className="appointment-detail-modal__invoice-item appointment-detail-modal__invoice-item--deposit">
                                            <div>Tiền cọc đã thanh toán</div>
                                            <div>-{formatCurrency(10000)}</div>
                                        </div>
                                        <div className="appointment-detail-modal__invoice-total">
                                            <div>Số tiền cần thanh toán</div>
                                            <div>{formatCurrency(totalCost)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="create-invoice-modal__actions">
                            <button
                                className="create-invoice-modal__button create-invoice-modal__button--cancel"
                                onClick={() => {
                                    setShowCreateInvoiceModal(false)
                                    setAppointmentToCreateInvoice(null)
                                    setSelectedMedications([])
                                    setIncludeMedications(false)
                                }}
                                disabled={processingAction}
                            >
                                Hủy
                            </button>
                            <button
                                className="create-invoice-modal__button create-invoice-modal__button--confirm"
                                onClick={confirmCreateInvoice}
                                disabled={processingAction || (includeMedications && selectedMedications.length === 0 && availableMedications.length > 0) || medicationDetails.prescriptionStatus === "DELIVERED"}
                            >
                                {processingAction ? 'Đang xử lý...' : 'Tạo hóa đơn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hủy cuộc hẹn */}
            {showCancelModal && (
                <div className="cancel-appointment-modal-overlay">
                    <div className="cancel-appointment-modal">
                        <h3 className="cancel-appointment-modal__title">Hủy cuộc hẹn</h3>
                        <div className="cancel-appointment-modal__info">
                            <p><strong>Bệnh nhân:</strong> {appointmentToCancel?.patientName}</p>
                            <p><strong>Ngày
                                hẹn:</strong> {appointmentToCancel ? formatDateTime(appointmentToCancel).date : 'N/A'}
                            </p>
                            <p><strong>Giờ
                                hẹn:</strong> {appointmentToCancel ? formatDateTime(appointmentToCancel).time : 'N/A'}
                            </p>
                        </div>
                        <div className="cancel-appointment-modal__reason">
                            <label className="cancel-appointment-modal__reason-label">Lý do hủy cuộc hẹn *</label>
                            <textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Vui lòng nhập lý do hủy cuộc hẹn..."
                                className="cancel-appointment-modal__reason-textarea"
                            />
                        </div>
                        <div className="cancel-appointment-modal__actions">
                            <button
                                className="cancel-appointment-modal__button cancel-appointment-modal__button--cancel"
                                onClick={() => {
                                    setShowCancelModal(false)
                                    setAppointmentToCancel(null)
                                    setCancellationReason('')
                                }}
                                disabled={processingAction}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="cancel-appointment-modal__button cancel-appointment-modal__button--confirm"
                                onClick={confirmCancelAppointment}
                                disabled={processingAction || !cancellationReason.trim()}
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