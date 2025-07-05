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
      console.error('Lỗi khi lấy khung giờ trống của bác sĩ:', error);
      throw error;
    }
  },
  // Lấy tất cả khung giờ trống theo ngày (không cần lọc theo bác sĩ)
  getAvailableTimeSlotsForDate: async (date) => {
    try {
      const response = await axiosInstance.get('/appointments/available-by-date', {
        params: {
          date: date
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy khung giờ trống theo ngày:', error);
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
  },
  getAppointmentsByPatientId: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/appointments/patient/${patientId}`)
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn theo patient ID:", error)
      throw error
    }
  },

  updateAppointmentService: async (appointmentId, serviceId) => {
    try {
      console.log(`Updating service for appointmentId: ${appointmentId} to serviceId: ${serviceId}`);
      const response = await axiosInstance.put(`/appointments/${appointmentId}/service`, { serviceId });
      console.log("Update Appointment Service Response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật dịch vụ cuộc hẹn:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật dịch vụ cuộc hẹn');
    }
  },

  getAllAppointments: async () => {
    try {
      const response = await axiosInstance.get("/appointments")
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy tất cả lịch hẹn:", error)
      throw error
    }
  },


  getDoctorAppointmentsByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/doctors/by-user/${userId}/appointments`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn của bác sĩ theo userId:", error);
      throw error;
    }
  },
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái lịch hẹn:", error);
      throw error;
    }
  },

  // Chuyển trạng thái cuộc hẹn sang chờ thanh toán sau khi bác sĩ tạo hồ sơ bệnh án
  setAppointmentWaitingPayment: async (appointmentId, totalAmount) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/waiting-payment`, { totalAmount });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi chuyển trạng thái cuộc hẹn sang chờ thanh toán:", error);
      throw error;
    }
  },

  // Đánh dấu cuộc hẹn đã thanh toán và chuyển trạng thái sang hoàn thành
  markAppointmentAsPaid: async (appointmentId, transactionId) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/mark-as-paid`, { transactionId });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đánh dấu cuộc hẹn đã thanh toán:", error);
      throw error;
    }
  },

  // Lấy danh sách cuộc hẹn đang chờ thanh toán
  getWaitingPaymentAppointments: async () => {
    try {
      const response = await axiosInstance.get('/appointments/waiting-payment');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc hẹn đang chờ thanh toán:", error);
      throw error;
    }
  },

  // Lấy danh sách cuộc hẹn đang chờ thanh toán của bác sĩ
  getWaitingPaymentAppointmentsByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/appointments/doctor/${doctorId}/waiting-payment`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc hẹn đang chờ thanh toán của bác sĩ:", error);
      throw error;
    }
  },

  // Lấy thông tin hóa đơn của cuộc hẹn
  getAppointmentInvoice: async (appointmentId) => {
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}/invoice`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin hóa đơn của cuộc hẹn:", error);
      throw error;
    }
  },
  
  // Lấy chi tiết cuộc hẹn theo ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết cuộc hẹn:", error);
      throw error;
    }
  }
};

export default appointmentService;
