import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import userService from "../../../../services/userService";
import orderService from "../../../../services/orderService";
import feedbackService from "../../../../services/feedbackService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/orders-patient.css';
import { Search, Package, Calendar, MapPin, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [filterCounts, setFilterCounts] = useState({
        ALL: 0,
        PENDING: 0,
        PAID: 0,
        SHIPPED: 0,
        NEED_REVIEW: 0,
        RETURN: 0
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

    // Fetch orders and feedback data
    const fetchOrdersData = async () => {
        try {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            const ordersData = await orderService.getUserOrders(currentUser.id);
            const enrichedOrders = await Promise.all(
                ordersData.map(async (order) => {
                    if (order.status === 'COMPLETED' && order.items) {
                        const feedbackPromises = order.items.map(item =>
                            feedbackService.getFeedbackByProductId(item.productId)
                        );
                        const feedbackResults = await Promise.all(feedbackPromises);
                        const unreviewedProducts = order.items
                            .map((item, index) => {
                                const feedbacks = feedbackResults[index] || [];
                                return !feedbacks.some(fb => fb.patientId === currentUser.id)
                                    ? item.productName
                                    : null;
                            })
                            .filter(name => name);
                        return {
                            ...order,
                            needsReview: unreviewedProducts.length > 0,
                            unreviewedProducts
                        };
                    }
                    return { ...order, needsReview: false, unreviewedProducts: [] };
                })
            );
            setOrders(enrichedOrders);
            setFilteredOrders(enrichedOrders);

            // Calculate filter counts
            const counts = {
                ALL: enrichedOrders.length,
                PENDING: enrichedOrders.filter(order => order.status === 'PENDING').length,
                PAID: enrichedOrders.filter(order => order.status === 'PAID').length,
                SHIPPED: enrichedOrders.filter(order => order.status === 'SHIPPED').length,
                NEED_REVIEW: enrichedOrders.filter(order => order.needsReview).length,
                RETURN: enrichedOrders.filter(order => order.status === 'RETURN_REQUESTED').length
            };
            setFilterCounts(counts);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            toast.error("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
            setLoading(false);
            setOrders([]);
            setFilteredOrders([]);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchOrdersData();
    }, []);

    // Filter orders based on search term and active filter
    useEffect(() => {
        let filtered = orders;
        if (activeFilter !== "ALL") {
            if (activeFilter === "NEED_REVIEW") {
                filtered = orders.filter(order => order.needsReview);
            } else if (activeFilter === "RETURN") {
                filtered = orders.filter(order => order.status === "RETURN_REQUESTED");
            } else {
                filtered = orders.filter(order => order.status === activeFilter);
            }
        }
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(order => {
                const idMatch = order.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
                const itemsMatch = order.items && order.items.some(item =>
                    item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                );
                const trackingMatch = order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
                return idMatch || itemsMatch || trackingMatch;
            });
        }
        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [searchTerm, orders, activeFilter]);

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOrderClick = (orderId) => {
        if (activeFilter === "NEED_REVIEW") {
            navigate(`/dashboard/patient/orders/${orderId}`);
        } else {
            navigate(`/dashboard/patient/orders/${orderId}`);
        }
    };

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    // Get avatars
    const getAvatarUrl = (url) => {
        if (!url) {
            return '';
        }
        if (url.startsWith('http')) {
            return url;
        }
        if (url.startsWith('/')) {
            return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
        }
        return url;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Get product names from order items
    const getProductNames = (order) => {
        const items = order.items || [];
        if (items.length > 0) {
            const validItems = items.filter(item => item.productName);
            if (validItems.length === 0) return 'Chưa có thông tin sản phẩm';
            if (validItems.length <= 2) {
                return validItems
                    .map(item => `${item.productName} (x${item.quantity || 1})`)
                    .join(', ');
            } else {
                const firstTwo = validItems
                    .slice(0, 2)
                    .map(item => `${item.productName} (x${item.quantity || 1})`)
                    .join(', ');
                return `${firstTwo} và ${validItems.length - 2} sản phẩm khác`;
            }
        }
        return 'Chưa có thông tin sản phẩm';
    };

    // Get unreviewed product names for display
    const getUnreviewedProductNames = (order) => {
        if (order.unreviewedProducts && order.unreviewedProducts.length > 0) {
            if (order.unreviewedProducts.length <= 2) {
                return order.unreviewedProducts.join(', ');
            } else {
                return `${order.unreviewedProducts.slice(0, 2).join(', ')} và ${order.unreviewedProducts.length - 2} sản phẩm khác`;
            }
        }
        return '';
    };

    return (
        <div className="ptod-container">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Header */}
            <header className="ptod-header">
                <div className="ptod-header-left">
                    <h1 className="ptod-title">Theo dõi đơn hàng</h1>
                    <div className="ptod-search-container">
                        <Search className="ptod-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn hàng, sản phẩm..."
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
                        { key: "ALL", label: "Tất cả" },
                        { key: "PENDING", label: "Đang xử lý" },
                        { key: "PAID", label: "Đã thanh toán" },
                        { key: "SHIPPED", label: "Đang giao hàng" },
                        { key: "NEED_REVIEW", label: "Cần đánh giá" },
                        { key: "RETURN", label: "Trả hàng" }
                    ].map(filter => (
                        <button
                            key={filter.key}
                            className={`ptod-filter-tab ${activeFilter === filter.key ? 'ptod-filter-active' : ''}`}
                            onClick={() => handleFilterClick(filter.key)}
                        >
                            {filter.label}
                            {filterCounts[filter.key] > 0 && (
                                <span className="ptod-filter-count">{filterCounts[filter.key]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Content */}
            <div className="ptod-orders-content">
                {loading ? (
                    <div className="ptod-loading-container">
                        <div className="ptod-loading-spinner">Đang tải...</div>
                    </div>
                ) : (
                    <>
                        <div className="ptod-orders-list">
                            {filteredOrders.length === 0 ? (
                                <div className="ptod-no-orders">
                                    <Package className="ptod-no-orders-icon" />
                                    <h3>Không có đơn hàng nào</h3>
                                    <p>Không có đơn hàng phù hợp với bộ lọc hiện tại.</p>
                                </div>
                            ) : (
                                currentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="ptod-order-card"
                                        onClick={() => handleOrderClick(order.id)}
                                    >
                                        <div className="ptod-order-content">
                                            <div className="ptod-order-main-info">
                                                <h3 className="ptod-order-id">
                                                    <ShoppingBag size={16} className="ptod-order-icon" />
                                                    Đơn hàng #{order.id}
                                                </h3>
                                                <p className="ptod-order-items">{getProductNames(order)}</p>
                                                {order.needsReview && activeFilter === "NEED_REVIEW" && (
                                                    <p className="ptod-order-unreviewed">
                                                        Cần đánh giá: {getUnreviewedProductNames(order)}
                                                    </p>
                                                )}
                                                <div className="ptod-order-meta">
                                                    <div className="ptod-order-date">
                                                        <Calendar size={14} />
                                                        <span>Ngày đặt: {formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <p className="ptod-order-total">{orderService.formatCurrency(order.totalAmount)}</p>
                                                </div>
                                                {order.shippingAddress && (
                                                    <p className="ptod-order-address">
                                                        <MapPin size={14} className="ptod-address-icon" />
                                                        <span>Địa chỉ:</span> {order.shippingAddress}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ptod-order-actions">
                                                <span className={`ptod-order-status ${orderService.getStatusClass(order.status)}`}>
                                                    {orderService.getStatusText(order.status)}
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
                        {filteredOrders.length > 0 && (
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