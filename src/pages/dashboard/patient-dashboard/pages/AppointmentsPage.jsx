import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, Search, Package, Star, FileText, History, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appointmentService from "../../../../services/appointmentService";
import medicalRecordService from "../../../../services/medicalRecordService";
import authService from "../../../../services/authService";
import serviceFeedbackService from "../../../../services/serviceFeedbackService";
import FeedbackModal from "../../../../components/FeedbackModal";
import "../styles/appointmentsPatient.css";

const statusConfig = {
    PENDING: { label: "Chờ xác nhận", className: "customer-appointments-status-pending" },
    CONFIRMED: { label: "Đã xác nhận", className: "customer-appointments-status-confirmed" },
    DOCTOR_FINISHED: { label: "Bác sĩ đã khám xong", className: "customer-appointments-status-doctor-finished" },
    WAITING_PAYMENT: { label: "Chờ thanh toán", className: "customer-appointments-status-waiting-payment" },
    COMPLETED: { label: "Hoàn thành", className: "customer-appointments-status-completed" },
    CANCELED: { label: "Đã hủy", className: "customer-appointments-status-cancelled" },
    CANCELLED: { label: "Đã hủy", className: "customer-appointments-status-cancelled" },
    NO_SHOW: { label: "Không đến", className: "customer-appointments-status-no-show" },
    UNKNOWN: { label: "Không xác định", className: "customer-appointments-status-unknown" },
};

const prescriptionStatusConfig = {
    NOT_BUY: { label: "Không mua thuốc", className: "prescription-status-not-buy" },
    PENDING: { label: "Chờ nhận thuốc", className: "prescription-status-pending" },
    DELIVERED: { label: "Đã nhận thuốc", className: "prescription-status-delivered" },
    UNKNOWN: { label: "Không xác định", className: "prescription-status-unknown" },
};

export default function AppointmentsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [appointmentsPerPage] = useState(5);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [filterCounts, setFilterCounts] = useState({
        ALL: 0,
        PENDING: 0,
        CONFIRMED: 0,
        DOCTOR_FINISHED: 0,
        WAITING_PAYMENT: 0,
        COMPLETED: 0,
        CANCELED: 0,
        CANCELLED: 0,
        NO_SHOW: 0,
    });
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [cancellationInfo, setCancellationInfo] = useState(null);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedAppointmentForFeedback, setSelectedAppointmentForFeedback] = useState(null);
    const [appointmentFeedbacks, setAppointmentFeedbacks] = useState({});
    const [medicationDetails, setMedicationDetails] = useState({
        products: [],
        totalAmount: 0,
        prescriptionStatus: "UNKNOWN",
    });

    useEffect(() => {
        fetchUserData();
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            setUser(currentUser);
            await fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            navigate('/login');
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getPatientAppointments();
            const formattedAppointments = data
                .map(appointment => {
                    let appointmentDateTime;
                    try {
                        const dateStr = appointment.appointmentDate;
                        const timeStr = appointment.timeSlot;
                        appointmentDateTime = dateStr && timeStr ? new Date(`${dateStr}T${timeStr}:00`) : new Date();
                        if (isNaN(appointmentDateTime.getTime())) {
                            appointmentDateTime = new Date();
                        }
                    } catch (error) {
                        console.error('Error parsing appointment date/time:', error);
                        appointmentDateTime = new Date();
                    }

                    let serviceName = "Tư vấn & Điều trị";
                    if (appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0) {
                        const serviceNames = appointment.services.map(service => service.name).filter(name => name);
                        serviceName = serviceNames.length > 0 ? serviceNames.join(", ") : "Tư vấn & Điều trị";
                    } else if (appointment.service && appointment.service.name) {
                        serviceName = appointment.service.name;
                    } else if (appointment.service && typeof appointment.service === 'string') {
                        serviceName = appointment.service;
                    } else if (appointment.medicalService && appointment.medicalService.name) {
                        serviceName = appointment.medicalService.name;
                    } else if (appointment.serviceName) {
                        serviceName = appointment.serviceName;
                    }

                    return {
                        id: appointment.id,
                        service: serviceName,
                        serviceName: serviceName, // Thêm serviceName riêng
                        date: appointmentDateTime.toLocaleDateString('vi-VN'),
                        time: appointmentDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                        doctor: appointment.doctor && appointment.doctor.name ? `BS. ${appointment.doctor.name}` : "Chưa xác định",
                        doctorName: appointment.doctor && appointment.doctor.name ? `BS. ${appointment.doctor.name}` : "Chưa xác định", // Thêm doctorName riêng
                        status: mapAppointmentStatus(appointment.status),
                        reason: appointment.reason || "Không có thông tin",
                        notes: appointment.notes || "",
                        canCancel: mapAppointmentStatus(appointment.status) === "CONFIRMED",
                        location: appointment.location || "Trung tâm Mắt EyeSpire",
                        room: appointment.room || "Phòng 101",
                        duration: appointment.duration || "30 phút",
                        cancellationTime: appointment.cancellationTime || null,
                        cancellationReason: appointment.cancellationReason || "",
                        appointmentTime: appointmentDateTime.toISOString(),
                        originalDate: appointment.appointmentDate,
                        originalTimeSlot: appointment.timeSlot,
                        requiresManualRefund: appointment.requiresManualRefund || false,
                        refundStatus: appointment.refundStatus || null,
                        refundAmount: appointment.refundAmount || 10000,
                        refundCompletedBy: appointment.refundCompletedBy || null,
                        refundCompletedByRole: appointment.refundCompletedByRole || null,
                        refundCompletedAt: appointment.refundCompletedAt || null,
                        patientName: appointment.patientName || null,
                        patientEmail: appointment.patientEmail || null,
                        patientPhone: appointment.patientPhone || null,
                    };
                });

            setAppointments(formattedAppointments);
            setFilteredAppointments(formattedAppointments);

            const counts = {
                ALL: formattedAppointments.length,
                PENDING: formattedAppointments.filter(apt => apt.status === 'PENDING').length,
                CONFIRMED: formattedAppointments.filter(apt => apt.status === 'CONFIRMED').length,
                DOCTOR_FINISHED: formattedAppointments.filter(apt => apt.status === 'DOCTOR_FINISHED').length,
                WAITING_PAYMENT: formattedAppointments.filter(apt => apt.status === 'WAITING_PAYMENT').length,
                COMPLETED: formattedAppointments.filter(apt => apt.status === 'COMPLETED').length,
                CANCELED: formattedAppointments.filter(apt => apt.status === 'CANCELED').length,
                CANCELLED: formattedAppointments.filter(apt => apt.status === 'CANCELLED').length,
                NO_SHOW: formattedAppointments.filter(apt => apt.status === 'NO_SHOW').length,
            };
            setFilterCounts(counts);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc hẹn:", error);
            toast.error("Không thể lấy danh sách cuộc hẹn. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = appointments;
        if (activeFilter !== "ALL") {
            filtered = appointments.filter(apt => apt.status === activeFilter);
        }
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(apt =>
                apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredAppointments(filtered);
        setCurrentPage(1);
    }, [searchTerm, appointments, activeFilter]);

    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCancellationTime = (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
    };

    const mapAppointmentStatus = (status) => {
        switch (status) {
            case "PENDING":
                return "PENDING";
            case "SCHEDULED":
                return "PENDING";
            case "CONFIRMED":
                return "CONFIRMED";
            case "DOCTOR_FINISHED":
                return "DOCTOR_FINISHED";
            case "WAITING_PAYMENT":
                return "WAITING_PAYMENT";
            case "COMPLETED":
                return "COMPLETED";
            case "CANCELED":
                return "CANCELED";
            case "CANCELLED":
                return "CANCELLED";
            case "NO_SHOW":
                return "NO_SHOW";
            default:
                return "UNKNOWN";
        }
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.UNKNOWN;
        return <span className={`ptod-order-status ${config.className}`}>{config.label}</span>;
    };

    const getRefundStatus = (appointment) => {
        // Kiểm tra cả CANCELLED và CANCELED
        if (appointment.status !== "CANCELLED" && appointment.status !== "CANCELED") {
            return <span className="ptod-order-status status-default">-</span>;
        }

        const refundStatus = appointment.refundStatus;
        const refundAmount = appointment.refundAmount || 0;

        // Nếu không có refundStatus hoặc refundAmount = 0, có thể không đủ điều kiện hoàn tiền
        if (!refundStatus && refundAmount === 0) {
            return (
                <span className="ptod-order-status status-cancelled">
                    Không đủ điều kiện hoàn tiền
                </span>
            );
        }

        if (refundStatus === 'COMPLETED') {
            return (
                <span className="ptod-order-status status-delivered">
                    Đã hoàn tiền {formatCurrency(refundAmount)}
                </span>
            );
        } else if (refundStatus === 'PENDING_MANUAL_REFUND' || appointment.requiresManualRefund) {
            return (
                <span className="ptod-order-status status-processing">
                    Đang xử lý {formatCurrency(refundAmount)}
                </span>
            );
        } else if (refundStatus === 'REJECTED' || refundStatus === 'NOT_ELIGIBLE') {
            return (
                <span className="ptod-order-status status-cancelled">
                    Không đủ điều kiện hoàn tiền
                </span>
            );
        } else {
            return (
                <span className="ptod-order-status status-default">
                    Chưa xác định
                </span>
            );
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatRefundDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateRefundPolicy = (appointmentDate, currentDate) => {
        const timeDiff = appointmentDate.getTime() - currentDate.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        if (hoursDiff >= 24) {
            return {
                canRefund: true,
                refundAmount: 10000,
                refundPercentage: 100,
                message: "Hoàn tiền đầy đủ (hủy trước 24h)"
            };
        } else if (hoursDiff >= 2) {
            return {
                canRefund: true,
                refundAmount: 5000,
                refundPercentage: 50,
                message: "Hoàn tiền 50% (hủy trước 2h)"
            };
        } else {
            return {
                canRefund: false,
                refundAmount: 0,
                refundPercentage: 0,
                message: "Không được hoàn tiền (hủy trong vòng 2h)"
            };
        }
    };

    const openCancelDialog = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelDialog(true);
        setCancellationReason("");
        const appointmentDateTime = appointment.appointmentTime || `${appointment.date} ${appointment.time}`;
        const now = new Date();
        const refundPolicy = calculateRefundPolicy(new Date(appointmentDateTime), now);
        setCancellationInfo(refundPolicy);
    };

    const closeCancelDialog = () => {
        setShowCancelDialog(false);
        setSelectedAppointment(null);
        setCancellationReason("");
        setCancellationInfo(null);
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment || !cancellationReason.trim()) {
            toast.error("Vui lòng nhập lý do hủy lịch!");
            return;
        }
        try {
            const now = new Date();
            await appointmentService.cancelAppointment(
                selectedAppointment.id,
                cancellationReason,
                now.toISOString()
            );
            toast.success("Hủy lịch hẹn thành công!");
            closeCancelDialog();
            await fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi hủy lịch hẹn:", error);
            toast.error("Không thể hủy lịch hẹn. Vui lòng thử lại sau.");
        }
    };

    const loadAppointmentFeedback = async (appointmentId) => {
        try {
            const feedback = await serviceFeedbackService.getFeedbackByAppointmentId(appointmentId);
            setAppointmentFeedbacks(prev => ({
                ...prev,
                [appointmentId]: feedback
            }));
            return feedback;
        } catch (error) {
            console.error('Error loading feedback:', error);
            return null;
        }
    };

    const openFeedbackModal = async (appointment) => {
        setSelectedAppointmentForFeedback(appointment);
        await loadAppointmentFeedback(appointment.id);
        setShowFeedbackModal(true);
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedAppointmentForFeedback(null);
    };

    const handleFeedbackSubmitted = async (feedbackData) => {
        setAppointmentFeedbacks(prev => ({
            ...prev,
            [feedbackData.appointmentId]: feedbackData
        }));
        toast.success('Đánh giá dịch vụ thành công!');
        await fetchAppointments();
    };

    const viewAppointmentDetails = async (appointmentId) => {
        try {
            setLoading(true);
            const details = await appointmentService.getAppointmentById(appointmentId);
            let invoiceDetails = null;
            try {
                invoiceDetails = await appointmentService.getAppointmentInvoice(appointmentId);
            } catch (invoiceError) {
                console.error("Lỗi khi lấy thông tin hóa đơn:", invoiceError);
            }

            let serviceName = "Khám mắt tổng quát";
            let servicePrice = 0;
            if (details.services && Array.isArray(details.services) && details.services.length > 0) {
                servicePrice = details.services.reduce((total, service) => total + Number(service.price || 0), 0);
                serviceName = details.services.length === 1 ? details.services[0].name : details.services.map(s => s.name).join(", ");
            } else if (details.service && typeof details.service === 'object') {
                serviceName = details.service.name;
                servicePrice = Number(details.service.price || 0);
            } else if (details.serviceName) {
                serviceName = details.serviceName;
                servicePrice = Number(details.servicePrice || 0);
            }

            let formattedDate = "Không có thông tin";
            let formattedTime = "Không có thông tin";
            if (details.appointmentTime && typeof details.appointmentTime === 'string') {
                try {
                    const dateObj = new Date(details.appointmentTime);
                    if (!isNaN(dateObj.getTime())) {
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        formattedTime = `${hours}:${minutes}`;
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý appointmentTime:", error);
                }
            } else if (details.appointmentDate && details.timeSlot) {
                try {
                    const dateObj = new Date(`${details.appointmentDate}T${details.timeSlot}`);
                    if (!isNaN(dateObj.getTime())) {
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                        formattedTime = details.timeSlot;
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý appointmentDate và timeSlot:", error);
                }
            }

            let doctorName = "Chưa phân công";
            if (details.doctor) {
                doctorName = details.doctor.name || details.doctor.fullName || "Chưa phân công";
            } else if (details.doctorName) {
                doctorName = details.doctorName;
            }

            let medications = { products: [], totalAmount: 0, prescriptionStatus: "NOT_BUY" };
            try {
                const medicationData = await medicalRecordService.getMedicationsByAppointmentId(appointmentId);
                const prescriptionStatus = invoiceDetails?.prescriptionStatus || medicationData.prescriptionStatus || "NOT_BUY";
                medications = {
                    products: prescriptionStatus === "NOT_BUY" ? [] : (medicationData.products || []),
                    totalAmount: prescriptionStatus === "NOT_BUY" ? 0 : (medicationData.totalAmount || 0),
                    prescriptionStatus
                };
            } catch (medicationError) {
                console.log("Không có thông tin thuốc hoặc lỗi khi lấy thông tin thuốc:", medicationError);
                medications.prescriptionStatus = invoiceDetails?.prescriptionStatus || "NOT_BUY";
                medications.products = [];
                medications.totalAmount = 0;
            }

            const isCancelled = details.status === 'CANCELED';
            const medicationAmount = medications.totalAmount || 0;
            const invoiceTotalAmount = invoiceDetails?.totalAmount || 0;
            const depositAmount = Number(invoiceDetails?.depositAmount || details.depositAmount || 10000);
            const totalAmount = isCancelled ? 0 : servicePrice + medicationAmount;
            const remainingAmount = isCancelled ? 0 : Math.max(0, totalAmount - depositAmount);
            const isFullyPaid = invoiceDetails?.paymentStatus === 'PAID' || details.status === "COMPLETED";

            const formattedDetails = {
                // Chỉ lấy các properties cần thiết, tránh copy object phức tạp
                id: details.id,
                status: details.status,
                reason: details.reason,
                notes: details.notes,
                location: details.location,
                room: details.room,
                duration: details.duration,
                appointmentTime: details.appointmentTime,
                appointmentDate: details.appointmentDate,
                timeSlot: details.timeSlot,
                date: formattedDate,
                time: formattedTime,
                patientName: details.patientName || user?.name || "Không có thông tin",
                patientEmail: details.patientEmail || user?.email || "Không có thông tin",
                patientPhone: details.patientPhone || user?.phone || "Không có thông tin",
                doctorName: doctorName,
                serviceName: serviceName,
                servicePrice: isCancelled ? 0 : servicePrice,
                medicationAmount: medicationAmount,
                medicationDetails: medications,
                totalAmount: totalAmount,
                depositAmount: depositAmount,
                remainingAmount: remainingAmount,
                isFullyPaid: isFullyPaid,
                invoiceDetails: invoiceDetails,
                paymentStatus: isFullyPaid ? 'Đã thanh toán' : 'Chờ thanh toán',
                cancellationReason: details.cancellationReason || "",
                cancellationTime: details.cancellationTime || null,
                refundStatus: details.refundStatus,
                refundAmount: details.refundAmount,
                refundCompletedBy: details.refundCompletedBy,
                refundCompletedByRole: details.refundCompletedByRole,
                refundCompletedAt: details.refundCompletedAt,
                requiresManualRefund: details.requiresManualRefund,
                refundPolicy: details.cancellationTime ? calculateRefundPolicy(details.date || details.appointmentTime, details.cancellationTime) : null
            };

            setAppointmentDetails(formattedDetails);
            setMedicationDetails(medications);
            setShowDetailsModal(true);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết cuộc hẹn:", error);
            toast.error("Không thể lấy thông tin chi tiết cuộc hẹn");
            setLoading(false);
        }
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setAppointmentDetails(null);
        setMedicationDetails({ products: [], totalAmount: 0, prescriptionStatus: "UNKNOWN" });
    };

    const getAvatarUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) {
            return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
        }
        return url;
    };

    return (
        <div className="ptod-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <header className="ptod-header">
                <div className="ptod-header-left">
                    <h1 className="ptod-title">Danh sách cuộc hẹn</h1>
                    <div className="ptod-search-container">
                        <Search className="ptod-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã cuộc hẹn, dịch vụ..."
                            className="ptod-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="ptod-header-right">
                    <div className="ptod-user-avatar">
                        {user && user.avatarUrl ? (
                            <img src={getAvatarUrl(user.avatarUrl)} alt={user.name} className="ptod-avatar-image" />
                        ) : (
                            user && user.name ? user.name.charAt(0) : "U"
                        )}
                    </div>
                </div>
            </header>

            <div className="ptod-filter-tabs-container">
                <div className="ptod-filter-tabs">
                    {[
                        { key: "ALL", label: "Tất cả" },
                        { key: "PENDING", label: "Chờ xác nhận" },
                        { key: "CONFIRMED", label: "Đã xác nhận" },
                        { key: "DOCTOR_FINISHED", label: "Bác sĩ đã khám xong" },
                        { key: "WAITING_PAYMENT", label: "Chờ thanh toán" },
                        { key: "COMPLETED", label: "Đã hoàn thành" },
                        { key: "CANCELED", label: "Đã hủy" },
                    ].map(filter => (
                        <button
                            key={filter.key}
                            className={`ptod-filter-tab ${activeFilter === filter.key ? 'ptod-filter-active' : ''}`}
                            onClick={() => setActiveFilter(filter.key)}
                        >
                            {filter.label}
                            {filterCounts[filter.key] > 0 && (
                                <span className="ptod-filter-count">{filterCounts[filter.key]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ptod-orders-content">
                {loading ? (
                    <div className="ptod-loading-container">
                        <div className="ptod-loading-spinner">Đang tải...</div>
                    </div>
                ) : (
                    <>
                        <div className="ptod-orders-list">
                            {filteredAppointments.length === 0 ? (
                                <div className="ptod-no-orders">
                                    <Package className="ptod-no-orders-icon" />
                                    <h3>Không có cuộc hẹn nào</h3>
                                    <p>Không có cuộc hẹn phù hợp với bộ lọc hiện tại.</p>
                                </div>
                            ) : (
                                currentAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="ptod-order-card"
                                        onClick={() => viewAppointmentDetails(appointment.id)}
                                    >
                                        <div className="ptod-order-content">
                                            <div className="ptod-order-main-info">
                                                <h3 className="ptod-order-id">
                                                    <Calendar size={16} className="ptod-order-icon" />
                                                    Cuộc hẹn #{appointment.id}
                                                </h3>
                                                <p className="ptod-order-items">{appointment.service}</p>
                                                <div className="ptod-order-meta">
                                                    <div className="ptod-order-date">
                                                        <Calendar size={14} />
                                                        <span>Ngày hẹn: {appointment.date} - {appointment.time}</span>
                                                    </div>
                                                </div>
                                                <p className="ptod-order-address">
                                                    <Package size={14} className="ptod-address-icon" />
                                                    <span>Địa chỉ:</span> {appointment.location}
                                                </p>
                                            </div>
                                            <div className="ptod-order-actions">
                                                {getStatusBadge(appointment.status)}
                                                {appointment.canCancel && (
                                                    <button
                                                        className="ptod-order-detail-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCancelDialog(appointment);
                                                        }}
                                                    >
                                                        Hủy lịch
                                                    </button>
                                                )}
                                                {appointment.status === "COMPLETED" && (
                                                    <button
                                                        className="ptod-order-detail-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openFeedbackModal(appointment);
                                                        }}
                                                    >
                                                        {appointmentFeedbacks[appointment.id] ? "Xem đánh giá" : "Đánh giá"}
                                                    </button>
                                                )}
                                                <button
                                                    className="ptod-order-detail-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        viewAppointmentDetails(appointment.id);
                                                    }}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {filteredAppointments.length > 0 && (
                            <div className="ptod-pagination">
                                <button
                                    className="ptod-pagination-btn"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    «
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`ptod-pagination-btn ${currentPage === i + 1 ? 'ptod-active' : ''}`}
                                        onClick={() => paginate(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="ptod-pagination-btn"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    »
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showCancelDialog && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Xác nhận hủy lịch hẹn</h3>
                            <button className="close-button" onClick={closeCancelDialog}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="appointment-info-box">
                                <div className="info-row">
                                    <span className="info-label">Dịch vụ:</span>
                                    <span className="info-value">{selectedAppointment.service}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Ngày giờ:</span>
                                    <span className="info-value">{selectedAppointment.date} - {selectedAppointment.time}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Bác sĩ:</span>
                                    <span className="info-value">{selectedAppointment.doctor}</span>
                                </div>
                            </div>
                            {cancellationInfo && (
                                <div className={`refund-policy-alert ${cancellationInfo.canRefund ? 'refund-yes' : 'refund-no'}`}>
                                    <h4>Chính sách hoàn tiền:</h4>
                                    <p>{cancellationInfo.message}</p>
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="cancellationReason">Lý do hủy lịch:</label>
                                <textarea
                                    id="cancellationReason"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Vui lòng nhập lý do hủy lịch..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button-secondary" onClick={closeCancelDialog}>
                                Quay lại
                            </button>
                            <button
                                className="cancel-button-primary"
                                onClick={handleCancelAppointment}
                                disabled={!cancellationReason.trim()}
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && appointmentDetails && (
                <div className="modal-overlay">
                    <div className="modal-container appointment-details-modal">
                        <div className="modal-header">
                            <h3>Chi tiết cuộc hẹn</h3>
                            <button className="close-button" onClick={closeDetailsModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="appointment-details-content">
                                <div className="details-section appointment-info">
                                    <div className="section-header">
                                        <div className="icon-container">
                                            <Calendar size={20} />
                                        </div>
                                        <h4>Thông tin cuộc hẹn</h4>
                                    </div>
                                    <div className="details-grid">
                                        <div className="details-row">
                                            <span className="details-label">Mã cuộc hẹn:</span>
                                            <span className="details-value highlight">{appointmentDetails.id}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Dịch vụ:</span>
                                            <span className="details-value">{appointmentDetails.serviceName}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Ngày hẹn:</span>
                                            <span className="details-value highlight-date">{appointmentDetails.date}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Giờ hẹn:</span>
                                            <span className="details-value highlight-time">{appointmentDetails.time}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Bác sĩ:</span>
                                            <span className="details-value">{appointmentDetails.doctorName}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Trạng thái:</span>
                                            <span className="details-value status-container">
                                                {getStatusBadge(appointmentDetails.status)}
                                            </span>
                                        </div>
                                        <div className="details-row full-width">
                                            <span className="details-label">Lý do khám:</span>
                                            <span className="details-value notes-text">{appointmentDetails.notes || 'Không có'}</span>
                                        </div>
                                        {(appointmentDetails.status === 'CANCELLED' || appointmentDetails.status === 'CANCELED') && appointmentDetails.cancellationReason && (
                                            <div className="details-row full-width cancellation-reason">
                                                <span className="details-label cancellation-label">Lý do hủy:</span>
                                                <span className="details-value cancellation-text">{appointmentDetails.cancellationReason}</span>
                                            </div>
                                        )}
                                        {(appointmentDetails.status === 'CANCELLED' || appointmentDetails.status === 'CANCELED') && (
                                            <div className="details-section refund-info">
                                                <div className="section-header">
                                                    <div className="icon-container">
                                                        <Package size={20} />
                                                    </div>
                                                    <h4>Thông tin hoàn tiền</h4>
                                                </div>
                                                <div className="details-grid">
                                                    <div className="details-row">
                                                        <span className="details-label">Trạng thái hoàn tiền:</span>
                                                        <div className="details-value refund-status-container">{getRefundStatus(appointmentDetails)}</div>
                                                    </div>
                                                    <div className="details-row">
                                                        <span className="details-label">Số tiền hoàn:</span>
                                                        <span className="details-value highlight">
                                                            {appointmentDetails.refundAmount > 0 
                                                                ? formatCurrency(appointmentDetails.refundAmount)
                                                                : "0 VNĐ (Không đủ điều kiện)"
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="details-row">
                                                        <span className="details-label">Phương thức hoàn tiền:</span>
                                                        <span className="details-value">
                                                            {appointmentDetails.refundAmount > 0 
                                                                ? "Hoàn tiền thủ công (Chuyển khoản)"
                                                                : "Không áp dụng"
                                                            }
                                                        </span>
                                                    </div>
                                                    {appointmentDetails.refundCompletedBy && (
                                                        <div className="details-row">
                                                            <span className="details-label">Người xử lý:</span>
                                                            <span className="details-value">{appointmentDetails.refundCompletedBy}
                                                                {appointmentDetails.refundCompletedByRole && (
                                                                    <span className="role-badge"> ({appointmentDetails.refundCompletedByRole})</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {appointmentDetails.refundCompletedAt && (
                                                        <div className="details-row">
                                                            <span className="details-label">Thời gian hoàn tất:</span>
                                                            <span className="details-value">{formatRefundDate(appointmentDetails.refundCompletedAt)}</span>
                                                        </div>
                                                    )}
                                                    {appointmentDetails.refundAmount === 0 && (
                                                        <div className="details-row full-width">
                                                            <div className="refund-policy-note">
                                                                <strong>Lưu ý:</strong> Cuộc hẹn này không đủ điều kiện hoàn tiền theo chính sách của trung tâm. 
                                                                Chính sách hoàn tiền: Hoàn 100% nếu hủy trước 24h, hoàn 50% nếu hủy trước 2h, không hoàn nếu hủy trong vòng 2h.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="details-section patient-info">
                                    <div className="section-header">
                                        <div className="icon-container">
                                            <Package size={20} />
                                        </div>
                                        <h4>Thông tin bệnh nhân</h4>
                                    </div>
                                    <div className="details-grid">
                                        <div className="details-row">
                                            <span className="details-label">Họ tên:</span>
                                            <span className="details-value">{appointmentDetails.patientName}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Email:</span>
                                            <span className="details-value">{appointmentDetails.patientEmail}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Số điện thoại:</span>
                                            <span className="details-value">{appointmentDetails.patientPhone}</span>
                                        </div>
                                    </div>
                                </div>
                                {(appointmentDetails.status === "WAITING_PAYMENT" || appointmentDetails.status === "COMPLETED") && appointmentDetails.invoiceDetails && (
                                    <div className="details-section payment-details">
                                        <div className="section-header">
                                            <div className="icon-container">
                                                <Package size={20} />
                                            </div>
                                            <h4>Thông tin thanh toán</h4>
                                        </div>
                                        <div className="appointment-detail-modal__invoice">
                                            <div className="appointment-detail-modal__invoice-header">
                                                <div className="appointment-detail-modal__invoice-title">Hóa đơn #{appointmentDetails.id}</div>
                                                <div className={`appointment-detail-modal__invoice-status ${
                                                    appointmentDetails.status === "COMPLETED"
                                                        ? prescriptionStatusConfig[medicationDetails.prescriptionStatus]?.className || prescriptionStatusConfig.UNKNOWN.className
                                                        : "appointment-detail-modal__invoice-status--waiting"
                                                }`}>
                                                    {appointmentDetails.status === "COMPLETED"
                                                        ? prescriptionStatusConfig[medicationDetails.prescriptionStatus]?.label || prescriptionStatusConfig.UNKNOWN.label
                                                        : "Chờ thanh toán"}
                                                </div>
                                            </div>
                                            <div className="appointment-detail-modal__invoice-items">
                                                <div className="appointment-detail-modal__invoice-item">
                                                    <div>Phí dịch vụ khám</div>
                                                    <div>{formatCurrency(appointmentDetails.servicePrice)}</div>
                                                </div>
                                                {medicationDetails && medicationDetails.totalAmount > 0 && medicationDetails.prescriptionStatus !== "NOT_BUY" && (
                                                    <div className="appointment-detail-modal__invoice-item">
                                                        <div>Tiền thuốc</div>
                                                        <div>{formatCurrency(medicationDetails.totalAmount)}</div>
                                                    </div>
                                                )}
                                                <div className="appointment-detail-modal__invoice-subtotal">
                                                    <div>Tạm tính</div>
                                                    <div>{formatCurrency(appointmentDetails.totalAmount)}</div>
                                                </div>
                                                {appointmentDetails.depositAmount > 0 && (
                                                    <div className="appointment-detail-modal__invoice-item appointment-detail-modal__invoice-item--deposit">
                                                        <div>Tiền cọc đã thanh toán</div>
                                                        <div>-{formatCurrency(appointmentDetails.depositAmount)}</div>
                                                    </div>
                                                )}
                                                <div className="appointment-detail-modal__invoice-total">
                                                    <div>Số tiền cần thanh toán</div>
                                                    <div>{formatCurrency(appointmentDetails.remainingAmount)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            {(appointmentDetails.status === "PENDING" || appointmentDetails.status === "CONFIRMED") && (
                                <button
                                    className="cancel-button-primary"
                                    onClick={() => {
                                        closeDetailsModal();
                                        openCancelDialog(appointmentDetails);
                                    }}
                                >
                                    Hủy lịch hẹn
                                </button>
                            )}
                            <button className="close-button-secondary" onClick={closeDetailsModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFeedbackModal && selectedAppointmentForFeedback && (
                <FeedbackModal
                    show={showFeedbackModal}
                    onHide={closeFeedbackModal}
                    appointment={selectedAppointmentForFeedback}
                    existingFeedback={appointmentFeedbacks[selectedAppointmentForFeedback.id]}
                    onFeedbackSubmitted={handleFeedbackSubmitted}
                />
            )}

            {/* Cancel Appointment Dialog */}
            {showCancelDialog && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Xác nhận hủy lịch hẹn</h3>
                            <button className="close-button" onClick={closeCancelDialog}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="appointment-info">
                                <h4>Thông tin cuộc hẹn</h4>
                                <p><strong>Bác sĩ:</strong> {selectedAppointment.doctorName}</p>
                                <p><strong>Ngày giờ:</strong> {selectedAppointment.date} - {selectedAppointment.time}</p>
                                <p><strong>Dịch vụ:</strong> {selectedAppointment.serviceName}</p>
                            </div>
                            
                            {cancellationInfo && (
                                <div className={`refund-info ${cancellationInfo.canRefund ? 'refund-yes' : 'refund-no'}`}>
                                    <h4>Chính sách hoàn tiền</h4>
                                    <p>{cancellationInfo.message}</p>
                                    {cancellationInfo.canRefund && (
                                        <p><strong>Số tiền hoàn:</strong> {formatCurrency(cancellationInfo.refundAmount)}</p>
                                    )}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="cancellationReason">Lý do hủy lịch hẹn *</label>
                                <textarea
                                    id="cancellationReason"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Vui lòng nhập lý do hủy lịch hẹn..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button-secondary" onClick={closeCancelDialog}>
                                Hủy bỏ
                            </button>
                            <button 
                                className="cancel-button-primary" 
                                onClick={handleCancelAppointment}
                                disabled={!cancellationReason.trim()}
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}