import axios from 'axios';

// Định nghĩa API_URL trực tiếp
const API_URL = "http://localhost:8080/api";

const emailService = {
  /**
   * Gửi thông tin đăng nhập qua email cho nhân viên mới
   * @param {Object} data - Dữ liệu nhân viên và thông tin đăng nhập
   * @param {string} data.email - Email của nhân viên
   * @param {string} data.name - Tên nhân viên
   * @param {string} data.username - Tên đăng nhập
   * @param {string} data.password - Mật khẩu
   * @returns {Promise} - Promise với kết quả gửi email
   */
  sendLoginCredentials: async (data) => {
    try {
      // Sử dụng axios thông thường với cấu hình tương tự axiosInstance
      const response = await axios.post(`${API_URL}/admin/send-login-email`, {
        recipientEmail: data.email,
        recipientName: data.name,
        username: data.username,
        password: data.password,
        subject: 'Thông tin đăng nhập hệ thống Eyespire',
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          // Thêm header User-Id từ localStorage
          'User-Id': localStorage.getItem('userId') || ''
        }
      });
      
      return {
        success: true,
        message: 'Đã gửi thông tin đăng nhập qua email thành công',
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi gửi email thông tin đăng nhập:', error);
      return {
        success: false,
        message: 'Gửi email thất bại. Vui lòng thử lại sau.',
        error
      };
    }
  }
};

export default emailService;
