import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_URL}/api/service-feedback`;

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
    },
    timeout: 10000
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response và error
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('Service Feedback API Error:', error);
        
        if (error.response) {
            // Server trả về error response
            const { status, data } = error.response;
            
            if (status === 401) {
                // Token hết hạn hoặc không hợp lệ
                authService.logout();
                window.location.href = '/login';
                return Promise.reject('Phiên đăng nhập đã hết hạn');
            }
            
            if (status === 403) {
                return Promise.reject('Bạn không có quyền thực hiện thao tác này');
            }
            
            if (status === 404) {
                return Promise.reject('Không tìm thấy dữ liệu');
            }
            
            if (status >= 500) {
                return Promise.reject('Lỗi server, vui lòng thử lại sau');
            }
            
            // Trả về message từ server nếu có
            const errorMessage = data?.error || data?.message || 'Có lỗi xảy ra';
            return Promise.reject(errorMessage);
        } else if (error.request) {
            // Network error
            return Promise.reject('Không thể kết nối đến server');
        } else {
            // Lỗi khác
            return Promise.reject(error.message || 'Có lỗi xảy ra');
        }
    }
);

const serviceFeedbackService = {
    /**
     * Tạo feedback mới cho appointment
     * @param {Object} feedbackData - Dữ liệu feedback
     * @param {number} feedbackData.appointmentId - ID cuộc hẹn
     * @param {number} feedbackData.patientId - ID bệnh nhân
     * @param {number} feedbackData.rating - Đánh giá (1-5 sao)
     * @param {string} feedbackData.comment - Nhận xét
     * @returns {Promise<Object>} Feedback đã tạo
     */
    async createFeedback(feedbackData) {
        try {
            console.log('Creating feedback:', feedbackData);
            const response = await apiClient.post('', feedbackData);
            console.log('Feedback created successfully:', response);
            return response;
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    },

    /**
     * Lấy feedback theo appointment ID
     * @param {number} appointmentId - ID cuộc hẹn
     * @returns {Promise<Object|null>} Feedback hoặc null nếu không tìm thấy
     */
    async getFeedbackByAppointmentId(appointmentId) {
        try {
            console.log('Getting feedback for appointment:', appointmentId);
            const response = await apiClient.get(`/appointment/${appointmentId}`);
            console.log('Feedback retrieved:', response);
            return response;
        } catch (error) {
            if (error === 'Không tìm thấy dữ liệu') {
                console.log('No feedback found for appointment:', appointmentId);
                return null;
            }
            console.error('Error getting feedback by appointment ID:', error);
            throw error;
        }
    },

    /**
     * Lấy tất cả feedback của một patient
     * @param {number} patientId - ID bệnh nhân
     * @returns {Promise<Array>} Danh sách feedback
     */
    async getFeedbacksByPatientId(patientId) {
        try {
            console.log('Getting feedbacks for patient:', patientId);
            const response = await apiClient.get(`/patient/${patientId}`);
            console.log('Patient feedbacks retrieved:', response);
            return response || [];
        } catch (error) {
            console.error('Error getting feedbacks by patient ID:', error);
            throw error;
        }
    },

    /**
     * Cập nhật feedback
     * @param {number} feedbackId - ID feedback
     * @param {Object} feedbackData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Feedback đã cập nhật
     */
    async updateFeedback(feedbackId, feedbackData) {
        try {
            console.log('Updating feedback:', feedbackId, feedbackData);
            const response = await apiClient.put(`/${feedbackId}`, feedbackData);
            console.log('Feedback updated successfully:', response);
            return response;
        } catch (error) {
            console.error('Error updating feedback:', error);
            throw error;
        }
    },

    /**
     * Xóa feedback
     * @param {number} feedbackId - ID feedback
     * @returns {Promise<Object>} Kết quả xóa
     */
    async deleteFeedback(feedbackId) {
        try {
            console.log('Deleting feedback:', feedbackId);
            const response = await apiClient.delete(`/${feedbackId}`);
            console.log('Feedback deleted successfully:', response);
            return response;
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    },

    /**
     * Lấy tất cả feedback (cho admin)
     * @returns {Promise<Array>} Danh sách tất cả feedback
     */
    async getAllFeedbacks() {
        try {
            console.log('Getting all feedbacks');
            const response = await apiClient.get('');
            console.log('All feedbacks retrieved:', response);
            return response || [];
        } catch (error) {
            console.error('Error getting all feedbacks:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra xem appointment đã có feedback chưa
     * @param {number} appointmentId - ID cuộc hẹn
     * @returns {Promise<boolean>} True nếu đã có feedback
     */
    async checkFeedbackExists(appointmentId) {
        try {
            console.log('Checking feedback exists for appointment:', appointmentId);
            const response = await apiClient.get(`/exists/appointment/${appointmentId}`);
            console.log('Feedback exists check result:', response);
            return response?.exists || false;
        } catch (error) {
            console.error('Error checking feedback exists:', error);
            return false;
        }
    },

    /**
     * Lấy thống kê rating
     * @returns {Promise<Object>} Thống kê rating
     */
    async getRatingStatistics() {
        try {
            console.log('Getting rating statistics');
            const response = await apiClient.get('/statistics');
            console.log('Rating statistics retrieved:', response);
            return response || {
                totalFeedbacks: 0,
                averageRating: 0,
                ratingDistribution: {}
            };
        } catch (error) {
            console.error('Error getting rating statistics:', error);
            throw error;
        }
    },

    /**
     * Validate dữ liệu feedback trước khi gửi
     * @param {Object} feedbackData - Dữ liệu feedback
     * @returns {Object} Kết quả validation
     */
    validateFeedbackData(feedbackData) {
        const errors = [];
        
        if (!feedbackData.appointmentId) {
            errors.push('Appointment ID không được để trống');
        }
        
        if (!feedbackData.patientId) {
            errors.push('Patient ID không được để trống');
        }
        
        if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
            errors.push('Rating phải từ 1 đến 5 sao');
        }
        
        if (feedbackData.comment && feedbackData.comment.length > 1000) {
            errors.push('Nhận xét không được vượt quá 1000 ký tự');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Format rating thành text mô tả
     * @param {number} rating - Rating (1-5)
     * @returns {string} Mô tả rating
     */
    getRatingDescription(rating) {
        const descriptions = {
            1: 'Rất không hài lòng',
            2: 'Không hài lòng',
            3: 'Bình thường',
            4: 'Hài lòng',
            5: 'Rất hài lòng'
        };
        return descriptions[rating] || 'Không xác định';
    },

    /**
     * Format thời gian tạo feedback
     * @param {string} dateString - Chuỗi thời gian
     * @returns {string} Thời gian đã format
     */
    formatFeedbackDate(dateString) {
        if (!dateString) return 'Không xác định';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting feedback date:', error);
            return dateString;
        }
    }
};

export default serviceFeedbackService;