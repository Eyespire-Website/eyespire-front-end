import axios from 'axios';
import authHeader from './auth-header';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class OrderService {
    /**
     * Lấy danh sách đơn hàng của người dùng
     * @param {number} userId - ID của người dùng
     * @returns {Promise} - Promise chứa danh sách đơn hàng
     */
    getUserOrders(userId) {
        return axios.get(`${BASE_URL}/api/orders/user/${userId}`, { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }

    /**
     * Lấy thông tin chi tiết của một đơn hàng
     * @param {number} orderId - ID của đơn hàng
     * @returns {Promise} - Promise chứa thông tin chi tiết đơn hàng
     */
    getOrderById(orderId) {
        return axios.get(`${BASE_URL}/api/orders/${orderId}`, { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }

    /**
     * Tạo đơn hàng mới từ giỏ hàng
     * @param {number} userId - ID của người dùng
     * @param {string} shippingAddress - Địa chỉ giao hàng
     * @returns {Promise} - Promise chứa thông tin đơn hàng đã tạo
     */
    createOrderFromCart(userId, shippingAddress) {
        return axios.post(`${BASE_URL}/api/orders`, {
            userId: userId,
            shippingAddress: shippingAddress
        }, { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }

    /**
     * Chuyển đổi trạng thái đơn hàng sang text hiển thị
     * @param {string} status - Trạng thái đơn hàng
     * @returns {string} - Text hiển thị
     */
    getStatusText(status) {
        switch (status) {
            case 'PENDING':
                return 'Đang xử lý';
            case 'PAID':
                return 'Đã thanh toán';
            case 'SHIPPED':
                return 'Đang giao hàng';
            case 'COMPLETED':
                return 'Đã hoàn thành';
            case 'CANCELED':
                return 'Đã hủy';
            default:
                return status;
        }
    }

    /**
     * Lấy class CSS cho trạng thái đơn hàng
     * @param {string} status - Trạng thái đơn hàng
     * @returns {string} - Class CSS
     */
    getStatusClass(status) {
        switch (status) {
            case 'PENDING':
                return 'status-processing';
            case 'PAID':
                return 'status-paid';
            case 'SHIPPED':
                return 'status-shipping';
            case 'COMPLETED':
                return 'status-delivered';
            case 'CANCELED':
                return 'status-cancelled';
            default:
                return 'status-default';
        }
    }

    /**
     * Format số tiền thành định dạng tiền tệ VND
     * @param {number} amount - Số tiền
     * @returns {string} - Chuỗi tiền tệ đã format
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
}

export default new OrderService();
