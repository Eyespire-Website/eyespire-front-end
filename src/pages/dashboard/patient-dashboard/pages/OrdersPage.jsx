import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import userService from "../../../../services/userService";
import orderService from "../../../../services/orderService";

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

    // Fetch orders data
    const fetchOrdersData = async () => {
        try {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }

            const ordersData = await orderService.getUserOrders(currentUser.id);
            setOrders(ordersData);
            setFilteredOrders(ordersData);
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

    // Filter orders based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => {
                // Tìm theo ID đơn hàng
                const idMatch = order.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
                
                // Tìm theo sản phẩm trong đơn hàng
                const itemsMatch = order.orderItems && order.orderItems.some(item => 
                    item.product && item.product.name && 
                    item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                // Tìm theo mã vận đơn
                const trackingMatch = order.trackingNumber && 
                    order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
                
                return idMatch || itemsMatch || trackingMatch;
            });
            setFilteredOrders(filtered);
        }
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    }, [searchTerm, orders]);

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOrderClick = (orderId) => {
        navigate(`/dashboard/patient/orders/${orderId}`);
    };

    // Get avatar URL helper
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
        // Kiểm tra cả orderItems và items
        const orderItems = order.orderItems || [];
        const items = order.items || [];
        
        // Nếu có items (cấu trúc từ OrderDetailPage), ưu tiên sử dụng
        if (items.length > 0) {
            // Lọc các item có productName
            const validItems = items.filter(item => item.productName);
            
            if (validItems.length === 0) return 'Chưa có thông tin sản phẩm';
            
            // Chỉ hiển thị tối đa 2 sản phẩm
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
        
        // Nếu có orderItems (cấu trúc từ OrdersPage), sử dụng cấu trúc này
        if (orderItems.length > 0) {
            // Lọc ra các sản phẩm có tên và thông tin đầy đủ
            const validItems = orderItems.filter(item => item.product && item.product.name);
            
            if (validItems.length === 0) return 'Chưa có thông tin sản phẩm';
            
            // Chỉ hiển thị tối đa 2 sản phẩm
            if (validItems.length <= 2) {
                return validItems
                    .map(item => `${item.product.name} (x${item.quantity || 1})`)
                    .join(', ');
            } else {
                const firstTwo = validItems
                    .slice(0, 2)
                    .map(item => `${item.product.name} (x${item.quantity || 1})`)
                    .join(', ');
                return `${firstTwo} và ${validItems.length - 2} sản phẩm khác`;
            }
        }
        
        return 'Chưa có thông tin sản phẩm';
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
                                    <p>Bạn chưa có đơn hàng nào hoặc đơn hàng đang được tải.</p>
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
                                    &laquo;
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
                                    &raquo;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}