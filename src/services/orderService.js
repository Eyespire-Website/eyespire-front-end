import axios from 'axios';
import authService from './authService';
import userService from './userService';

const API_URL = 'http://localhost:8080/api';

const orderService = {
  /**
   * Tạo đơn hàng từ giỏ hàng
   * @param {Object} orderData Dữ liệu đơn hàng
   * @returns {Promise<Object>} Thông tin đơn hàng đã tạo
   */
  createOrder: async (orderData) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
    }
  },

  /**
   * Lấy thông tin đơn hàng theo ID
   * @param {number} orderId ID đơn hàng
   * @returns {Promise<Object>} Thông tin đơn hàng
   */
  getOrderById: async (orderId) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {

      throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại.');
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @returns {Promise<Array>} Danh sách đơn hàng
   */
  getUserOrders: async () => {
    try {
      const token = authService.getToken();
      const userId = authService.getCurrentUser()?.id;
      if (!userId) throw new Error('Không tìm thấy thông tin người dùng.');
      const response = await axios.get(`${API_URL}/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng. Vui lòng thử lại.');
    }
  },

  /**
   * Lấy danh sách tất cả đơn hàng
   * @returns {Promise<Array>} Danh sách đơn hàng
   */
  getAllOrders: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách tất cả đơn hàng. Vui lòng thử lại.');
    }
  },

  /**
   * Lấy thông tin bệnh nhân cho đơn hàng
   * @param {number} userId ID người dùng
   * @returns {Promise<Object>} Thông tin bệnh nhân
   */
  getPatientForOrder: async (userId) => {
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
  },

  /**
   * Cập nhật đơn hàng
   * @param {number} orderId ID đơn hàng
   * @param {Object} orderData Dữ liệu đơn hàng
   * @returns {Promise<Object>} Thông tin đơn hàng đã cập nhật
   */
  updateOrder: async (orderId, orderData) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/orders/${orderId}`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng. Vui lòng thử lại.');
    }
  },

  // CHANGE: Made token optional for updateOrderStatus to allow testing without authentication
  updateOrderStatus: async (orderId, status) => {
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

      const response = await axios.put(
          `${API_URL}/orders/${numericOrderId}/status`,
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
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend tại http://localhost:8080.';
      }
      throw new Error(errorMessage);
    }
  },
  // END CHANGE


  /**
   * Xóa đơn hàng
   * @param {number} orderId ID đơn hàng
   * @returns {Promise<void>}
   */
  deleteOrder: async (orderId) => {
    try {
      const token = authService.getToken();
      await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa đơn hàng. Vui lòng thử lại.');
    }
  },
};

export default orderService;