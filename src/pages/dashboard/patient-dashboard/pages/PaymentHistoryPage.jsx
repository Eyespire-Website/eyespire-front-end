import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import paymentHistoryService from "../../../../services/paymentHistoryService";
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
    const [user, setUser] = useState(null);

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedInvoices, setExpandedInvoices] = useState({});
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [error, setError] = useState(null);

    // Lấy thông tin người dùng và lịch sử thanh toán khi component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);
                
                // Lấy lịch sử thanh toán
                await fetchPaymentHistory(currentUser.id, currentUser.name);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);
    
    // Hàm lấy lịch sử thanh toán từ API
    const fetchPaymentHistory = async (userId, userName = "Người dùng") => {
        try {
            setLoading(true);
            setError(null);
            const data = await paymentHistoryService.getUserPaymentHistory(userId);
            
            console.log("Dữ liệu gốc từ API:", data);
            
            // Xử lý và chuẩn hóa dữ liệu từ API
            const processedData = data.map(invoice => {
                // Kiểm tra nếu là hóa đơn từ bảng appointment_invoices (có appointment_id)
                if (invoice.appointment_id) {
                    // Kiểm tra nếu cuộc hẹn có status là COMPLETED
                    if (invoice.appointment_status === 'COMPLETED') {
                        return {
                            id: invoice.id,
                            date: formatDate(invoice.created_at),
                            paidDate: invoice.paid_at ? formatDate(invoice.paid_at) : null,
                            service: `Cuộc hẹn #${invoice.appointment_id}`,
                            serviceName: `Cuộc hẹn #${invoice.appointment_id}`,
                            amount: formatCurrency(invoice.total_amount),
                            rawAmount: invoice.total_amount,
                            status: invoice.is_fully_paid ? "paid" : "pending",
                            type: "service",
                            paymentMethod: invoice.transaction_id ? 
                                (invoice.transaction_id.startsWith("CASH") ? "Tiền mặt" : "Chuyển khoản") 
                                : "Chưa thanh toán",
                            payerName: userName,
                            depositAmount: formatCurrency(invoice.deposit_amount || 0),
                            remainingAmount: formatCurrency(invoice.remaining_amount || 0),
                            transactionId: invoice.transaction_id || "Chưa có",
                            appointmentId: invoice.appointment_id
                        };
                    } else {
                        // Bỏ qua các hóa đơn cuộc hẹn không có status COMPLETED
                        return null;
                    }
                } else if (invoice.id && invoice.id.startsWith('ORD')) {
                    // Đây là hóa đơn đơn hàng
                    return {
                        ...invoice,
                        date: invoice.date || formatDate(invoice.created_at),
                        amount: invoice.amount || formatCurrency(invoice.total_amount),
                        type: "order"
                    };
                } else {
                    // Các loại hóa đơn khác (nếu có)
                    return invoice;
                }
            }).filter(invoice => invoice !== null); // Lọc bỏ các phần tử null
            
            console.log("Dữ liệu đã xử lý:", processedData);
            setInvoices(processedData);
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử thanh toán:", error);
            setError("Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.");
            toast.error("Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm định dạng ngày tháng từ chuỗi ISO
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "0 đ";
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount).replace('₫', 'đ');
    };

    // Hàm lọc theo loại thanh toán
    const handleFilterByType = async (type) => {
        try {
            setLoading(true);
            setActiveTab(type);
            setError(null);
            
            if (type === "all") {
                await fetchPaymentHistory(user.id, user.name);
            } else {
                const filteredData = await paymentHistoryService.filterPaymentHistory(user.id, type);
                setInvoices(filteredData);
            }
        } catch (error) {
            console.error("Lỗi khi lọc lịch sử thanh toán:", error);
            setError("Không thể lọc lịch sử thanh toán. Vui lòng thử lại sau.");
            toast.error("Không thể lọc lịch sử thanh toán. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm tìm kiếm
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            await fetchPaymentHistory(user.id, user.name);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const searchResults = await paymentHistoryService.searchPaymentHistory(user.id, searchQuery);
            setInvoices(searchResults);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm lịch sử thanh toán:", error);
            setError("Không thể tìm kiếm lịch sử thanh toán. Vui lòng thử lại sau.");
            toast.error("Không thể tìm kiếm lịch sử thanh toán. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm sắp xếp hóa đơn
    const handleSort = () => {
        const newSortOrder = sortOrder === "newest" ? "oldest" : "newest";
        setSortOrder(newSortOrder);
        
        // Sắp xếp mảng invoices theo ngày
        const sortedInvoices = [...invoices].sort((a, b) => {
            const dateA = a.date.split("/").reverse().join("");
            const dateB = b.date.split("/").reverse().join("");
            return newSortOrder === "newest"
                ? dateB.localeCompare(dateA)
                : dateA.localeCompare(dateB);
        });
        
        setInvoices(sortedInvoices);
    };

    const getStatusBadge = (status) => {
        let badgeClass = "";
        let statusText = "";

        switch (status) {
            case "paid":
                badgeClass = "status-badge paid";
                statusText = "Đã thanh toán";
                break;
            case "pending":
                badgeClass = "status-badge pending";
                statusText = "Chờ thanh toán";
                break;
            case "cancelled":
                badgeClass = "status-badge cancelled";
                statusText = "Đã hủy";
                break;
            default:
                badgeClass = "status-badge";
                statusText = "Không xác định";
        }

        return <span className={badgeClass}>{statusText}</span>;
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

    const viewInvoiceDetail = (invoice) => {
        navigate(`/payment-history/${invoice.id}/${invoice.type}`);
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
            <PatientSidebar
                activeTab="payment-history"
                setActiveTab={(tabId) => {
                    // Handle tab change
                    const menuItem = patientMenuItems.find(item => item.id === tabId);
                    if (menuItem) {
                        navigate(menuItem.route);
                    }
                }}
            />

            <ToastContainer position="top-right" autoClose={3000} />

            <header className="content-header">
                <h1>Lịch sử thanh toán</h1>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm hóa đơn..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            Tìm kiếm
                        </button>
                    </div>
                    <button className="filter-button" onClick={handleSort}>
                        <Filter size={18} />
                        <span>Sắp xếp: {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
                        {sortOrder === "newest" ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </header>

            {/* Payment History Content */}
            <div className="payment-history-content">
                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => handleFilterByType('all')}
                        >
                            Tất cả hóa đơn
                        </button>
                        <button
                            className={`tab ${activeTab === 'service' ? 'active' : ''}`}
                            onClick={() => handleFilterByType('service')}
                        >
                            Hóa đơn dịch vụ
                        </button>
                        <button
                            className={`tab ${activeTab === 'order' ? 'active' : ''}`}
                            onClick={() => handleFilterByType('order')}
                        >
                            Hóa đơn đơn hàng
                        </button>
                    </div>
                </div>

                {/* Danh sách hóa đơn */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h3>Đã xảy ra lỗi</h3>
                        <p>{error}</p>
                        <button className="retry-button" onClick={() => fetchPaymentHistory(user.id, user.name)}>
                            Thử lại
                        </button>
                    </div>
                ) : (
                    <div className="invoices-list">
                        {invoices.length > 0 ? invoices.map((invoice) => (
                            <div key={invoice.id} className="invoice-card">
                                <div className="invoice-header">
                                    <div className="invoice-info">
                                        {getInvoiceIcon(invoice.type)}
                                        <div className="invoice-details">
                                            <h3 className="invoice-title">
                                                {invoice.serviceName || invoice.service}
                                                <span className="invoice-type">
                                                    ({invoice.type === "service" ? "Dịch vụ" : "Đơn hàng"})
                                                </span>
                                            </h3>
                                            <div className="invoice-meta">
                                                <span className="invoice-id">Mã hóa đơn: {invoice.id}</span>
                                                <span className="invoice-date">Ngày tạo: {invoice.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="invoice-status-amount">
                                        <div className="invoice-status-row">
                                            {getStatusBadge(invoice.status)}
                                        </div>
                                        <div className="invoice-amount">{invoice.amount}</div>
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
                                    </div>
                                </div>
                                {expandedInvoices[invoice.id] && (
                                    <div className="invoice-expanded">
                                        <div className="invoice-expanded-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Loại hóa đơn:</span>
                                                <span className="detail-value">
                                                    {invoice.type === "service" ? "Dịch vụ" : "Đơn hàng"}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Phương thức thanh toán:</span>
                                                <span className="detail-value">{invoice.paymentMethod || "Không có thông tin"}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Người thanh toán:</span>
                                                <span className="detail-value">{invoice.payerName || user.name}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Thời gian thanh toán:</span>
                                                <span className="detail-value">{invoice.paidDate || "Chưa thanh toán"}</span>
                                            </div>
                                            {invoice.appointmentId && (
                                                <>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Mã cuộc hẹn:</span>
                                                        <span className="detail-value">{invoice.appointmentId}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Tiền đặt cọc:</span>
                                                        <span className="detail-value">{invoice.depositAmount}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Số tiền còn lại:</span>
                                                        <span className="detail-value">{invoice.remainingAmount}</span>
                                                    </div>
                                                    {invoice.transactionId && invoice.transactionId !== "Chưa có" && (
                                                        <div className="detail-row">
                                                            <span className="detail-label">Mã giao dịch:</span>
                                                            <span className="detail-value">{invoice.transactionId}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="invoice-actions-expanded">
                                            <button
                                                className="view-detail-button"
                                                onClick={() => viewInvoiceDetail(invoice)}
                                            >
                                                Xem chi tiết hóa đơn
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
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
    );
}