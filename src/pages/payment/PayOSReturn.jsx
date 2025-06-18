import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import paymentService from '../../services/paymentService';
import appointmentService from '../../services/appointmentService';
import './PayOSReturn.css';

const PayOSReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  // Sử dụng useRef để theo dõi xem đã xử lý thanh toán chưa
  const hasProcessedPayment = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Kiểm tra xem đã xử lý thanh toán chưa để tránh xử lý nhiều lần
      if (hasProcessedPayment.current) {
        return;
      }
      
      try {
        // Đánh dấu đã bắt đầu xử lý
        hasProcessedPayment.current = true;
        
        // Lấy tất cả các query params từ URL
        const queryParams = new URLSearchParams(location.search);
        const payosParams = {};
        
        // Chuyển đổi query params thành object
        for (const [key, value] of queryParams.entries()) {
          payosParams[key] = value;
        }
        
        console.log('Bắt đầu xác thực thanh toán với params:', payosParams);
        
        // Gọi API để xác thực kết quả thanh toán
        const result = await paymentService.verifyPayOSReturn(payosParams);
        setPaymentResult(result);
        
        // Nếu thanh toán thành công, tiến hành đặt lịch
        if (result.success && result.appointmentData) {
          try {
            // Thêm paymentId vào dữ liệu đặt lịch
            const appointmentDataWithPayment = {
              ...result.appointmentData,
              paymentId: result.paymentId
            };
            
            console.log('Dữ liệu đặt lịch với paymentId:', appointmentDataWithPayment);
            
            // Gọi API đặt lịch
            const appointmentResponse = await appointmentService.bookAppointment(appointmentDataWithPayment);
            setAppointmentData(appointmentResponse);
            
            toast.success('Đặt lịch khám thành công!');
            
            // Sau 3 giây, chuyển hướng đến trang lịch hẹn
            setTimeout(() => {
              navigate('/dashboard/patient/appointments');
            }, 3000);
          } catch (error) {
            console.error('Lỗi khi đặt lịch khám:', error);
            toast.error('Đặt lịch khám không thành công. Vui lòng liên hệ hỗ trợ.');
          }
        }
      } catch (error) {
        console.error('Lỗi khi xác thực thanh toán:', error);
        toast.error('Xác thực thanh toán thất bại. Vui lòng liên hệ hỗ trợ.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]); // Chỉ phụ thuộc vào location.search, loại bỏ navigate

  return (
    <div className="payos-return-container">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="payos-return-content">
        <div className="payos-return-header">
          <h1>Kết quả thanh toán</h1>
        </div>
        
        {loading ? (
          <div className="payos-return-loading">
            <div className="loading-spinner"></div>
            <p>Đang xử lý kết quả thanh toán...</p>
          </div>
        ) : (
          <div className="payos-return-result">
            {paymentResult?.success ? (
              <div className="payment-success">
                <div className="success-icon">✓</div>
                <h2>Thanh toán thành công!</h2>
                <div className="payment-details">
                  <p><strong>Mã giao dịch:</strong> {paymentResult.transactionNo}</p>
                  <p><strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentResult.amount)}</p>
                  <p><strong>Thời gian:</strong> {new Date(paymentResult.paymentDate).toLocaleString('vi-VN')}</p>
                </div>
                
                {appointmentData && (
                  <div className="appointment-details">
                    <h3>Thông tin lịch hẹn</h3>
                    <p><strong>Bác sĩ:</strong> BS. {appointmentData.doctorName}</p>
                    <p><strong>Dịch vụ:</strong> {appointmentData.serviceName}</p>
                    <p><strong>Ngày khám:</strong> {new Date(appointmentData.appointmentDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Giờ khám:</strong> {appointmentData.timeSlot}</p>
                  </div>
                )}
                
                <p className="redirect-message">Bạn sẽ được chuyển hướng đến trang lịch hẹn sau 3 giây...</p>
              </div>
            ) : (
              <div className="payment-failed">
                <div className="failed-icon">✗</div>
                <h2>Thanh toán không thành công!</h2>
                <p className="error-message">{paymentResult?.message || 'Đã xảy ra lỗi trong quá trình thanh toán.'}</p>
                <div className="action-buttons">
                  <button 
                    className="retry-button"
                    onClick={() => navigate('/')}
                  >
                    Quay lại trang chủ
                  </button>
                  <button 
                    className="support-button"
                    onClick={() => navigate('/contact')}
                  >
                    Liên hệ hỗ trợ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayOSReturn;
