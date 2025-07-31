import axios from 'axios';
import authService from './authService';
import userService from './userService';
import authHeader from './auth-header';

const API_URL = 'https://eyespire-back-end.onrender.com/api';

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
      config.headers['User-Id'] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class OrderService {
    /**
     * Lấy danh sách đơn hàng của người dùng
     * @param {number} userId - ID của người dùng
     * @returns {Promise} - Promise chứa danh sách đơn hàng
     */
    getUserOrders(userId) {
        return axiosInstance.get(`/orders/user/${userId}`, { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại (với auth token)
     * @returns {Promise<Array>} Danh sách đơn hàng
     */
    async getUserOrdersAuth() {
        try {
            const token = authService.getToken();
            const userId = authService.getCurrentUser()?.id;
            if (!userId) throw new Error('Không tìm thấy thông tin người dùng.');
            const response = await axiosInstance.get(`/orders/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data || [];
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng. Vui lòng thử lại.');
        }
    }

    /**
     * Lấy thông tin chi tiết của một đơn hàng
     * @param {number} orderId - ID của đơn hàng
     * @returns {Promise} - Promise chứa thông tin chi tiết đơn hàng
     */
    getOrderById(orderId) {
        return axiosInstance.get(`/orders/${orderId}`, { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }

    /**
     * Lấy thông tin đơn hàng theo ID (với auth token)
     * @param {number} orderId ID đơn hàng
     * @returns {Promise<Object>} Thông tin đơn hàng
     */
    async getOrderByIdAuth(orderId) {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.get(`/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại.');
        }
    }

    /**
     * Tạo đơn hàng mới từ giỏ hàng
     * @param {number} userId - ID của người dùng
     * @param {string} shippingAddress - Địa chỉ giao hàng
     * @returns {Promise} - Promise chứa thông tin đơn hàng đã tạo
     */
    createOrderFromCart(userId, shippingAddress) {
        return axiosInstance.post(`/orders`, {
            userId: userId,
            shippingAddress: shippingAddress
        }, { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }

    /**
     * Tạo đơn hàng từ giỏ hàng (với auth token)
     * @param {Object} orderData Dữ liệu đơn hàng
     * @returns {Promise<Object>} Thông tin đơn hàng đã tạo
     */
    async createOrder(orderData) {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.post(`/orders`, orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
        }
    }

    /**
     * Tạo đơn hàng tại quầy
     * @param {Object} orderData Dữ liệu đơn hàng
     * @returns {Promise<Object>} Thông tin đơn hàng đã tạo
     */
    async createInStoreOrder(orderData) {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.post(`/orders/instore`, orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng tại quầy. Vui lòng thử lại.');
        }
    }

    /**
     * Lấy danh sách tất cả đơn hàng (cho Store Manager)
     * @returns {Promise<Array>} Danh sách đơn hàng
     */
    async getAllOrders() {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.get(`/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data || [];
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách tất cả đơn hàng. Vui lòng thử lại.');
        }
    }

    /**
     * Lấy thông tin bệnh nhân cho đơn hàng
     * @param {number} userId ID người dùng
     * @returns {Promise<Object>} Thông tin bệnh nhân
     */
    async getPatientForOrder(userId) {
        try {
            const patient = await userService.getPatientById(userId);
            return patient || {
                id: userId,
                name: `Khách hàng ${userId || "N/A"}`,
                email: `user${userId || "unknown"}@example.com`,
                phone: "N/A",
                address: "N/A",
            };
        } catch (error) {
            return {
                id: userId,
                name: `Khách hàng ${userId || "N/A"}`,
                email: `user${userId || "unknown"}@example.com`,
                phone: "N/A",
                address: "N/A",
            };
        }
    }

    /**
     * Cập nhật đơn hàng
     * @param {number} orderId ID đơn hàng
     * @param {Object} orderData Dữ liệu đơn hàng
     * @returns {Promise<Object>} Thông tin đơn hàng đã cập nhật
     */
    async updateOrder(orderId, orderData) {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.put(`/orders/${orderId}`, orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng. Vui lòng thử lại.');
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (với token optional cho testing)
     * @param {number} orderId ID đơn hàng
     * @param {string} status Trạng thái mới
     * @returns {Promise<Object>} Kết quả cập nhật
     */
    async updateOrderStatus(orderId, status) {
        try {
            const token = authService.getToken();
            if (!orderId || isNaN(orderId) || !status) {
                throw new Error(`ID đơn hàng hoặc trạng thái không hợp lệ: orderId=${orderId}, status=${status}`);
            }
            const numericOrderId = parseInt(orderId, 10);
            const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELED'];
            if (!validStatuses.includes(status.toUpperCase())) {
                throw new Error(`Trạng thái không hợp lệ: ${status}. Các trạng thái hợp lệ: ${validStatuses.join(', ')}`);
            }

            const headers = {
                'Content-Type': 'text/plain',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.warn('No token found, proceeding without authentication');
            }

            const response = await axiosInstance.put(
                `/orders/${numericOrderId}/status`,
                status,
                { headers }
            );

            return response.data;
        } catch (error) {
            let errorMessage = 'Lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại.';
            if (error.response) {
                const responseData = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
                if (error.response.status === 400) {
                    errorMessage = responseData || 'Trạng thái hoặc dữ liệu không hợp lệ.';
                } else if (error.response.status === 401) {
                    errorMessage = responseData || 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
                } else if (error.response.status === 404) {
                    errorMessage = responseData || `Không tìm thấy đơn hàng với ID: ${orderId}`;
                } else if (error.response.status === 500) {
                    errorMessage = responseData || 'Lỗi máy chủ. Vui lòng kiểm tra backend.';
                } else {
                    errorMessage = responseData || errorMessage;
                }
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend tại https://eyespire-back-end.onrender.com.';
            }
            throw new Error(errorMessage);
        }
    }

    /**
     * Xóa đơn hàng
     * @param {number} orderId ID đơn hàng
     * @returns {Promise<void>}
     */
    async deleteOrder(orderId) {
        try {
            const token = authService.getToken();
            await axiosInstance.delete(`/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi xóa đơn hàng. Vui lòng thử lại.');
        }
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
     * Tạo thanh toán PayOS
     * @param {Object} paymentData Dữ liệu thanh toán
     * @returns {Promise<Object>} Thông tin thanh toán PayOS
     */
    async createPayOSPayment(paymentData) {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.post(`/orders/payment/payos`, paymentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi tạo thanh toán PayOS. Vui lòng thử lại.');
        }
    }

    /**
     * Xác thực thanh toán PayOS cho đơn hàng
     * @param {Object} verifyData Dữ liệu xác thực từ PayOS callback
     * @returns {Promise<Object>} Kết quả xác thực
     */
    async verifyPayOSPayment(verifyData) {
        try {
            const token = authService.getToken();
            const response = await axiosInstance.post(`/orders/payment/payos/verify`, verifyData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi xác thực thanh toán PayOS. Vui lòng thử lại.');
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
