import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, History, FileText, User, Package } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appointmentService from "../../../../services/appointmentService";
import medicalRecordService from '../../../../services/medicalRecordService';
import authService from "../../../../services/authService";
import "./AppointmentsPage.css";
import '../styles/appointmentsPatient.css';

export default function AppointmentsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [expandedAppointments, setExpandedAppointments] = useState({});
    const [activeTab, setActiveTab] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    
    // State cho hộp thoại hủy lịch
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [cancellationInfo, setCancellationInfo] = useState(null);

    // Thêm state để lưu trữ thông tin chi tiết cuộc hẹn
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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
            
            // Lấy danh sách cuộc hẹn của bệnh nhân
            await fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            navigate('/login');
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Lấy danh sách cuộc hẹn
            const data = await appointmentService.getPatientAppointments();
            
            // Debug: Kiểm tra cấu trúc dữ liệu
            console.log("Raw appointments data:", JSON.stringify(data, null, 2));
            
            // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
            const formattedAppointments = data.map(appointment => {
                // Xử lý ngày và giờ hẹn từ appointmentDate và timeSlot
                let appointmentDateTime;
                try {
                    // Kết hợp appointmentDate và timeSlot để tạo datetime hoàn chỉnh
                    const dateStr = appointment.appointmentDate; // "2025-07-15"
                    const timeStr = appointment.timeSlot; // "09:00"
                    
                    if (dateStr && timeStr) {
                        appointmentDateTime = new Date(`${dateStr}T${timeStr}:00`);
                    } else {
                        console.warn('Missing appointmentDate or timeSlot:', { dateStr, timeStr });
                        appointmentDateTime = new Date(); // Fallback to current date
                    }
                    
                    // Kiểm tra xem date có hợp lệ không
                    if (isNaN(appointmentDateTime.getTime())) {
                        console.warn('Invalid appointment date/time:', { dateStr, timeStr });
                        appointmentDateTime = new Date(); // Fallback to current date
                    }
                } catch (error) {
                    console.error('Error parsing appointment date/time:', error);
                    appointmentDateTime = new Date(); // Fallback to current date
                }
                
                // Debug: Kiểm tra từng appointment
                console.log("Processing appointment:", appointment);
                
                // Xử lý tên dịch vụ từ array services (áp dụng cách của MedicalRecordsPage)
                let serviceName = "Tư vấn & Điều trị";
                
                if (appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0) {
                    // Nếu có nhiều dịch vụ, hiển thị tất cả tên dịch vụ cách nhau bởi dấu phẩy
                    const serviceNames = appointment.services.map(service => service.name).filter(name => name);
                    serviceName = serviceNames.length > 0 ? serviceNames.join(", ") : "Tư vấn & Điều trị";
                } else if (appointment.service && appointment.service.name) {
                    // Fallback cho trường hợp chỉ có một dịch vụ (backward compatibility)
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
                    date: appointmentDateTime.toLocaleDateString('vi-VN'),
                    time: appointmentDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    doctor: appointment.doctor && appointment.doctor.name ? `BS. ${appointment.doctor.name}` : "Chưa xác định",
                    status: mapAppointmentStatus(appointment.status),
                    reason: appointment.reason || "Không có thông tin",
                    notes: appointment.notes || "",
                    canCancel: mapAppointmentStatus(appointment.status) === "pending" || mapAppointmentStatus(appointment.status) === "confirmed",
                    location: appointment.location || "Trung tâm Mắt EyeSpire",
                    room: appointment.room || "Phòng 101",
                    duration: appointment.duration || "30 phút",
                    cancellationTime: appointment.cancellationTime || null,
                    cancellationReason: appointment.cancellationReason || "",
                    appointmentTime: appointmentDateTime.toISOString(),
                    originalDate: appointment.appointmentDate,
                    originalTimeSlot: appointment.timeSlot,
                    // Thêm các trường liên quan đến hoàn tiền
                    requiresManualRefund: appointment.requiresManualRefund || false,
                    refundStatus: appointment.refundStatus || null,
                    refundAmount: appointment.refundAmount || 10000,
                    refundCompletedBy: appointment.refundCompletedBy || null,
                    refundCompletedByRole: appointment.refundCompletedByRole || null,
                    refundCompletedAt: appointment.refundCompletedAt || null,
                    // Thêm thông tin bệnh nhân từ form đặt hẹn
                    patientName: appointment.patientName || null,
                    patientEmail: appointment.patientEmail || null,
                    patientPhone: appointment.patientPhone || null
                };
            });
            
            setAppointments(formattedAppointments);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc hẹn:", error);
            toast.error("Không thể lấy danh sách cuộc hẹn. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm hỗ trợ định dạng ngày tháng
    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Hàm hỗ trợ định dạng giờ
    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Hàm định dạng thời gian hủy lịch
    const formatCancellationTime = (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
    };

    // Chuyển đổi trạng thái từ API sang định dạng hiển thị
    const mapAppointmentStatus = (status) => {
        switch (status) {
            case "SCHEDULED":
                return "pending";
            case "CONFIRMED":
                return "confirmed";
            case "COMPLETED":
                return "completed";
            case "CANCELED":
                return "cancelled";
            case "CANCELLED":
                return "cancelled";
            case "NO_SHOW":
                return "no-show";
            case "WAITING_PAYMENT":
                return "waiting-payment";
            default:
                return "pending";
        }
    };

    const getFilteredAppointments = () => {
        let filteredAppointments = [...appointments];

        if (activeTab === "confirmed") {
            filteredAppointments = appointments.filter(apt => apt.status === "confirmed");
        } else if (activeTab === "completed") {
            filteredAppointments = appointments.filter(apt => apt.status === "completed");
        } else if (activeTab === "cancelled") {
            filteredAppointments = appointments.filter(apt => apt.status === "cancelled");
        } else if (activeTab === "pending") {
            filteredAppointments = appointments.filter(apt => apt.status === "pending");
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredAppointments = filteredAppointments.filter(apt => 
                apt.service.toLowerCase().includes(query) ||
                apt.doctor.toLowerCase().includes(query) ||
                apt.date.includes(query)
            );
        }

        if (sortOrder === "newest") {
            filteredAppointments.sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            });
        } else {
            filteredAppointments.sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateA - dateB;
            });
        }

        return filteredAppointments;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="status-badge status-pending">Chờ xác nhận</span>;
            case "confirmed":
                return <span className="status-badge status-confirmed">Đã xác nhận</span>;
            case "completed":
                return <span className="status-badge status-completed">Đã hoàn thành</span>;
            case "cancelled":
                return <span className="status-badge status-cancelled">Đã hủy</span>;
            case "waiting-payment":
                return <span className="status-badge status-waiting-payment">Đang chờ thanh toán</span>;
            default:
                return <span className="status-badge">Không xác định</span>;
        }
    };

    // Hàm hiển thị trạng thái hoàn tiền
    const getRefundStatus = (appointment) => {
        // Chỉ hiển thị thông tin hoàn tiền cho cuộc hẹn đã hủy
        if (appointment.status !== "cancelled") {
            return <span className="refund-status refund-na">-</span>;
        }

        // Kiểm tra trạng thái hoàn tiền từ dữ liệu appointment
        const refundStatus = appointment.refundStatus;
        const refundAmount = appointment.refundAmount || 10000; // Mặc định 10k VNĐ
        
        if (refundStatus === 'COMPLETED') {
            return (
                <div className="refund-status refund-completed">
                    <span className="refund-badge completed">Đã hoàn tiền</span>
                    <div className="refund-amount">{formatCurrency(refundAmount)}</div>
                    {appointment.refundCompletedBy && (
                        <div className="refund-details">
                            <small>Bởi: {appointment.refundCompletedBy}</small>
                            {appointment.refundCompletedAt && (
                                <small>{formatRefundDate(appointment.refundCompletedAt)}</small>
                            )}
                        </div>
                    )}
                </div>
            );
        } else if (refundStatus === 'PENDING_MANUAL_REFUND' || appointment.requiresManualRefund) {
            return (
                <div className="refund-status refund-pending">
                    <span className="refund-badge pending">Đang xử lý</span>
                    <div className="refund-amount">{formatCurrency(refundAmount)}</div>
                    <div className="refund-note">
                        <small>Chờ xử lý thủ công</small>
                    </div>
                </div>
            );
        } else {
            // Cuộc hẹn đã hủy nhưng không có thông tin hoàn tiền
            return (
                <div className="refund-status refund-unknown">
                    <span className="refund-badge unknown">Chưa xác định</span>
                </div>
            );
        }
    };

    // Hàm định dạng ngày hoàn tiền
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

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getAppointmentIcon = (status) => {
        return <Calendar className={`appointment-icon ${status}`} />;
    };

    const toggleAppointmentExpansion = (appointmentId) => {
        setExpandedAppointments(prev => ({
            ...prev,
            [appointmentId]: !prev[appointmentId]
        }));
    };

    // Hàm tính toán chính sách hoàn tiền
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
        
        // Tính toán chính sách hoàn tiền
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

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleBackHome = () => {
        navigate('/');
    };

    const handleMenuClick = (route) => {
        navigate(`/patient/${route}`);
    };

    // Hàm để hiển thị chi tiết cuộc hẹn
    const viewAppointmentDetails = async (appointmentId) => {
        try {
            setLoading(true);
            // Lấy thông tin chi tiết cuộc hẹn
            const details = await appointmentService.getAppointmentById(appointmentId);
            console.log("Raw appointment details:", JSON.stringify(details, null, 2));
            
            // Lấy thông tin hóa đơn của cuộc hẹn
            let invoiceDetails = null;
            try {
                invoiceDetails = await appointmentService.getAppointmentInvoice(appointmentId);
                console.log("Invoice details:", JSON.stringify(invoiceDetails, null, 2));
            } catch (invoiceError) {
                console.error("Lỗi khi lấy thông tin hóa đơn:", invoiceError);
                // Không throw lỗi ở đây để vẫn hiển thị thông tin cuộc hẹn nếu không có hóa đơn
            }
            
            // Xử lý dữ liệu dịch vụ - tính tổng phí của tất cả dịch vụ (giống logic tiếp tân)
            let serviceName = "Khám mắt tổng quát";
            let servicePrice = 0;
            
            if (details.services && Array.isArray(details.services) && details.services.length > 0) {
                // Tính tổng phí của tất cả dịch vụ
                servicePrice = details.services.reduce((total, service) => {
                    return total + Number(service.price || 0);
                }, 0);
                
                // Hiển thị tên dịch vụ đầu tiên hoặc tất cả nếu có nhiều
                if (details.services.length === 1) {
                    serviceName = details.services[0].name;
                } else {
                    serviceName = details.services.map(s => s.name).join(", ");
                }
            } else if (details.service && typeof details.service === 'object') {
                serviceName = details.service.name;
                servicePrice = Number(details.service.price || 0);
            } else if (details.serviceName) {
                serviceName = details.serviceName;
                servicePrice = Number(details.servicePrice || 0);
            }
            
            // Khởi tạo biến formattedDate và formattedTime
            let formattedDate = "Không có thông tin";
            let formattedTime = "Không có thông tin";
            
            // Log để kiểm tra dữ liệu
            console.log("Raw appointment details:", details);
            
            // Xử lý cho định dạng ISO "2025-07-14T09:00:00"
            if (details.appointmentTime && typeof details.appointmentTime === 'string') {
                try {
                    // Xử lý chuỗi ISO hoặc chuỗi với khoảng trắng
                    const dateTimeStr = details.appointmentTime;
                    const dateObj = new Date(dateTimeStr);
                    
                    if (!isNaN(dateObj.getTime())) {
                        // Định dạng ngày DD/MM/YYYY
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                        
                        // Định dạng giờ HH:MM
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        formattedTime = `${hours}:${minutes}`;
                    } else {
                        console.error("Không thể parse chuỗi thời gian:", dateTimeStr);
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý appointmentTime:", error);
                }
            } else if (details.appointmentDate && details.timeSlot) {
                // Backup: Sử dụng appointmentDate và timeSlot nếu có
                try {
                    const dateObj = new Date(`${details.appointmentDate}T${details.timeSlot}`);
                    
                    if (!isNaN(dateObj.getTime())) {
                        // Định dạng ngày DD/MM/YYYY
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                        
                        // Định dạng giờ HH:MM
                        formattedTime = details.timeSlot;
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý appointmentDate và timeSlot:", error);
                }
            }
            
            console.log("Thông tin thời gian đã format:", {
                formattedDate,
                formattedTime
            });
            
            // Xử lý dữ liệu bác sĩ - có thể có name hoặc fullName
            let doctorName = "Chưa phân công";
            if (details.doctor) {
                doctorName = details.doctor.name || details.doctor.fullName || "Chưa phân công";
            } else if (details.doctorName) {
                doctorName = details.doctorName;
            }
            
            // Lấy phí dịch vụ khám - đảm bảo là số
            console.log("Phí dịch vụ khám:", servicePrice);
            
            // Lấy thông tin thuốc từ API riêng (giống logic tiếp tân)
            let medicationDetails = { products: [], totalAmount: 0 };
            try {
                medicationDetails = await medicalRecordService.getMedicationsByAppointmentId(appointmentId);
                console.log("Medication details:", medicationDetails);
            } catch (medicationError) {
                console.log("Không có thông tin thuốc hoặc lỗi khi lấy thông tin thuốc:", medicationError);
                medicationDetails = { products: [], totalAmount: 0 };
            }
            
            // Kiểm tra trạng thái thanh toán
            const isCancelled = details.status === 'CANCELED';
            
            // Tính toán thông tin thanh toán (giống logic tiếp tân)
            const medicationAmount = medicationDetails?.totalAmount || 0;
            const invoiceTotalAmount = invoiceDetails?.totalAmount || 0;
            const treatmentCost = Math.max(0, invoiceTotalAmount - servicePrice - medicationAmount);
            const depositAmount = Number(invoiceDetails?.depositAmount || details.depositAmount || 0);
            
            // Với cuộc hẹn đã hủy: không tính phí dịch vụ, thuốc, điều trị
            const actualServicePrice = isCancelled ? 0 : servicePrice;
            const actualMedicationAmount = isCancelled ? 0 : medicationAmount;
            const actualTreatmentCost = isCancelled ? 0 : treatmentCost;
            
            // Tạm tính = phí dịch vụ + tiền thuốc + phí điều trị
            const totalAmount = actualServicePrice + actualMedicationAmount + actualTreatmentCost;
            
            // Số tiền cần thanh toán = tạm tính - tiền cọc (cuộc hẹn hủy = 0đ)
            const remainingAmount = isCancelled ? 0 : Math.max(0, totalAmount - depositAmount);
            
            console.log("Payment calculation:", {
                servicePrice,
                medicationAmount,
                treatmentCost,
                totalAmount,
                depositAmount,
                remainingAmount,
                invoiceTotalAmount,
                calculation: `${servicePrice} + ${medicationAmount} + ${treatmentCost} = ${totalAmount}, remaining: ${totalAmount} - ${depositAmount} = ${remainingAmount}`
            });
            
            // Kiểm tra trạng thái thanh toán
            const isFullyPaid = invoiceDetails?.paymentStatus === 'PAID' || 
                              details.status === "COMPLETED";
            
            // Debug: Kiểm tra thông tin bệnh nhân từ API
            console.log("Patient info from API:", {
                patientName: details.patientName,
                patientEmail: details.patientEmail,
                patientPhone: details.patientPhone
            });
            console.log("User info:", {
                name: user?.name,
                email: user?.email,
                phone: user?.phone
            });
            
            // Chuyển đổi trạng thái từ API sang định dạng hiển thị (giống logic tiếp tân)
            const formattedDetails = {
                ...details,
                id: details.id,
                date: formattedDate, // Thêm ngày đã format
                time: formattedTime, // Thêm giờ đã format
                patientName: details.patientName || user?.name || "Không có thông tin",
                patientEmail: details.patientEmail || user?.email || "Không có thông tin",
                patientPhone: details.patientPhone || user?.phone || "Không có thông tin",
                doctorName: doctorName,
                serviceName: serviceName,
                servicePrice: actualServicePrice,
                medicationAmount: actualMedicationAmount,
                medicationDetails: medicationDetails,
                treatmentCost: actualTreatmentCost,
                totalAmount: totalAmount,
                depositAmount: depositAmount,
                remainingAmount: remainingAmount,
                isFullyPaid: isFullyPaid,
                invoiceDetails: invoiceDetails,
                paymentStatus: isFullyPaid ? 'Đã thanh toán' : 'Chờ thanh toán',
                cancellationReason: details.cancellationReason || "",
                cancellationTime: details.cancellationTime || null,
                refundPolicy: details.cancellationTime ? calculateRefundPolicy(details.date || details.appointmentTime, details.cancellationTime) : null
            };
            
            console.log("Formatted details:", formattedDetails);
            console.log("Date and time in formattedDetails:", {
                date: formattedDetails.date,
                time: formattedDetails.time
            });
            setAppointmentDetails(formattedDetails);
            setShowDetailsModal(true);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết cuộc hẹn:", error);
            toast.error("Không thể lấy thông tin chi tiết cuộc hẹn");
            setLoading(false);
        }
    };
    
    // Hàm để đóng modal chi tiết
    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setAppointmentDetails(null);
    };

    
    // Hàm chuyển đổi trạng thái cuộc hẹn sang text hiển thị
    const getStatusText = (status) => {
        switch (status) {
            case "PENDING":
                return "Chờ xác nhận";
            case "CONFIRMED":
                return "Đã xác nhận";
            case "COMPLETED":
                return "Hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            case "RESCHEDULED":
                return "Đã đổi lịch";
            default:
                return "Chờ xác nhận";
        }
    };
    
    // Hàm lấy class CSS cho trạng thái cuộc hẹn
    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "status-pending";
            case "CONFIRMED":
                return "status-confirmed";
            case "COMPLETED":
                return "status-completed";
            case "CANCELLED":
                return "status-cancelled";
            case "RESCHEDULED":
                return "status-rescheduled";
            default:
                return "status-pending";
        }
    };

    return (
        <div className="main-content" style={{ margin: 0, width: '100%', boxSizing: 'border-box' }}>
            <ToastContainer />
            <div className="content-header">
                <h1>Danh sách cuộc hẹn</h1>
                <div className="header-actions">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm cuộc hẹn (Tên dịch vụ, bác sĩ...)"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`tab ${activeTab === "pending" ? "active" : ""}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Chờ xác nhận
                    </button>
                    <button
                        className={`tab ${activeTab === "confirmed" ? "active" : ""}`}
                        onClick={() => setActiveTab("confirmed")}
                    >
                        Đã xác nhận
                    </button>
                    <button
                        className={`tab ${activeTab === "completed" ? "active" : ""}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Đã hoàn thành
                    </button>
                    <button
                        className={`tab ${activeTab === "cancelled" ? "active" : ""}`}
                        onClick={() => setActiveTab("cancelled")}
                    >
                        Đã hủy
                    </button>
                </div>
            </div>

            <div className="appointments-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : getFilteredAppointments().length === 0 ? (
                    <div className="no-appointments">
                        <p>Không có cuộc hẹn nào</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="appointments-table">
                            <thead>
                                <tr>
                                    <th className="column-id">#</th>
                                    <th className="column-service">Tên dịch vụ</th>
                                    <th className="column-date">
                                        Ngày hẹn
                                        <button className="sort-button" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
                                            {sortOrder === "newest" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </th>
                                    <th className="column-doctor">Bác sĩ</th>
                                    <th className="column-status">Trạng thái cuộc hẹn</th>
                                    <th className="column-refund">Hoàn tiền</th>
                                    <th className="column-notes">Lý do khám</th>
                                    <th className="column-actions">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredAppointments().map((appointment, index) => (
                                    <tr key={appointment.id} className={`appointment-row ${appointment.status}`}>
                                        <td className="column-id">{index + 1}</td>
                                        <td className="column-service">{appointment.service}</td>
                                        <td className="column-date">{appointment.date} - {appointment.time}</td>
                                        <td className="column-doctor">{appointment.doctor}</td>
                                        <td className="column-status">{getStatusBadge(appointment.status)}</td>
                                        <td className="column-refund">{getRefundStatus(appointment)}</td>
                                        <td className="column-notes">{appointment.notes}</td>
                                        <td className="column-actions">
                                            <div className="action-buttons">
                                                <button
                                                    className="view-details-button"
                                                    onClick={() => viewAppointmentDetails(appointment.id)}
                                                >
                                                    <FileText size={16} />
                                                    <span>Chi tiết</span>
                                                </button>
                                                {appointment.canCancel && (
                                                    <button
                                                        className="cancel-button"
                                                        onClick={() => openCancelDialog(appointment)}
                                                        disabled={loading}
                                                    >
                                                        <History size={16} />
                                                        <span>Hủy lịch</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="pagination-container">
                            <div className="pagination-controls">
                                <button className="pagination-button">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="pagination-current">1</span>
                                <button className="pagination-button">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                            <div className="pagination-info">
                                <span>10 / page</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Hộp thoại xác nhận hủy lịch */}
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
                                    <span className="info-value">
                                        {selectedAppointment.date} - {selectedAppointment.time}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Bác sĩ:</span>
                                    <span className="info-value">{selectedAppointment.doctor}</span>
                                </div>
                            </div>
                            
                            {cancellationInfo && (
                                <div className={`refund-policy-alert ${cancellationInfo.isRefundable ? 'refund-yes' : 'refund-no'}`}>
                                    <h4>Chính sách hoàn tiền:</h4>
                                    {cancellationInfo.isRefundable ? (
                                        <p>
                                            <strong>Hoàn tiền 100%</strong> - Bạn hủy lịch {cancellationInfo.hoursRemaining} giờ trước lịch hẹn 
                                            (hơn 24 giờ trước lịch hẹn).
                                        </p>
                                    ) : (
                                        <p>
                                            <strong>Không hoàn tiền</strong> - Bạn hủy lịch quá gần thởi gian hẹn 
                                            (dưới 24 giờ trước lịch hẹn).
                                        </p>
                                    )}
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
                            <button 
                                className="cancel-button-secondary" 
                                onClick={closeCancelDialog}
                            >
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
            
            {/* Modal hiển thị chi tiết cuộc hẹn */}
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
                                            <span className="details-value">
                                                {(() => {
                                                    if (appointmentDetails.services && appointmentDetails.services.length > 0) {
                                                        // Hiển thị tất cả tên dịch vụ cách nhau bởi dấu phẩy
                                                        const serviceNames = appointmentDetails.services.map(service => 
                                                            service.serviceName || service.name
                                                        ).filter(name => name);
                                                        return serviceNames.length > 0 ? serviceNames.join(", ") : "Khám mắt tổng quát";
                                                    } else if (appointmentDetails.serviceName) {
                                                        return appointmentDetails.serviceName;
                                                    } else {
                                                        return "Khám mắt tổng quát";
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Ngày hẹn:</span>
                                            <span className="details-value highlight-date">
                                                {appointmentDetails.date || "Không có thông tin"}
                                            </span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Giờ hẹn:</span>
                                            <span className="details-value highlight-time">
                                                {appointmentDetails.time || "Không có thông tin"}
                                            </span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Bác sĩ:</span>
                                            <span className="details-value">{appointmentDetails.doctorName || "Chưa phân công"}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Trạng thái:</span>
                                            <span className="details-value status-container">
                                                {getStatusBadge(mapAppointmentStatus(appointmentDetails.status))}
                                            </span>
                                        </div>
                                        <div className="details-row full-width">
                                            <span className="details-label">Lý do khám:</span>
                                            <span className="details-value notes-text">{appointmentDetails.notes || 'Không có'}</span>
                                        </div>
                                        
                                        {/* Hiển thị lý do hủy nếu cuộc hẹn đã bị hủy */}
                                        {appointmentDetails.status === 'CANCELED' && appointmentDetails.cancellationReason && (
                                            <div className="details-row full-width cancellation-reason">
                                                <span className="details-label cancellation-label">Lý do hủy:</span>
                                                <span className="details-value cancellation-text">{appointmentDetails.cancellationReason}</span>
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị thông tin hoàn tiền chi tiết nếu cuộc hẹn đã bị hủy */}
                                        {appointmentDetails.status === 'CANCELED' && (
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
                                                        <div className="details-value refund-status-container">
                                                            {getRefundStatus(appointmentDetails)}
                                                        </div>
                                                    </div>
                                                    <div className="details-row">
                                                        <span className="details-label">Số tiền hoàn:</span>
                                                        <span className="details-value highlight">
                                                            {formatCurrency(appointmentDetails.refundAmount || 10000)}
                                                        </span>
                                                    </div>
                                                    <div className="details-row">
                                                        <span className="details-label">Phương thức hoàn tiền:</span>
                                                        <span className="details-value">
                                                            Hoàn tiền thủ công (Chuyển khoản)
                                                        </span>
                                                    </div>
                                                    {appointmentDetails.refundCompletedBy && (
                                                        <div className="details-row">
                                                            <span className="details-label">Người xử lý:</span>
                                                            <span className="details-value">
                                                                {appointmentDetails.refundCompletedBy}
                                                                {appointmentDetails.refundCompletedByRole && (
                                                                    <span className="role-badge"> ({appointmentDetails.refundCompletedByRole})</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {appointmentDetails.refundCompletedAt && (
                                                        <div className="details-row">
                                                            <span className="details-label">Thời gian hoàn tất:</span>
                                                            <span className="details-value">
                                                                {formatRefundDate(appointmentDetails.refundCompletedAt)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Phần thông tin bệnh nhân */}
                                <div className="details-section patient-info">
                                    <div className="section-header">
                                        <div className="icon-container">
                                            <User size={20} />
                                        </div>
                                        <h4>Thông tin bệnh nhân</h4>
                                    </div>
                                    <div className="details-grid">
                                        <div className="details-row">
                                            <span className="details-label">Họ tên:</span>
                                            <span className="details-value">{appointmentDetails.patientName || user?.name || "Không có thông tin"}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Email:</span>
                                            <span className="details-value">{user?.email || appointmentDetails.patientEmail || "Không có thông tin"}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Số điện thoại:</span>
                                            <span className="details-value">{appointmentDetails.patientPhone || user?.phone || "Không có thông tin"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phần thông tin thanh toán */}
                                <div className="details-section payment-details">
                                    <div className="section-header">
                                        <div className="icon-container">
                                            <Package size={20} />
                                        </div>
                                        <h4>Thông tin thanh toán</h4>
                                    </div>
                                    {(appointmentDetails.totalAmount || appointmentDetails.depositAmount) ? (
                                        <div className="appointment-detail-modal__invoice">
                                            <div className="appointment-detail-modal__invoice-header">
                                                <div className="appointment-detail-modal__invoice-title">Hóa đơn #{appointmentDetails.id}</div>
                                                <div className={`appointment-detail-modal__invoice-status ${appointmentDetails.isFullyPaid ? "appointment-detail-modal__invoice-status--paid" : "appointment-detail-modal__invoice-status--waiting"}`}>
                                                    {appointmentDetails.isFullyPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                                                </div>
                                            </div>
                                            
                                            <div className="appointment-detail-modal__invoice-items">
                                                {/* Phí dịch vụ khám */}
                                                <div className="appointment-detail-modal__invoice-item">
                                                    <div>Phí dịch vụ khám</div>
                                                    <div>
                                                        {formatCurrency(appointmentDetails.servicePrice)}
                                                    </div>
                                                </div>
                                                
                                                {/* Tiền thuốc */}
                                                <div className="appointment-detail-modal__invoice-item">
                                                    <div>Tiền thuốc</div>
                                                    <div>
                                                        {formatCurrency(appointmentDetails.medicationAmount || 0)}
                                                    </div>
                                                </div>
                                                
                                                {/* Phí điều trị (nếu có) */}
                                                {appointmentDetails.treatmentCost > 0 && (
                                                    <div className="appointment-detail-modal__invoice-item">
                                                        <div>Phí điều trị</div>
                                                        <div>
                                                            {formatCurrency(appointmentDetails.treatmentCost)}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Tạm tính */}
                                                <div className="appointment-detail-modal__invoice-subtotal">
                                                    <div>Tạm tính</div>
                                                    <div>
                                                        {formatCurrency(appointmentDetails.totalAmount)}
                                                    </div>
                                                </div>
                                                
                                                {/* Tiền cọc đã thanh toán */}
                                                {appointmentDetails.depositAmount > 0 && (
                                                    <div className="appointment-detail-modal__invoice-item appointment-detail-modal__invoice-item--deposit">
                                                        <div>Tiền cọc đã thanh toán</div>
                                                        <div className="deposit-amount">-{formatCurrency(appointmentDetails.depositAmount)}</div>
                                                    </div>
                                                )}
                                                
                                            </div>
                                            
                                            <div className="appointment-detail-modal__invoice-total">
                                                <div>Số tiền cần thanh toán</div>
                                                <div className="remaining-amount">
                                                    {formatCurrency(appointmentDetails.remainingAmount)}
                                                </div>
                                            </div>
                                            
                                            {appointmentDetails.isFullyPaid && appointmentDetails.invoiceDetails?.paidAt && (
                                                <div className="payment-time">
                                                    <span>Thời gian thanh toán: </span>
                                                    <span>
                                                        {new Date(appointmentDetails.invoiceDetails.paidAt).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-payment-info">
                                            Chưa có thông tin thanh toán
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {appointmentDetails.status === "pending" || appointmentDetails.status === "confirmed" ? (
                                <button 
                                    className="cancel-button-primary" 
                                    onClick={() => {
                                        closeDetailsModal();
                                        openCancelDialog(appointmentDetails);
                                    }}
                                >
                                    Hủy lịch hẹn
                                </button>
                            ) : null}
                            <button 
                                className="close-button-secondary" 
                                onClick={closeDetailsModal}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}