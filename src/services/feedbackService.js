import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const feedbackService = {
    // Lấy danh sách feedback theo productId
    getFeedbackByProductId: async (productId) => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${API_URL}/api/feedbacks/product/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data || [];
        } catch (error) {
            console.error('Error fetching feedbacks:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách feedback.');
        }
    },

    // Tạo feedback mới
    createFeedback: async (feedbackData) => {
        try {
            const token = authService.getToken();
            const response = await axios.post(`${API_URL}/api/feedbacks`, feedbackData, {
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

    // Xóa feedback
    deleteFeedback: async (feedbackId) => {
        try {
            const token = authService.getToken();
            await axios.delete(`${API_URL}/api/feedbacks/${feedbackId}`, {
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