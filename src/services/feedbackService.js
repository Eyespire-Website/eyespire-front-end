import axios from 'axios';
import authService from './authService';
import userService from './userService'; // Import userService

const API_URL = 'https://eyespire-back-end.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
      const user = authService.getCurrentUser();
      if (user) {
        config.headers["User-Id"] = user.id;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

const feedbackService = {
    getFeedbackByProductId: async (productId) => {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.get(`/feedbacks/product/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Lấy thông tin user cho từng feedback
            const feedbacks = response.data || [];
            const feedbacksWithUserInfo = await Promise.all(
                feedbacks.map(async (feedback) => {
                    try {
                        const user = await userService.getPatientById(feedback.patientId);
                        return {
                            ...feedback,
                            patient: {
                                name: user.name || 'Unknown User',
                                avatar: user.avatarUrl || null,
                            },
                        };
                    } catch (error) {
                        console.error(`Lỗi khi lấy thông tin user ${feedback.patientId}:`, error);
                        return {
                            ...feedback,
                            patient: {
                                name: 'Unknown User',
                                avatar: null,
                            },
                        };
                    }
                })
            );

            return feedbacksWithUserInfo;
        } catch (error) {
            console.error('Error fetching feedbacks:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách feedback.');
        }
    },

    // Các hàm khác giữ nguyên: updateFeedback, createFeedback, deleteFeedback
    updateFeedback: async (feedbackData) => {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.put(`/feedbacks/${feedbackData.id}`, feedbackData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating feedback:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật feedback.');
        }
    },

    createFeedback: async (feedbackData) => {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.post(`/feedbacks`, feedbackData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating feedback:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw new Error(error.response?.data?.message || 'Lỗi khi tạo feedback.');
        }
    },

    deleteFeedback: async (feedbackId) => {
        try {
            const token = authService.getToken();
            await axiosInstance.delete(`/feedbacks/${feedbackId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error deleting feedback:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw new Error(error.response?.data?.message || 'Lỗi khi xóa feedback.');
        }
    },
};

export default feedbackService;