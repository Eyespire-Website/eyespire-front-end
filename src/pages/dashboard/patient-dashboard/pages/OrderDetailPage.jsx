import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, MapPin, CheckCircle, X, ZoomIn, ZoomOut, Star } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import authService from "../../../../services/authService";
import orderService from "../../../../services/orderService";
import '../styles/order-detail.css';

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const imageContainerRef = useRef(null);

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const fallbackImage = "https://placehold.co/60x60?text=Image";

    const getFullUrl = (url) => {
        if (!url || url.trim() === "" || url === "/placeholder.svg") {
            console.log("Image URL is invalid, using fallback:", fallbackImage);
            return fallbackImage;
        }
        return url.startsWith("http") ? url.trim() : `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
    };

    const handleImageError = (e) => {
        console.error(`Failed to load image: ${e.target.src}`);
        e.target.src = fallbackImage;
    };

    const handleImageClick = (url) => {
        setSelectedImage(url);
        setZoomLevel(1);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        setZoomLevel(1);
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.2, 5));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
    };

    const handleFeedbackClick = () => {
        navigate(`/dashboard/patient/orders/${orderId}/feedback`);
    };

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
        };

        const imageContainer = imageContainerRef.current;
        if (selectedImage && imageContainer) {
            imageContainer.addEventListener("wheel", handleWheel, { passive: false });
        }

        return () => {
            if (imageContainer) {
                imageContainer.removeEventListener("wheel", handleWheel);
            }
        };
    }, [selectedImage]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleCloseModal();
        };
        if (selectedImage) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage]);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                const orderData = await orderService.getOrderById(orderId);
                console.log("Order details:", orderData);
                setOrder(orderData);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin đơn hàng:", error);
                toast.error("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau!");
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, navigate]);

    const handleBackClick = () => {
        navigate('/dashboard/patient/orders');
        setLoading(true);
    };

    const handleReceivedClick = async () => {
        if (order.status !== 'SHIPPED') return;
        setIsUpdatingStatus(true);
        try {
            await orderService.updateOrderStatus(orderId, 'COMPLETED');
            setOrder((prev) => ({
                ...prev,
                status: 'COMPLETED',
                updatedAt: new Date().toISOString(),
            }));
            toast.success("Đơn hàng đã được cập nhật thành 'Đã hoàn thành'!");
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            toast.error("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const renderOrderStatusSteps = () => {
        const statuses = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'];
        const currentStatusIndex = statuses.indexOf(order.status);
        return (
            <div className="ptod-status-timeline">
                {statuses.map((status, index) => {
                    let statusClass = "ptod-status-step";
                    if (index < currentStatusIndex) {
                        statusClass += " ptod-status-completed";
                    } else if (index === currentStatusIndex) {
                        statusClass += " ptod-status-current";
                    }
                    return (
                        <div key={status} className={statusClass}>
                            <div className="ptod-status-indicator"></div>
                            <div className="ptod-status-label">{orderService.getStatusText(status)}</div>
                        </div>
                    );
                })}
                <div className="ptod-status-line"></div>
            </div>
        );
    };

    const calculateShippingFee = () => {
        if (!order || !order.items || order.items.length === 0) return 0;
        const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        return Number(order.totalAmount) - itemsTotal;
    };

    if (loading) {
        return (
            <div className="ptod-loading-container">
                <div className="ptod-loading-spinner">Đang tải thông tin đơn hàng...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="ptod-error-container">
                <h2>Không tìm thấy đơn hàng</h2>
                <p>Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
                <button className="ptod-back-button eop-btn eop-bg-gray-500 eop-text-white eop-hover:bg-gray-600 eop-flex eop-items-center eop-gap-2" onClick={handleBackClick}>
                    <ArrowLeft size={16} />
                    Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="ptod-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="ptod-header">
                <h1 className="ptod-title">Chi tiết đơn hàng #{order.id}</h1>
                <div className="ptod-header-actions eop-flex eop-gap-3">
                    <button className="ptod-back-button eop-btn eop-bg-gray-500 eop-text-white eop-hover:bg-gray-600 eop-flex eop-items-center eop-gap-2" onClick={handleBackClick}>
                        <ArrowLeft size={16} />
                        Quay lại danh sách đơn hàng
                    </button>
                    {order.status === 'SHIPPED' && (
                        <button
                            className="ptod-received-button eop-btn eop-bg-green-500 eop-text-white eop-hover:bg-green-600 eop-flex eop-items-center eop-gap-2"
                            onClick={handleReceivedClick}
                            disabled={isUpdatingStatus}
                        >
                            <CheckCircle size={16} />
                            {isUpdatingStatus ? "Đang cập nhật..." : "Đã nhận được hàng"}
                        </button>
                    )}
                    {order.status === 'COMPLETED' && (
                        <button
                            className="ptod-feedback-button eop-btn eop-bg-red-500 eop-text-white eop-hover:bg-red-600 eop-flex eop-items-center eop-gap-2"
                            onClick={handleFeedbackClick}
                        >
                            <Star size={16} />
                            Đánh giá sản phẩm
                        </button>
                    )}
                </div>
            </div>

            <div className="ptod-status-section">
                <h2 className="ptod-section-title">Trạng thái đơn hàng</h2>
                <div className="ptod-status-card">
                    <div className="ptod-status-header">
                        <span className={`ptod-status-badge ${orderService.getStatusClass(order.status)}`}>
                            {orderService.getStatusText(order.status)}
                        </span>
                        <span className="ptod-order-date">
                            <Calendar size={16} />
                            Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    {order.status !== 'CANCELED' && renderOrderStatusSteps()}
                </div>
            </div>

            <div className="ptod-info-section">
                <h2 className="ptod-section-title">Thông tin giao hàng</h2>
                <div className="ptod-info-card">
                    <div className="ptod-info-item">
                        <MapPin size={18} />
                        <div>
                            <h3>Địa chỉ giao hàng</h3>
                            <p>{order.shippingAddress || "Không có thông tin"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ptod-products-section">
                <h2 className="ptod-section-title">Sản phẩm đã đặt</h2>
                <div className="ptod-products-card">
                    {order.items && order.items.length > 0 ? (
                        <>
                            <div className="ptod-products-list">
                                {order.items.map((item, index) => (
                                    <div key={index} className="ptod-product-item">
                                        <div className="ptod-product-image">
                                            <img
                                                src={getFullUrl(item.image)}
                                                alt={item.productName || "Product image"}
                                                className="eop-w-12 eop-h-12 eop-object-cover eop-rounded"
                                                onError={handleImageError}
                                                onClick={() => handleImageClick(getFullUrl(item.image))}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </div>
                                        <div className="ptod-product-details">
                                            <h3 className="ptod-product-name">{item.productName}</h3>
                                            <p className="ptod-product-price">
                                                {orderService.formatCurrency(item.price)} x {item.quantity}
                                            </p>
                                        </div>
                                        <div className="ptod-product-subtotal">
                                            {orderService.formatCurrency(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="ptod-order-summary">
                                <div className="ptod-summary-row">
                                    <span>Tổng tiền sản phẩm:</span>
                                    <span>
                                        {orderService.formatCurrency(
                                            order.items.reduce((sum, item) => sum + Number(item.subtotal), 0)
                                        )}
                                    </span>
                                </div>
                                <div className="ptod-summary-row">
                                    <span>Phí vận chuyển:</span>
                                    <span>{orderService.formatCurrency(calculateShippingFee())}</span>
                                </div>
                                <div className="ptod-summary-row ptod-summary-total">
                                    <span>Tổng thanh toán:</span>
                                    <span>{orderService.formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="ptod-no-products">
                            <Package size={32} />
                            <p>Không có thông tin sản phẩm</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedImage && (
                <div className="image-modal-overlay" onClick={handleCloseModal}>
                    <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="image-modal-close" onClick={handleCloseModal}>
                            <X size={24} />
                        </button>
                        <div className="image-modal-content" ref={imageContainerRef}>
                            <img
                                src={selectedImage}
                                alt="Zoomed product image"
                                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s" }}
                                onError={handleImageError}
                            />
                        </div>
                        <div className="image-modal-controls">
                            <button onClick={handleZoomIn} disabled={zoomLevel >= 5}>
                                <ZoomIn size={20} />
                            </button>
                            <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                                <ZoomOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}