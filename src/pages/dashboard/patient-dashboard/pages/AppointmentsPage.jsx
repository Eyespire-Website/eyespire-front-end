import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import appointmentService from "../../../../services/appointmentService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/appointmentsPatient.css';
import { Calendar, Package, FileText, History, User, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

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
                const appointmentDate = new Date(appointment.appointmentTime);
                
                // Debug: Kiểm tra từng appointment
                console.log("Processing appointment:", appointment);
                
                // Xử lý tên dịch vụ - thử nhiều cách tiếp cận khác nhau
                let serviceName = "Tư vấn & Điều trị";
                
                // Kiểm tra tất cả các trường có thể chứa thông tin dịch vụ
                if (appointment.service && appointment.service.name) {
                    serviceName = appointment.service.name;
                } else if (appointment.service && typeof appointment.service === 'string') {
                    serviceName = appointment.service;
                } else if (appointment.medicalService && appointment.medicalService.name) {
                    serviceName = appointment.medicalService.name;
                } else if (appointment.serviceName) {
                    serviceName = appointment.serviceName;
                }
                
                // Ánh xạ ID dịch vụ sang tên cố định (tạm thởi)
                if (appointment.serviceId === 1 || appointment.service_id === 1) {
                    serviceName = "Khám mắt tổng quát";
                } else if (appointment.serviceId === 2 || appointment.service_id === 2) {
                    serviceName = "Đo khúc xạ";
                } else if (appointment.serviceId === 3 || appointment.service_id === 3) {
                    serviceName = "Khám & điều trị bệnh về mắt";
                }
                
                return {
                    id: appointment.id,
                    service: serviceName,
                    date: formatDate(appointmentDate),
                    time: formatTime(appointmentDate),
                    doctor: appointment.doctor ? `BS. ${appointment.doctor.name}` : "Chưa xác định",
                    status: mapAppointmentStatus(appointment.status),
                    reason: appointment.reason || "Không có thông tin",
                    notes: appointment.notes || "Quý khách vui lòng tới trước giờ hẹn 15 phút!",
                    canCancel: mapAppointmentStatus(appointment.status) === "pending" || mapAppointmentStatus(appointment.status) === "confirmed",
                    location: appointment.location || "Trung tâm Mắt EyeSpire",
                    room: appointment.room || "Phòng 101",
                    duration: appointment.duration || "30 phút",
                    cancellationTime: appointment.cancellationTime || null,
                    cancellationReason: appointment.cancellationReason || "",
                    appointmentTime: appointment.appointmentTime
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
            default:
                return <span className="status-badge">Không xác định</span>;
        }
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

        // Hàm tính toán chính sách hoàn tiền dựa trên thời gian hủy
        const calculateRefundPolicy = (appointmentDate, cancellationTime) => {
            if (!appointmentDate || !cancellationTime) return null;
            
            const appointmentTime = new Date(appointmentDate).getTime();
            const cancelTime = new Date(cancellationTime).getTime();
            const hoursDifference = (appointmentTime - cancelTime) / (1000 * 60 * 60);
            
            return {
                isRefundable: hoursDifference >= 24,
                hoursRemaining: Math.floor(hoursDifference)
            };
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
                                        <td className="column-notes">{appointment.notes}</td>
                                        <td className="column-actions">
                                            {appointment.canCancel && (
                                                <button
                                                    className="cancel-button"
                                                    onClick={() => openCancelDialog(appointment)}
                                                    disabled={loading}
                                                >
                                                    Hủy lịch
                                                </button>
                                            )}
                                            {appointment.status === "cancelled" && (
                                                <div className="cancellation-info">
                                                    <span className="cancellation-time">
                                                        Đã hủy: {formatCancellationTime(appointment.cancellationTime || new Date())}
                                                    </span>
                                                </div>
                                            )}
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
                                            <strong>Không hoàn tiền</strong> - Bạn hủy lịch quá gần thời gian hẹn 
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
        </div>
    );
}