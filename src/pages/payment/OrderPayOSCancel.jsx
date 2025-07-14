import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaShoppingCart } from 'react-icons/fa';
import './PayOSReturn.css';

const OrderPayOSCancel = () => {
  const [countdown, setCountdown] = useState(5);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin từ URL params nếu có
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode');
    
    console.log('Payment cancelled for order:', orderCode);

    // Đếm ngược và chuyển hướng
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/cart');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.search, navigate]);

  const handleReturnToCart = () => {
    navigate('/cart');
  };

  const handleReturnToHome = () => {
    navigate('/');
  };

  return (
    <div className="payos-return-container">
      <div className="payos-return-card">
        <div className="payos-return-error">
          <FaTimesCircle className="error-icon" />
          <h2>Thanh toán đã bị hủy</h2>
          <p>Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn chưa được xác nhận.</p>
          
          <div className="cancel-actions">
            <p className="redirect-message">
              Bạn sẽ được chuyển hướng đến giỏ hàng trong {countdown} giây...
            </p>
            
            <div className="action-buttons">
              <button 
                className="return-cart-btn primary"
                onClick={handleReturnToCart}
              >
                <FaShoppingCart className="btn-icon" />
                Quay lại giỏ hàng
              </button>
              
              <button 
                className="return-home-btn secondary"
                onClick={handleReturnToHome}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPayOSCancel;
