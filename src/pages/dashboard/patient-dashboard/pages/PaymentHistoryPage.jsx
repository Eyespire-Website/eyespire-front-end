import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/payment-history.css';
import { Calendar, Package, FileText, History, User, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

import PatientSidebar from '../PatientSidebar';

export const patientMenuItems = [
    { id: "appointments", label: "Danh sách cuộc hẹn", icon: Calendar, route: "/appointments" },
    { id: "orders", label: "Theo dõi đơn hàng", icon: Package, route: "/orders" },
    { id: "medical", label: "Hồ sơ điều trị", icon: FileText, route: "/medical-records" },
    { id: "history", label: "Lịch sử thanh toán", icon: History, route: "/payment-history" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User, route: "/profile" },
];

export default function PaymentHistoryPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Đỗ Quang Dũng",
        email: "doquangdung1782004@gmail.com",
        role: "patient",
    });

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedInvoices, setExpandedInvoices] = useState({});
    const [loading, setLoading] = useState(false);

    // Dữ liệu mẫu cho hóa đơn dịch vụ
    const serviceInvoices = [
        {
            id: "SRV001",
            date: "14/11/2024",
            service: "Tiêm ngừa",
            amount: "10.000 đ",
            status: "paid",
            type: "service",
        },
        {
            id: "SRV002",
            date: "14/11/2024",
            service: "Tư vấn & Điều trị",
            amount: "50.000 đ",
            status: "paid",
            type: "service",
        },
        {
            id: "SRV003",
            date: "13/11/2024",
            service: "Tư vấn & Điều trị",
            amount: "51.000 đ",
            status: "paid",
            type: "service",
        },
        {
            id: "SRV004",
            date: "12/11/2024",
            service: "Khám mắt định kỳ",
            amount: "150.000 đ",
            status: "pending",
            type: "service",
        },
    ];

    // Dữ liệu mẫu cho hóa đơn đơn hàng
    const orderInvoices = [
        {
            id: "ORD001",
            date: "15/11/2024",
            service: "Kính cận Essilor",
            amount: "2.500.000 đ",
            status: "paid",
            type: "order",
        },
        {
            id: "ORD002",
            date: "10/11/2024",
            service: "Thuốc nhỏ mắt Refresh",
            amount: "150.000 đ",
            status: "paid",
            type: "order",
        },
        {
            id: "ORD003",
            date: "05/11/2024",
            service: "Kính râm UV Protection",
            amount: "800.000 đ",
            status: "pending",
            type: "order",
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

    // Kết hợp và lọc hóa đơn dựa trên tab và search
    const getFilteredInvoices = () => {
        let invoices = [];

        if (activeTab === "all") {
            invoices = [...serviceInvoices, ...orderInvoices];
        } else if (activeTab === "service") {
            invoices = serviceInvoices;
        } else if (activeTab === "order") {
            invoices = orderInvoices;
        }

        // Sắp xếp theo ngày
        invoices.sort((a, b) => {
            const dateA = a.date.split("/").reverse().join("");
            const dateB = b.date.split("/").reverse().join("");
            return sortOrder === "newest"
                ? dateB.localeCompare(dateA)
                : dateA.localeCompare(dateB);
        });

        // Lọc theo search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            invoices = invoices.filter(
                (invoice) =>
                    invoice.service.toLowerCase().includes(query) ||
                    invoice.status.toLowerCase().includes(query) ||
                    invoice.id.toLowerCase().includes(query),
            );
        }

        return invoices;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            "paid": { text: "Đã thanh toán", class: "status-paid" },
            "pending": { text: "Chờ thanh toán", class: "status-pending" },
            "cancelled": { text: "Đã hủy", class: "status-cancelled" }
        };

        const statusInfo = statusMap[status] || { text: status, class: "status-default" };

        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    const getInvoiceIcon = (type) => {
        return type === "service" ? (
            <div className="invoice-icon service-icon">
                <FileText size={20} />
            </div>
        ) : (
            <div className="invoice-icon order-icon">
                <Package size={20} />
            </div>
        );
    };

    const toggleInvoiceExpansion = (invoiceId) => {
        setExpandedInvoices(prev => ({
            ...prev,
            [invoiceId]: !prev[invoiceId]
        }));
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
        <div className="main-content" style={{ margin: 0, width: '100%', boxSizing: 'border-box' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <header className="content-header">
                <h1>Lịch sử thanh toán</h1>
                <div className="header-actions">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm hóa đơn (Dịch vụ, trạng thái)"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
                        <Filter size={16} />
                        <span>{sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
                    </button>
                </div>
            </header>

            {/* Payment History Content */}
            <div className="payment-history-content">
                {/* Tabs and Filters */}
                <div className="content-controls">
                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                Tất cả hóa đơn
                            </button>
                            <button
                                className={`tab ${activeTab === 'service' ? 'active' : ''}`}
                                onClick={() => setActiveTab('service')}
                            >
                                Hóa đơn dịch vụ
                            </button>
                            <button
                                className={`tab ${activeTab === 'order' ? 'active' : ''}`}
                                onClick={() => setActiveTab('order')}
                            >
                                Hóa đơn đơn hàng
                            </button>
                        </div>
                    </div>

                    <div className="filters-container">
                        <select
                            className="sort-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="highest">Giá cao nhất</option>
                            <option value="lowest">Giá thấp nhất</option>
                        </select>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="invoices-container">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="invoices-list">
                            {getFilteredInvoices().map((invoice) => (
                                <div key={invoice.id} className="invoice-card">
                                    <div className="invoice-header">
                                        <div className="invoice-info">
                                            <div className="invoice-icon-container">
                                                {getInvoiceIcon(invoice.type)}
                                            </div>
                                            <div className="invoice-details">
                                                <h3 className="invoice-title">
                                                    {invoice.service}
                                                    <span className="invoice-type">
                                                        ({invoice.type === "service" ? "Dịch vụ" : "Đơn hàng"})
                                                    </span>
                                                </h3>
                                                <div className="invoice-meta">
                                                    <span className="invoice-id">Mã hóa đơn: {invoice.id}</span>
                                                    <span className="invoice-date">Ngày tạo: {invoice.date}</span>
                                                </div>
                                                <div className="invoice-status-row">
                                                    <span className="status-label">Trạng thái:</span>
                                                    {getStatusBadge(invoice.status)}
                                                </div>
                                                <div className="invoice-amount">{invoice.amount}</div>
                                            </div>
                                        </div>

                                        <div className="invoice-actions">
                                            <button
                                                className="expand-button"
                                                onClick={() => toggleInvoiceExpansion(invoice.id)}
                                            >
                                                {expandedInvoices[invoice.id] ? (
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
                                            <button className="download-button">
                                                Tải hóa đơn
                                            </button>
                                        </div>
                                    </div>

                                    {expandedInvoices[invoice.id] && (
                                        <div className="invoice-expanded">
                                            <h4>Chi tiết hóa đơn</h4>
                                            <div className="invoice-details-grid">
                                                <div className="detail-row">
                                                    <span className="detail-label">Phương thức thanh toán:</span>
                                                    <span className="detail-value">Tiền mặt</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Người thanh toán:</span>
                                                    <span className="detail-value">{user.name}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Thời gian thanh toán:</span>
                                                    <span className="detail-value">{invoice.date} 10:30</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Ghi chú:</span>
                                                    <span className="detail-value">Không có</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {getFilteredInvoices().length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">📄</div>
                                    <h3>Không có hóa đơn nào</h3>
                                    <p>Chưa có hóa đơn nào phù hợp với bộ lọc của bạn.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}