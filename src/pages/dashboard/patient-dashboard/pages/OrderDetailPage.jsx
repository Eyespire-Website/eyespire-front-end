import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import authService from "../../../../services/authService";
import userService from "../../../../services/userService";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/orders-detail.css';
import {
    Calendar,
    Package,
    FileText,
    History,
    User,
    ArrowLeft,
    CheckCircle,
    Star,
    MapPin,
    Clock,
    Truck
} from 'lucide-react';

import PatientSidebar from '../PatientSidebar';

export default function OrderDetailPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [user, setUser] = useState({
        name: "",
        email: "",
        role: "PATIENT",
        avatar: ""
    });
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    // Sample order detail data - replace with API call
    const sampleOrderDetails = {
        "ORD001": {
            id: "ORD001",
            date: "2025-01-12",
            status: "delivered",
            total: "2,500,000 ₫",
            trackingNumber: "VN123456789",
            estimatedDelivery: "2025-01-15",
            actualDelivery: "2025-01-14",
            items: [
                {
                    id: 1,
                    name: "Kính cận Essilor",
                    description: "Tròng kính Essilor Varilux X Series",
                    quantity: 1,
                    price: "2,200,000 ₫",
                    image: "/api/placeholder/80/80",
                },
                {
                    id: 2,
                    name: "Gọng Titan",
                    description: "Gọng kính Titan cao cấp, chống gỉ",
                    quantity: 1,
                    price: "300,000 ₫",
                    image: "/api/placeholder/80/80",
                },
            ],
            shippingAddress: {
                name: "Đỗ Quang Dũng",
                phone: "+84 352 195 876",
                address: "1/DC75, 23-25, Tổ 2, Khu Phố Hòa Lân 2, Xã Xuân Lập, Huyện Lâm Bình, Tỉnh Tuyên Quang",
            },
            timeline: [
                {
                    status: "Đặt hàng thành công",
                    date: "12/01/2025 10:30",
                    completed: true,
                },
                {
                    status: "Xác nhận đơn hàng",
                    date: "12/01/2025 14:20",
                    completed: true,
                },
                {
                    status: "Đang chuẩn bị hàng",
                    date: "13/01/2025 09:15",
                    completed: true,
                },
                {
                    status: "Đang vận chuyển",
                    date: "13/01/2025 16:45",
                    completed: true,
                },
                {
                    status: "Đã giao hàng",
                    date: "14/01/2025 11:30",
                    completed: true,
                },
            ],
        },
        "ORD002": {
            id: "ORD002",
            date: "2025-01-08",
            status: "shipping",
            total: "150,000 ₫",
            trackingNumber: "VN987654321",
            estimatedDelivery: "2025-01-14",
            actualDelivery: null,
            items: [
                {
                    id: 1,
                    name: "Thuốc nhỏ mắt Refresh",
                    description: "Thuốc nhỏ mắt nhân tạo Refresh Tears",
                    quantity: 2,
                    price: "150,000 ₫",
                    image: "/api/placeholder/80/80",
                },
            ],
            shippingAddress: {
                name: "Đỗ Quang Dũng",
                phone: "+84 352 195 876",
                address: "1/DC75, 23-25, Tổ 2, Khu Phố Hòa Lân 2, Xã Xuân Lập, Huyện Lâm Bình, Tỉnh Tuyên Quang",
            },
            timeline: [
                {
                    status: "Đặt hàng thành công",
                    date: "08/01/2025 10:30",
                    completed: true,
                },
                {
                    status: "Xác nhận đơn hàng",
                    date: "08/01/2025 14:20",
                    completed: true,
                },
                {
                    status: "Đang chuẩn bị hàng",
                    date: "09/01/2025 09:15",
                    completed: true,
                },
                {
                    status: "Đang vận chuyển",
                    date: "10/01/2025 16:45",
                    completed: true,
                },
                {
                    status: "Đã giao hàng",
                    date: "Chưa giao",
                    completed: false,
                },
            ],
        },
        "ORD003": {
            id: "ORD003",
            date: "2025-01-05",
            status: "processing",
            total: "800,000 ₫",
            trackingNumber: "VN456789123",
            estimatedDelivery: "2025-01-16",
            actualDelivery: null,
            items: [
                {
                    id: 1,
                    name: "Kính râm UV Protection",
                    description: "Kính râm chống tia UV 100%",
                    quantity: 1,
                    price: "800,000 ₫",
                    image: "/api/placeholder/80/80",
                },
            ],
            shippingAddress: {
                name: "Đỗ Quang Dũng",
                phone: "+84 352 195 876",
                address: "1/DC75, 23-25, Tổ 2, Khu Phố Hòa Lân 2, Xã Xuân Lập, Huyện Lâm Bình, Tỉnh Tuyên Quang",
            },
            timeline: [
                {
                    status: "Đặt hàng thành công",
                    date: "05/01/2025 10:30",
                    completed: true,
                },
                {
                    status: "Xác nhận đơn hàng",
                    date: "05/01/2025 14:20",
                    completed: true,
                },
                {
                    status: "Đang chuẩn bị hàng",
                    date: "06/01/2025 09:15",
                    completed: true,
                },
                {
                    status: "Đang vận chuyển",
                    date: "Chưa vận chuyển",
                    completed: false,
                },
                {
                    status: "Đã giao hàng",
                    date: "Chưa giao",
                    completed: false,
                },
            ],
        },
        "ORD004": {
            id: "ORD004",
            date: "2025-01-03",
            status: "cancelled",
            total: "450,000 ₫",
            trackingNumber: null,
            estimatedDelivery: null,
            actualDelivery: null,
            items: [
                {
                    id: 1,
                    name: "Lens contact hàng tháng",
                    description: "Lens contact silicone hydrogel",
                    quantity: 1,
                    price: "450,000 ₫",
                    image: "/api/placeholder/80/80",
                },
            ],
            shippingAddress: {
                name: "Đỗ Quang Dũng",
                phone: "+84 352 195 876",
                address: "1/DC75, 23-25, Tổ 2, Khu Phố Hòa Lân 2, Xã Xuân Lập, Huyện Lâm Bình, Tỉnh Tuyên Quang",
            },
            timeline: [
                {
                    status: "Đặt hàng thành công",
                    date: "03/01/2025 10:30",
                    completed: true,
                },
                {
                    status: "Đơn hàng bị hủy",
                    date: "03/01/2025 15:20",
                    completed: true,
                },
            ],
        },
    };

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

    //function fetchOrderDetail
    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const order = sampleOrderDetails[orderId];
            if (!order) {
                toast.error("Không tìm thấy đơn hàng!");
                navigate('/patient/orders');
                return;
            }

            // QUAN TRỌNG: Thêm dòng này
            setOrderDetail(order);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            toast.error("Có lỗi xảy ra khi tải chi tiết đơn hàng!");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId]);

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

    const handleBackToOrders = () => {
        navigate('/patient/orders')
    };

    const handleStarClick = (starIndex) => {
        setRating(starIndex + 1);
    };

    const handleSubmitFeedback = () => {
        console.log("Feedback submitted:", { rating, feedback, orderId });
        // In real app, submit to API
        toast.success("Cảm ơn bạn đã đánh giá!");
        setShowFeedbackForm(false);
        setRating(0);
        setFeedback("");
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

    if (loading) {
        return (
            <div className="dashboard-container">
                <PatientSidebar activeItem="orders" />
                <div className="main-content">
                    <div className="loading-container">
                        <div className="loading-spinner">Đang tải...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!orderDetail) {
        return (
            <div className="dashboard-container">
                <PatientSidebar activeItem="orders" />
                <div className="main-content">
                    <div className="error-container">
                        <h2>Không tìm thấy đơn hàng</h2>
                        <button onClick={handleBackToOrders} className="back-btn">
                            Quay lại danh sách đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />


            {/* Main Content */}
            <div className="main-content" style={{ width: '100%', marginLeft: 0 }}>
                {/* Header */}
                <header className="content-header">
                    <div className="header-left">
                        <button onClick={handleBackToOrders} className="back-button">
                            <ArrowLeft className="back-icon" />
                            <span>Quay lại</span>
                        </button>
                        <h1>Chi tiết đơn hàng #{orderDetail.id}</h1>
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

                {/* Order Detail Content */}
                <div className="order-detail-content">
                    <div className="order-detail-main">
                        {/* Order Status Card */}
                        <div className="detail-card">
                            <div className="card-header">
                                <h2>Thông tin đơn hàng</h2>
                                <span className={`order-status ${getStatusColor(orderDetail.status)}`}>
                                    {getStatusText(orderDetail.status)}
                                </span>
                            </div>
                            <div className="card-content">
                                <div className="order-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Ngày đặt:</span>
                                        <span className="info-value">{orderDetail.date}</span>
                                    </div>
                                    {orderDetail.trackingNumber && (
                                        <div className="info-item">
                                            <span className="info-label">Mã vận đơn:</span>
                                            <span className="info-value tracking-number">{orderDetail.trackingNumber}</span>
                                        </div>
                                    )}
                                    {orderDetail.estimatedDelivery && (
                                        <div className="info-item">
                                            <span className="info-label">Dự kiến giao:</span>
                                            <span className="info-value">{orderDetail.estimatedDelivery}</span>
                                        </div>
                                    )}
                                    {orderDetail.actualDelivery && (
                                        <div className="info-item">
                                            <span className="info-label">Đã giao:</span>
                                            <span className="info-value delivered-date">{orderDetail.actualDelivery}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Card */}
                        <div className="detail-card">
                            <div className="card-header">
                                <h2>Sản phẩm đã đặt</h2>
                            </div>
                            <div className="card-content">
                                <div className="order-items-list">
                                    {orderDetail.items.map((item) => (
                                        <div key={item.id} className="order-item">
                                            <img
                                                src={item.image || "/api/placeholder/80/80"}
                                                alt={item.name}
                                                className="item-image"
                                            />
                                            <div className="item-details">
                                                <h4 className="item-name">{item.name}</h4>
                                                <p className="item-description">{item.description}</p>
                                                <p className="item-quantity">Số lượng: {item.quantity}</p>
                                            </div>
                                            <div className="item-price">
                                                <span>{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="order-total">
                                        <div className="total-row">
                                            <span className="total-label">Tổng cộng:</span>
                                            <span className="total-amount">{orderDetail.total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Form - Only show if delivered */}
                        {orderDetail.status === "delivered" && (
                            <div className="detail-card">
                                <div className="card-header">
                                    <h2>
                                        <Star className="header-icon" />
                                        Đánh giá đơn hàng
                                    </h2>
                                </div>
                                <div className="card-content">
                                    {!showFeedbackForm ? (
                                        <button
                                            onClick={() => setShowFeedbackForm(true)}
                                            className="feedback-btn"
                                        >
                                            Viết đánh giá
                                        </button>
                                    ) : (
                                        <div className="feedback-form">
                                            <div className="rating-section">
                                                <label className="form-label">Đánh giá của bạn</label>
                                                <div className="star-rating">
                                                    {[0, 1, 2, 3, 4].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => handleStarClick(star)}
                                                            className="star-button"
                                                        >
                                                            <Star
                                                                className={`star-icon ${
                                                                    star < rating ? "star-filled" : "star-empty"
                                                                }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="comment-section">
                                                <label htmlFor="feedback" className="form-label">Nhận xét</label>
                                                <textarea
                                                    id="feedback"
                                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm và dịch vụ..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    className="feedback-textarea"
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button
                                                    onClick={handleSubmitFeedback}
                                                    disabled={rating === 0}
                                                    className="submit-btn"
                                                >
                                                    Gửi đánh giá
                                                </button>
                                                <button
                                                    onClick={() => setShowFeedbackForm(false)}
                                                    className="cancel-btn"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="order-detail-sidebar">
                        {/* Shipping Address Card */}
                        <div className="detail-card">
                            <div className="card-header">
                                <h3>
                                    <MapPin className="header-icon" />
                                    Địa chỉ giao hàng
                                </h3>
                            </div>
                            <div className="card-content">
                                <div className="address-info">
                                    <p className="address-name">{orderDetail.shippingAddress.name}</p>
                                    <p className="address-phone">{orderDetail.shippingAddress.phone}</p>
                                    <p className="address-text">{orderDetail.shippingAddress.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline Card */}
                        <div className="detail-card">
                            <div className="card-header">
                                <h3>
                                    <Clock className="header-icon" />
                                    Trạng thái đơn hàng
                                </h3>
                            </div>
                            <div className="card-content">
                                <div className="timeline">
                                    {orderDetail.timeline.map((step, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className={`timeline-dot ${step.completed ? "completed" : "pending"}`} />
                                            <div className="timeline-content">
                                                <p className={`timeline-status ${step.completed ? "completed-text" : "pending-text"}`}>
                                                    {step.status}
                                                </p>
                                                <p className="timeline-date">{step.date}</p>
                                            </div>
                                            {step.completed && <CheckCircle className="timeline-check" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}