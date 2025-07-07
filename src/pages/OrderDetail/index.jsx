import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaBox, FaShippingFast, FaRegClock } from "react-icons/fa";
import orderService from "../../services/orderService";
import authService from "../../services/authService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./index.css";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!authService.isLoggedIn()) {
        setError("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", err);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <FaRegClock className="status-icon pending" />;
      case "PROCESSING":
        return <FaBox className="status-icon processing" />;
      case "PAID":
        return <FaCheckCircle className="status-icon paid" />;
      case "SHIPPING":
        return <FaShippingFast className="status-icon shipping" />;
      case "COMPLETED":
        return <FaCheckCircle className="status-icon completed" />;
      default:
        return <FaRegClock className="status-icon" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PROCESSING":
        return "Đang xử lý";
      case "PAID":
        return "Đã thanh toán";
      case "SHIPPING":
        return "Đang giao hàng";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "COMPLETED":
        return "Đã thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  if (isLoading) {
    return (
      <div className="order-detail-container">
        <Header />
        <div className="order-detail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <Header />
        <div className="order-detail-error">
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <Link to="/cart" className="back-to-cart-btn">
            Quay lại giỏ hàng
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <Header />
        <div className="order-detail-error">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Link to="/cart" className="back-to-cart-btn">
            Quay lại giỏ hàng
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <Header />
      
      <div className="order-detail-content">
        <div className="order-detail-header">
          <h1>Chi tiết đơn hàng #{order.orderCode}</h1>
          <div className="order-status">
            {getStatusIcon(order.status)}
            <span>{getStatusText(order.status)}</span>
          </div>
        </div>

        <div className="order-detail-sections">
          <div className="order-info-section">
            <h2>Thông tin đơn hàng</h2>
            <div className="order-info-content">
              <div className="info-row">
                <span className="info-label">Mã đơn hàng:</span>
                <span className="info-value">{order.orderCode}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ngày đặt hàng:</span>
                <span className="info-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Trạng thái:</span>
                <span className="info-value status-value">
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa chỉ giao hàng:</span>
                <span className="info-value">{order.shippingAddress}</span>
              </div>
            </div>
          </div>

          <div className="payment-info-section">
            <h2>Thông tin thanh toán</h2>
            <div className="payment-info-content">
              <div className="info-row">
                <span className="info-label">Phương thức:</span>
                <span className="info-value">PayOS</span>
              </div>
              <div className="info-row">
                <span className="info-label">Trạng thái:</span>
                <span className={`info-value payment-status ${order.payment?.status?.toLowerCase()}`}>
                  {order.payment ? getPaymentStatusText(order.payment.status) : "Chưa thanh toán"}
                </span>
              </div>
              {order.payment && order.payment.paidAt && (
                <div className="info-row">
                  <span className="info-label">Ngày thanh toán:</span>
                  <span className="info-value">{formatDate(order.payment.paidAt)}</span>
                </div>
              )}
              {order.payment && order.payment.transactionCode && (
                <div className="info-row">
                  <span className="info-label">Mã giao dịch:</span>
                  <span className="info-value">{order.payment.transactionCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-items-section">
          <h2>Sản phẩm đã đặt</h2>
          <div className="order-items-list">
            <div className="order-item-header">
              <div className="item-product">Sản phẩm</div>
              <div className="item-price">Đơn giá</div>
              <div className="item-quantity">Số lượng</div>
              <div className="item-total">Thành tiền</div>
            </div>
            
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-product">
                  <img 
                    src={item.productImage || "https://via.placeholder.com/50"} 
                    alt={item.productName} 
                    className="item-image" 
                  />
                  <div className="item-details">
                    <Link to={`/product/${item.productId}`} className="item-name">
                      {item.productName}
                    </Link>
                    {item.color && (
                      <div className="item-color">
                        <span>Màu: </span>
                        <span 
                          className="color-dot" 
                          style={{ backgroundColor: item.color.color }}
                          title={item.color.name}
                        ></span>
                        <span>{item.color.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="item-price">${item.price}</div>
                <div className="item-quantity">{item.quantity}</div>
                <div className="item-total">${item.subtotal}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <h2>Tổng cộng</h2>
          <div className="order-summary-content">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>${order.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{order.shippingFee > 0 ? `$${order.shippingFee}` : "Miễn phí"}</span>
            </div>
            <div className="summary-row total-row">
              <span>Tổng cộng:</span>
              <span>${order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="order-actions">
          <Link to="/shop" className="continue-shopping-btn">
            Tiếp tục mua sắm
          </Link>
          <Link to="/dashboard/patient/orders" className="view-all-orders-btn">
            Xem tất cả đơn hàng
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
