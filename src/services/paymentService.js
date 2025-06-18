import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user) {
      // Thêm userId vào header để backend có thể xác thực
      config.headers['User-Id'] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const paymentService = {
  // Tạo thanh toán đặt cọc cho lịch hẹn qua PayOS
  createPayOSDeposit: async (appointmentData) => {
    try {
      // Ánh xạ dữ liệu từ formData sang AppointmentDTO
      const mappedData = {
        doctorId: appointmentData.doctorId,
        serviceId: appointmentData.serviceId,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: appointmentData.hourSlot,
        patientName: appointmentData.fullName,
        patientEmail: appointmentData.email,
        patientPhone: appointmentData.phone,
        notes: appointmentData.notes,
        userId: appointmentData.userId || null
      };

      const response = await axiosInstance.post('/appointments/payment/payos', {
        amount: 10000, // Số tiền đặt cọc 10.000 VND
        appointmentData: mappedData,
        returnUrl: window.location.origin + '/payment/payos-return'
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thanh toán PayOS:', error);
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán PayOS
  checkPayOSStatus: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/appointments/payment/payos/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán PayOS:', error);
      throw error;
    }
  },
  
  // Xác nhận thanh toán PayOS từ callback
  verifyPayOSReturn: async (payosParams) => {
    try {
      const response = await axiosInstance.post('/appointments/payment/payos/verify', payosParams);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác thực kết quả thanh toán PayOS:', error);
      throw error;
    }
  }
};

export default paymentService;
