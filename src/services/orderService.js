import axios from 'axios';
import authService from './authService';

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
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Tạo thanh toán PayOS cho đơn hàng
   * @param {Object} paymentData Dữ liệu thanh toán
   * @returns {Promise<Object>} Thông tin thanh toán PayOS
   */
  createPayOSPayment: async (paymentData) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/orders/payment/payos`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating PayOS payment:', error);
      throw error;
    }
  },

  /**
   * Xác thực kết quả thanh toán từ PayOS
   * @param {Object} verifyData Dữ liệu xác thực
   * @returns {Promise<Object>} Kết quả xác thực
   */
  verifyPayOSPayment: async (verifyData) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/orders/payment/payos/verify`, verifyData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying PayOS payment:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   * @param {string} orderCode Mã đơn hàng
   * @returns {Promise<Object>} Trạng thái thanh toán
   */
  checkPaymentStatus: async (orderCode) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/orders/payment/payos/${orderCode}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
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
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @returns {Promise<Array>} Danh sách đơn hàng
   */
  getUserOrders: async () => {
    try {
      const token = authService.getToken();
      const userId = authService.getCurrentUser().id;
      const response = await axios.get(`${API_URL}/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }
};

export default orderService;
