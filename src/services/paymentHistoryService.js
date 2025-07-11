import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/payment-history';

// Tạo axios instance với cấu hình chung
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor để tự động thêm userId vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        if (user && user.id) {
            config.headers['X-User-ID'] = user.id;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const paymentHistoryService = {
    /**
     * Lấy lịch sử thanh toán của người dùng
     * @param {number} userId ID của người dùng
     * @returns {Promise<Array>} Danh sách lịch sử thanh toán
     */
    getUserPaymentHistory: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử thanh toán:", error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết hóa đơn
     * @param {string} id ID của hóa đơn
     * @param {string} type Loại hóa đơn (service hoặc order)
     * @returns {Promise<Object>} Chi tiết hóa đơn
     */
    getPaymentDetail: async (id, type) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${id}?type=${type}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
            throw error;
        }
    },

    /**
     * Lọc lịch sử thanh toán theo loại
     * @param {number} userId ID của người dùng
     * @param {string} type Loại hóa đơn (service, order, hoặc all)
     * @returns {Promise<Array>} Danh sách lịch sử thanh toán đã lọc
     */
    filterPaymentHistory: async (userId, type) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/user/${userId}/filter?type=${type}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lọc lịch sử thanh toán:", error);
            throw error;
        }
    },

    /**
     * Tìm kiếm lịch sử thanh toán
     * @param {number} userId ID của người dùng
     * @param {string} query Từ khóa tìm kiếm
     * @returns {Promise<Array>} Danh sách lịch sử thanh toán phù hợp với từ khóa
     */
    searchPaymentHistory: async (userId, query) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/user/${userId}/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tìm kiếm lịch sử thanh toán:", error);
            throw error;
        }
    },

    /**
     * Lấy trạng thái thanh toán dưới dạng text
     * @param {string} status Trạng thái thanh toán
     * @returns {string} Text hiển thị
     */
    getStatusText: (status) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'cancelled':
                return 'Đã hủy';
            case 'refunded':
                return 'Đã hoàn tiền';
            default:
                return 'Không xác định';
        }
    },

    /**
     * Lấy class CSS cho trạng thái thanh toán
     * @param {string} status Trạng thái thanh toán
     * @returns {string} Class CSS
     */
    getStatusClass: (status) => {
        switch (status) {
            case 'paid':
                return 'status-paid';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            case 'refunded':
                return 'status-refunded';
            default:
                return 'status-unknown';
        }
    }
};

export default paymentHistoryService;
