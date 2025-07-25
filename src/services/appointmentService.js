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
  cancelAppointment: async (appointmentId, cancellationReason) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/cancel`, {
        cancellationReason: cancellationReason
      });
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

  updateAppointmentServices: async (appointmentId, serviceIds) => {
    try {
      console.log(`Updating services for appointmentId: ${appointmentId} to serviceIds: ${JSON.stringify(serviceIds)}`);
      const response = await axiosInstance.put(`/appointments/${appointmentId}/services`, { serviceIds });
      console.log("Update Appointment Services Response:", response.data);
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

  setAppointmentWaitingPayment: async (appointmentId, totalAmount) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/waiting-payment`, { totalAmount });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi chuyển trạng thái cuộc hẹn sang chờ thanh toán:", error);
      throw error;
    }
  },

  markAppointmentAsPaid: async (appointmentId, transactionId) => {
    try {
      const response = await axiosInstance.put(`/appointments/${appointmentId}/mark-as-paid`, { transactionId });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đánh dấu cuộc hẹn đã thanh toán:", error);
      throw error;
    }
  },

  getWaitingPaymentAppointments: async () => {
    try {
      const response = await axiosInstance.get('/appointments/waiting-payment');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc hẹn đang chờ thanh toán:", error);
      throw error;
    }
  },

  getWaitingPaymentAppointmentsByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/appointments/doctor/${doctorId}/waiting-payment`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc hẹn đang chờ thanh toán của bác sĩ:", error);
      throw error;
    }
  },

  getAppointmentInvoice: async (appointmentId) => {
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}/invoice`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin hóa đơn của cuộc hẹn:", error);
      throw error;
    }
  },

  getAppointmentById: async (appointmentId) => {
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết cuộc hẹn:", error);
      throw error;
    }
  },
  createInvoiceAndSetWaitingPayment: async (appointmentId, serviceIds, includeMedications, medications) => {
    try {
      const response = await axiosInstance.post(`/appointments/${appointmentId}/create-invoice`, {
        serviceIds,
        includeMedications,
        medications
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn và chuyển trạng thái:", error);
      throw error;
    }
  },
  // Cập nhật trạng thái đơn thuốc
  updatePrescriptionStatus: async (appointmentId, status) => {
    try {
      // Validate status against allowed values
      const validStatuses = ['NOT_BUY', 'PENDING', 'DELIVERED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Trạng thái đơn thuốc không hợp lệ: ${status}. Phải là một trong ${validStatuses.join(', ')}.`);
      }

      const response = await axiosInstance.put(`/appointments/${appointmentId}/invoice/prescription-status`, {
        prescriptionStatus: status
      });

      console.log(`Cập nhật trạng thái đơn thuốc cho cuộc hẹn ${appointmentId} thành ${status}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái đơn thuốc cho cuộc hẹn ${appointmentId}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn thuốc');
    }
  }
};

export default appointmentService;