import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Truck } from 'lucide-react';
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

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                
                // Kiểm tra xem người dùng đã đăng nhập chưa
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                
                // Lấy thông tin chi tiết đơn hàng
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
    };

    // Hiển thị trạng thái đơn hàng
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
                <button className="ptod-back-button" onClick={handleBackClick}>
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
                <button className="ptod-back-button" onClick={handleBackClick}>
                    <ArrowLeft size={16} />
                    Quay lại danh sách đơn hàng
                </button>
                <h1 className="ptod-title">Chi tiết đơn hàng #{order.id}</h1>
            </div>

            {/* Trạng thái đơn hàng */}
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

            {/* Thông tin giao hàng */}
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

            {/* Thông tin thanh toán */}
            <div className="ptod-info-section">
                <h2 className="ptod-section-title">Thông tin thanh toán</h2>
                <div className="ptod-info-card">
                    <div className="ptod-info-item">
                        <CreditCard size={18} />
                        <div>
                            <h3>Phương thức thanh toán</h3>
                            <p>{order.payment ? order.payment.method : "Không có thông tin"}</p>
                        </div>
                    </div>
                    <div className="ptod-info-item">
                        <div>
                            <h3>Trạng thái thanh toán</h3>
                            <p>
                                {order.payment ? (
                                    <span className={`ptod-payment-status ${order.payment.status === 'PAID' ? 'ptod-payment-paid' : 'ptod-payment-pending'}`}>
                                        {order.payment.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                ) : "Không có thông tin"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="ptod-products-section">
                <h2 className="ptod-section-title">Sản phẩm đã đặt</h2>
                <div className="ptod-products-card">
                    {order.items && order.items.length > 0 ? (
                        <>
                            <div className="ptod-products-list">
                                {order.items.map((item, index) => (
                                    <div key={index} className="ptod-product-item">
                                        <div className="ptod-product-image">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} />
                                            ) : (
                                                <Package size={24} />
                                            )}
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
                                    <span>{orderService.formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="ptod-summary-row">
                                    <span>Phí vận chuyển:</span>
                                    <span>{orderService.formatCurrency(0)}</span>
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
        </div>
    );
}