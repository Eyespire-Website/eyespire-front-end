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

const appointmentService = {
  // Lấy danh sách bác sĩ
  getDoctors: async () => {
    try {
      const response = await axiosInstance.get('/doctors');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bác sĩ:', error);
      throw error;
    }
  },

  // Lấy danh sách dịch vụ y tế
  getMedicalServices: async () => {
    try {
      const response = await axiosInstance.get('/medical-services');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ y tế:', error);
      throw error;
    }
  },

  // Lấy khung giờ trống của bác sĩ theo ngày
  getAvailableTimeSlots: async (doctorId, date) => {
    try {
      const response = await axiosInstance.get(`/doctors/${doctorId}/available-slots`, {
        params: {
          date: date
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy khung giờ trống:', error);
      throw error;
    }
  },

  // Đặt lịch khám
  bookAppointment: async (appointmentData) => {
    try {
      const response = await axiosInstance.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đặt lịch khám:', error);
      throw error;
    }
  },

  // Lấy danh sách lịch hẹn của bệnh nhân
  getPatientAppointments: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axiosInstance.get(`/appointments/patient/${currentUser.id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lịch hẹn:', error);
      throw error;
    }
  },

  // Hủy lịch hẹn
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi hủy lịch hẹn:', error);
      throw error;
    }
  }
};

export default appointmentService;
