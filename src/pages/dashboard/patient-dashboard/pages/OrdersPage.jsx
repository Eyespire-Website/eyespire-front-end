import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import userService from "../../../../services/userService";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/orders-patient.css'; // You'll need to create this CSS file
import { Calendar, Package, FileText, History, User, Search } from 'lucide-react';

import PatientSidebar from '../PatientSidebar';

export default function OrdersPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        role: "PATIENT",
        avatar: ""
    });
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Sample orders data - replace with API call
    const sampleOrders = [
        {
            id: "ORD001",
            date: "2025-01-12",
            items: "Kính cận Essilor, Gọng Titan",
            total: "2,500,000 ₫",
            status: "delivered",
            estimatedDelivery: "2025-01-15",
            trackingNumber: "VN123456789",
        },
        {
            id: "ORD002",
            date: "2025-01-08",
            items: "Thuốc nhỏ mắt Refresh",
            total: "150,000 ₫",
            status: "shipping",
            estimatedDelivery: "2025-01-14",
            trackingNumber: "VN987654321",
        },
        {
            id: "ORD003",
            date: "2025-01-05",
            items: "Kính râm UV Protection",
            total: "800,000 ₫",
            status: "processing",
            estimatedDelivery: "2025-01-16",
            trackingNumber: "VN456789123",
        },
        {
            id: "ORD004",
            date: "2025-01-03",
            items: "Lens contact hàng tháng",
            total: "450,000 ₫",
            status: "cancelled",
            estimatedDelivery: null,
            trackingNumber: null,
        },
    ];

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const currentUserFromStorage = authService.getCurrentUser();
            if (!currentUserFromStorage) {
                navigate('/login');
                return;
            }

            setLoading(true);
            const userData = await userService.getCurrentUserInfo();

            setUser({
                name: userData.name || "",
                email: userData.email || "",
                role: userData.role || "PATIENT",
                avatar: userData.avatarUrl || ""
            });

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);

            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser({
                    name: currentUser.name || "",
                    email: currentUser.email || "",
                    role: currentUser.role || "PATIENT",
                    avatar: currentUser.avatarUrl || ""
                });
            } else {
                navigate('/login');
            }

            setLoading(false);
        }
    };

    // Fetch orders data
    const fetchOrdersData = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            // const ordersData = await orderService.getUserOrders();
            // setOrders(ordersData);

            // Using sample data for now
            setOrders(sampleOrders);
            setFilteredOrders(sampleOrders);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            toast.error("Có lỗi xảy ra khi tải danh sách đơn hàng!");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchOrdersData();
    }, []);

    // Handle search
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOrders(filtered);
        }
    }, [searchTerm, orders]);

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
                return "status-delivered";
            case "shipping":
                return "status-shipping";
            case "processing":
                return "status-processing";
            case "cancelled":
                return "status-cancelled";
            default:
                return "status-default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "delivered":
                return "Đã giao";
            case "shipping":
                return "Đang giao";
            case "processing":
                return "Đang xử lý";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const handleOrderClick = (orderId) => {
        console.log("Navigating to:", `/patient/orders/${orderId}`);
        navigate(`/patient/orders/${orderId}`);
    };

    const handleMenuClick = (route) => {
        navigate(route);
    };

    // Get avatar URL helper
    const getAvatarUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        if (url.startsWith('/')) {
            return `http://localhost:8080${url}`;
        }

        return url;
    };

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />

            <PatientSidebar activeItem="orders" />

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="content-header">
                    <div className="header-left">
                        <h1>Theo dõi đơn hàng</h1>
                        <div className="search-container">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm đơn hàng..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="user-avatar">
                            {user.avatar ? (
                                <img src={getAvatarUrl(user.avatar)} alt={user.name} className="avatar-image" />
                            ) : (
                                user.name?.charAt(0) || "U"
                            )}
                        </div>
                    </div>
                </header>

                {/* Orders Content */}
                <div className="orders-content">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner">Đang tải...</div>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {filteredOrders.length === 0 ? (
                                <div className="no-orders">
                                    <Package className="no-orders-icon" />
                                    <h3>Không có đơn hàng nào</h3>
                                    <p>Bạn chưa có đơn hàng nào được tạo.</p>
                                </div>
                            ) : (
                                filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="order-card"
                                        onClick={() => handleOrderClick(order.id)}
                                    >
                                        <div className="order-content">
                                            <div className="order-main-info">
                                                <h3 className="order-id">Đơn hàng #{order.id}</h3>
                                                <p className="order-items">{order.items}</p>
                                                <p className="order-date">Ngày đặt: {order.date}</p>
                                                <p className="order-total">{order.total}</p>
                                                {order.trackingNumber && (
                                                    <p className="order-tracking">Mã vận đơn: {order.trackingNumber}</p>
                                                )}
                                                {order.estimatedDelivery && (
                                                    <p className="order-delivery">Dự kiến giao: {order.estimatedDelivery}</p>
                                                )}
                                            </div>
                                            <div className="order-actions">
                                                <span className={`order-status ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                                <button className="order-detail-btn">
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}