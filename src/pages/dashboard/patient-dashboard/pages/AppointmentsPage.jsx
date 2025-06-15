import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/appointmentsPatient.css';
import { Calendar, Package, FileText, History, User, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

import PatientSidebar from '../PatientSidebar';

export default function AppointmentsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Đỗ Quang Dũng",
        email: "doquangdung1782004@gmail.com",
        role: "patient",
    });

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedAppointments, setExpandedAppointments] = useState({});
    const [loading, setLoading] = useState(false);

    // Dữ liệu mẫu cho cuộc hẹn
    const appointments = [
        {
            id: 1,
            service: "Tư vấn & Điều trị",
            date: "23/11/2024",
            time: "10:30",
            doctor: "BS. Đỗ Thị Mỹ Uyên",
            status: "confirmed",
            notes: "Quý khách vui lòng tới trước giờ hẹn 15 phút!",
            canCancel: true,
        },
        {
            id: 2,
            service: "Khám cận",
            date: "16/11/2024",
            time: "14:00",
            doctor: "BS. Đỗ Thị Mỹ Uyên",
            status: "cancelled",
            notes: "Cuộc hẹn đã bị hủy do quá hạn!",
            canCancel: false,
        },
        {
            id: 3,
            service: "Tư vấn & Điều trị",
            date: "14/11/2024",
            time: "09:15",
            doctor: "BS. Đỗ Thị Mỹ Uyên",
            status: "completed",
            notes: "Cuộc hẹn đã hoàn thành thành công.",
            canCancel: false,
        },
        {
            id: 4,
            service: "Khám đục tinh thể",
            date: "14/11/2024",
            time: "11:00",
            doctor: "BS. Đỗ Thị Mỹ Uyên",
            status: "cancelled",
            notes: "Xin chào quý khách! Trung tâm rất xin lỗi khi ngày 14/11/2024 sẽ không thể thực hiện dịch vụ khám đục tinh thể cho quý khách do có đoàn thanh tra của bộ y tế xuống kiểm tra. Quý khách sẽ được hoàn tiền theo quy định bên công ty. Trung tâm tạm sẽ liên hệ lại với quý khách để sắp xếp lại! Mong quý khách thông cảm!",
            canCancel: false,
        },
        {
            id: 5,
            service: "Khám lé",
            date: "14/11/2024",
            time: "15:30",
            doctor: "BS. Đỗ Thị Mỹ Uyên",
            status: "cancelled",
            notes: "Cuộc hẹn đã bị hủy do quá hạn!",
            canCancel: false,
        },
    ];

    // Lấy thông tin người dùng khi component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    // Lọc và sắp xếp cuộc hẹn
    const getFilteredAppointments = () => {
        let filteredAppointments = [...appointments];

        // Lọc theo tab
        if (activeTab === "confirmed") {
            filteredAppointments = appointments.filter(apt => apt.status === "confirmed");
        } else if (activeTab === "completed") {
            filteredAppointments = appointments.filter(apt => apt.status === "completed");
        } else if (activeTab === "cancelled") {
            filteredAppointments = appointments.filter(apt => apt.status === "cancelled");
        }

        // Sắp xếp theo ngày
        filteredAppointments.sort((a, b) => {
            const dateA = a.date.split("/").reverse().join("");
            const dateB = b.date.split("/").reverse().join("");
            return sortOrder === "newest"
                ? dateB.localeCompare(dateA)
                : dateA.localeCompare(dateB);
        });

        // Lọc theo search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredAppointments = filteredAppointments.filter(
                (appointment) =>
                    appointment.service.toLowerCase().includes(query) ||
                    appointment.doctor.toLowerCase().includes(query) ||
                    appointment.status.toLowerCase().includes(query)
            );
        }

        return filteredAppointments;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            "confirmed": { text: "Đã xác nhận", class: "status-confirmed" },
            "cancelled": { text: "Đã hủy", class: "status-cancelled" },
            "completed": { text: "Đã hoàn thành", class: "status-completed" },
            "pending": { text: "Chờ xác nhận", class: "status-pending" }
        };

        const statusInfo = statusMap[status] || { text: status, class: "status-default" };

        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    const getAppointmentIcon = (status) => {
        return (
            <div className={`appointment-icon ${status}-icon`}>
                <Calendar size={20} />
            </div>
        );
    };

    const toggleAppointmentExpansion = (appointmentId) => {
        setExpandedAppointments(prev => ({
            ...prev,
            [appointmentId]: !prev[appointmentId]
        }));
    };

    const handleCancelAppointment = (appointmentId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này?")) {
            toast.success("Cuộc hẹn đã được hủy thành công!");
            // Logic hủy cuộc hẹn ở đây
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleBackHome = () => {
        navigate('/');
    };

    const handleMenuClick = (route) => {
        navigate(route);
    };

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />



            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="content-header">
                    <h1>Danh sách cuộc hẹn</h1>
                    <div className="header-actions">
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm cuộc hẹn (Tên dịch vụ, bác sĩ)"
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="user-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                user?.name?.charAt(0) || "U"
                            )}
                        </div>
                    </div>
                </header>

                {/* Appointments Content */}
                <div className="appointments-content">
                    {/* Tabs and Filters */}
                    <div className="content-controls">
                        <div className="tabs-container">
                            <div className="tabs">
                                <button
                                    className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    Tất cả cuộc hẹn
                                </button>
                                <button
                                    className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('confirmed')}
                                >
                                    Đã xác nhận
                                </button>
                                <button
                                    className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('completed')}
                                >
                                    Đã hoàn thành
                                </button>
                                <button
                                    className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('cancelled')}
                                >
                                    Đã hủy
                                </button>
                            </div>
                        </div>

                        <div className="filters-container">
                            <button className="filter-button">
                                <Filter size={16} />
                                <span>Lọc</span>
                            </button>
                            <select
                                className="sort-select"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Appointments List */}
                    <div className="appointments-container">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="appointments-list">
                                {getFilteredAppointments().map((appointment) => (
                                    <div key={appointment.id} className="appointment-card">
                                        <div className="appointment-header">
                                            <div className="appointment-info">
                                                <div className="appointment-icon-container">
                                                    {getAppointmentIcon(appointment.status)}
                                                </div>
                                                <div className="appointment-details">
                                                    <h3 className="appointment-title">
                                                        {appointment.service}
                                                    </h3>
                                                    <div className="appointment-meta">
                                                        <span className="appointment-id">Mã cuộc hẹn: #{appointment.id}</span>
                                                        <span className="appointment-datetime">
                                                            {appointment.date} - {appointment.time}
                                                        </span>
                                                    </div>
                                                    <div className="appointment-doctor">
                                                        <span className="doctor-label">Bác sĩ:</span>
                                                        <span className="doctor-name">{appointment.doctor}</span>
                                                    </div>
                                                    <div className="appointment-status-row">
                                                        <span className="status-label">Trạng thái:</span>
                                                        {getStatusBadge(appointment.status)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="appointment-actions">
                                                <button
                                                    className="expand-button"
                                                    onClick={() => toggleAppointmentExpansion(appointment.id)}
                                                >
                                                    {expandedAppointments[appointment.id] ? (
                                                        <>
                                                            <ChevronUp size={16} />
                                                            <span>Thu gọn</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown size={16} />
                                                            <span>Xem chi tiết</span>
                                                        </>
                                                    )}
                                                </button>
                                                {appointment.canCancel && (
                                                    <button
                                                        className="cancel-button"
                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                    >
                                                        Hủy lịch
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {expandedAppointments[appointment.id] && (
                                            <div className="appointment-expanded">
                                                <h4>Chi tiết cuộc hẹn</h4>
                                                <div className="appointment-details-grid">
                                                    <div className="detail-row">
                                                        <span className="detail-label">Địa chỉ khám:</span>
                                                        <span className="detail-value">Trung tâm Mắt EyeSpire</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Phòng khám:</span>
                                                        <span className="detail-value">Phòng 101</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Thời gian dự kiến:</span>
                                                        <span className="detail-value">30 phút</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Ghi chú từ trung tâm:</span>
                                                        <span className="detail-value">
                                                            {appointment.notes || "Không có ghi chú"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {getFilteredAppointments().length === 0 && (
                                    <div className="empty-state">
                                        <div className="empty-icon">📅</div>
                                        <h3>Không có cuộc hẹn nào</h3>
                                        <p>Chưa có cuộc hẹn nào phù hợp với bộ lọc của bạn.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}