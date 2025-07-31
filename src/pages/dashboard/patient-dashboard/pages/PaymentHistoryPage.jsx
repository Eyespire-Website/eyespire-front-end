import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import userService from "../../../../services/userService";
import paymentHistoryService from "../../../../services/paymentHistoryService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/payment-history.css';
import { Calendar, Package, FileText, History, User, Search, Filter, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';

export default function PaymentHistoryPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedInvoices, setExpandedInvoices] = useState({});
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [invoicesPerPage] = useState(5);
    const [filterCounts, setFilterCounts] = useState({
        all: 0,
        service: 0,
        order: 0
    });

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const currentUserFromStorage = authService.getCurrentUser();
            if (!currentUserFromStorage) {
                navigate('/login');
                return;
            }
            const userData = await userService.getCurrentUserInfo();
            setUser(userData);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate('/login');
            }
        }
    };

    // Lấy thông tin người dùng và lịch sử thanh toán khi component mount
    useEffect(() => {
        const initializeData = async () => {
            await fetchUserData();
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                await fetchPaymentHistory(currentUser.id, currentUser.name);
            }
        };
        initializeData();
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
                    // CHỈ HIỂN THỊ: appointment_status = COMPLETED VÀ is_fully_paid = true
                    if (invoice.appointment_status === 'COMPLETED' && invoice.is_fully_paid === true) {
                        const cleanId = invoice.id.toString().replace(/^(INV|ORD)/, '');
                        return {
                            id: cleanId,
                            date: formatDate(invoice.created_at),
                            paidDate: invoice.paid_at ? formatDate(invoice.paid_at) : null,
                            service: `Cuộc hẹn #${invoice.appointment_id}`,
                            serviceName: `Cuộc hẹn #${invoice.appointment_id}`,
                            amount: formatCurrency(invoice.total_amount),
                            rawAmount: invoice.total_amount,
                            status: "paid", // Luôn là paid vì đã filter is_fully_paid = true
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
                        // Bỏ qua các hóa đơn cuộc hẹn chưa hoàn thành hoặc chưa thanh toán đủ
                        return null;
                    }
                } else {
                    // Xử lý các hóa đơn khác (service và order)
                    const cleanId = invoice.id.toString().replace(/^(INV|ORD)/, '');

                    // Nếu là order (có ORD hoặc type = 'order')
                    if (invoice.type === 'order' || invoice.id.toString().startsWith('ORD')) {
                        // CHỈ HIỂN THỊ: order có status = COMPLETED
                        if (invoice.status && invoice.status.toUpperCase() === 'COMPLETED') {
                            return {
                                id: cleanId,
                                date: invoice.date || formatDate(invoice.created_at),
                                paidDate: invoice.paid_at ? formatDate(invoice.paid_at) : null,
                                service: `Đơn hàng ${cleanId}`,
                                serviceName: `Đơn hàng ${cleanId}`,
                                amount: invoice.amount || formatCurrency(invoice.total_amount),
                                rawAmount: invoice.total_amount || 0,
                                status: "paid",
                                type: "order",
                                paymentMethod: invoice.payment_method || "Chưa xác định",
                                payerName: userName,
                                transactionId: invoice.transaction_id || "Chưa có",
                                orderId: invoice.id
                            };
                        } else {
                            return null;
                        }
                    } else {
                        // Xử lý service invoice (có INV hoặc type = 'service')
                        return {
                            id: cleanId,
                            date: invoice.date || formatDate(invoice.created_at),
                            paidDate: invoice.paid_at ? formatDate(invoice.paid_at) : null,
                            service: invoice.service || invoice.serviceName || `Dịch vụ ${cleanId}`,
                            serviceName: invoice.service || invoice.serviceName || `Dịch vụ ${cleanId}`,
                            amount: invoice.amount || formatCurrency(invoice.total_amount || 0),
                            rawAmount: invoice.total_amount || 0,
                            status: invoice.status || "paid",
                            type: "service",
                            paymentMethod: invoice.payment_method || "Chưa xác định",
                            payerName: userName,
                            transactionId: invoice.transaction_id || "Chưa có"
                        };
                    }
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

    // Hàm xử lý trạng thái thanh toán từ orderPayment.status
    const getOrderPaymentStatus = (paymentStatus) => {
        if (!paymentStatus) return "pending";

        // Chuyển đổi PaymentStatus enum từ backend sang frontend status
        switch (paymentStatus.toUpperCase()) {
            case 'COMPLETED':
            case 'PAID':
            case 'SUCCESS':
                return "paid";
            case 'PENDING':
            case 'PROCESSING':
                return "pending";
            case 'FAILED':
            case 'CANCELLED':
            case 'REFUNDED':
                return "failed";
            default:
                return "pending";
        }
    };

    // Update filter counts
    const updateFilterCounts = (invoiceList) => {
        const counts = {
            all: invoiceList.length,
            service: invoiceList.filter(invoice => invoice.type === 'service').length,
            order: invoiceList.filter(invoice => invoice.type === 'order').length
        };
        setFilterCounts(counts);
    };

    // Filter invoices based on search term and active tab
    useEffect(() => {
        let filtered = invoices;

        // Filter by type
        if (activeTab !== 'all') {
            filtered = filtered.filter(invoice => invoice.type === activeTab);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(invoice =>
                (invoice.serviceName && invoice.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (invoice.service && invoice.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
                invoice.id.toString().includes(searchTerm) ||
                (invoice.payerName && invoice.payerName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredInvoices(filtered);
        setCurrentPage(1);
    }, [searchTerm, invoices, activeTab]);

    // Pagination
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Hàm lọc theo loại thanh toán
    const handleFilterByType = (type) => {
        setActiveTab(type);
    };

    // Hàm tìm kiếm
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            await fetchPaymentHistory(user.id, user.name);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const searchResults = await paymentHistoryService.searchPaymentHistory(user.id, searchTerm);
            setInvoices(searchResults);
            setFilteredInvoices(searchResults);
            updateFilterCounts(searchResults);
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
        // Use the original ID with prefix for navigation, but display clean ID
        const originalId = invoices.find(inv => inv.id.toString().replace(/^(INV|ORD)/, '') === invoice.id)?.id || invoice.id;
        navigate(`/dashboard/patient/payment-history/${originalId}/${invoice.type}`);
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

    const getAvatarUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
    };

    return (
        <div className="ptod-container">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Header */}
            <header className="ptod-header">
                <div className="ptod-header-left">
                    <h1 className="ptod-title">Lịch sử thanh toán</h1>
                    <div className="ptod-search-container">
                        <Search className="ptod-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo hóa đơn, dịch vụ..."
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

            {/* Filter Tabs */}
            <div className="ptod-filter-tabs-container">
                <div className="ptod-filter-tabs">
                    {[
                        { key: "all", label: "Tất cả" },
                        { key: "service", label: "Dịch vụ" },
                        { key: "order", label: "Đơn hàng" }
                    ].map(filter => (
                        <button
                            key={filter.key}
                            className={`ptod-filter-tab ${activeTab === filter.key ? 'ptod-filter-active' : ''}`}
                            onClick={() => handleFilterByType(filter.key)}
                        >
                            {filter.label}
                            {filterCounts[filter.key] > 0 && (
                                <span className="ptod-filter-count">{filterCounts[filter.key]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment History Content */}
            <div className="ptod-orders-content">
                {loading ? (
                    <div className="ptod-loading-container">
                        <div className="ptod-loading-spinner">Đang tải...</div>
                    </div>
                ) : (
                    <>
                        <div className="ptod-orders-list">
                            {filteredInvoices.length === 0 ? (
                                <div className="ptod-no-orders">
                                    <CreditCard className="ptod-no-orders-icon" />
                                    <h3>Không có hóa đơn nào</h3>
                                    <p>Không có hóa đơn phù hợp với bộ lọc hiện tại.</p>
                                </div>
                            ) : (
                                currentInvoices.map((invoice) => (
                                    <div key={invoice.id} className="ptod-order-card" onClick={() => viewInvoiceDetail(invoice)}>
                                        <div className="ptod-order-content">
                                            <div className="ptod-order-main-info">
                                                <h3 className="ptod-order-id">
                                                    <CreditCard size={16} className="ptod-order-icon" />
                                                    Hóa đơn #{invoice.id}
                                                </h3>
                                                <p className="ptod-order-items">
                                                    {invoice.serviceName || invoice.service}
                                                    <span className="ptod-invoice-type">
                                                        ({invoice.type === "service" ? "Dịch vụ" : "Đơn hàng"})
                                                    </span>
                                                </p>
                                                <div className="ptod-order-meta">
                                                    <div className="ptod-order-date">
                                                        <Calendar size={14} />
                                                        <span>Ngày tạo: {invoice.date}</span>
                                                    </div>
                                                    <p className="ptod-order-total">{invoice.amount}</p>
                                                </div>
                                                {invoice.payerName && (
                                                    <p className="ptod-order-address">
                                                        <User size={14} className="ptod-address-icon" />
                                                        <span>Người thanh toán:</span> {invoice.payerName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ptod-order-actions">
                                                <span className={`ptod-order-status ${invoice.status === 'paid' ? 'ptod-status-paid' : invoice.status === 'pending' ? 'ptod-status-pending' : 'ptod-status-cancelled'}`}>
                                                    {invoice.status === 'paid' ? 'Đã thanh toán' : invoice.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                                                </span>
                                                <button className="ptod-order-detail-btn">
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Pagination */}
                        {filteredInvoices.length > 0 && (
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
        </div>
    );
}