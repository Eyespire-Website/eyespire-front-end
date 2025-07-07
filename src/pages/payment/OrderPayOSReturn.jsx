import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import orderService from '../../services/orderService';
import './PayOSReturn.css';

const OrderPayOSReturn = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xác thực thanh toán...');
  const [orderId, setOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy các tham số từ URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const orderCode = params.get('orderCode');
        
        if (!orderCode) {
          setStatus('error');
          setMessage('Không tìm thấy thông tin thanh toán');
          return;
        }

        // Gửi request xác thực thanh toán
        const verifyData = Object.fromEntries(params.entries());
        const result = await orderService.verifyPayOSPayment(verifyData);
        
        if (result.success && result.status === 'PAID') {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
          if (result.orderData && result.orderData.orderId) {
            setOrderId(result.orderData.orderId);
          }
        } else {
          setStatus('error');
          setMessage('Thanh toán thất bại hoặc đã bị hủy.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác thực thanh toán. Vui lòng liên hệ hỗ trợ.');
      }
    };

    verifyPayment();

    // Chuyển hướng sau 5 giây
    const redirectTimer = setTimeout(() => {
      if (status === 'success' && orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate('/cart');
      }
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [location.search, navigate, status, orderId]);

  return (
    <div className="payos-return-container">
      <div className="payos-return-card">
        {status === 'processing' && (
          <div className="payos-return-processing">
            <div className="loading-spinner"></div>
            <h2>Đang xử lý thanh toán</h2>
            <p>Vui lòng đợi trong giây lát...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="payos-return-success">
            <FaCheckCircle className="success-icon" />
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            <p className="redirect-message">
              Bạn sẽ được chuyển hướng đến trang chi tiết đơn hàng trong 5 giây...
            </p>
            <button 
              className="view-order-btn"
              onClick={() => navigate(`/orders/${orderId}`)}
            >
              Xem đơn hàng ngay
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="payos-return-error">
            <FaTimesCircle className="error-icon" />
            <h2>Thanh toán thất bại</h2>
            <p>{message}</p>
            <p className="redirect-message">
              Bạn sẽ được chuyển hướng đến giỏ hàng trong 5 giây...
            </p>
            <button 
              className="return-cart-btn"
              onClick={() => navigate('/cart')}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPayOSReturn;
