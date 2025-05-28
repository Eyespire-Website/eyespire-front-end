import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api';

const userService = {
  // Lấy thông tin người dùng hiện tại
  getCurrentUserInfo: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.get(
        `${API_URL}/users/${currentUser.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            // Thêm authorization header nếu cần
          }
        }
      );

      // Cập nhật thông tin người dùng trong localStorage
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          ...response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.put(
        `${API_URL}/users/${currentUser.id}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Thêm authorization header nếu cần
          }
        }
      );

      // Cập nhật thông tin người dùng trong localStorage
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          ...response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.put(
        `${API_URL}/users/${currentUser.id}/change-password`,
        passwordData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Thêm authorization header nếu cần
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      throw error;
    }
  },

  // Cập nhật ảnh đại diện
  updateAvatar: async (formData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.put(
        `${API_URL}/users/${currentUser.id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Thêm authorization header nếu cần
          }
        }
      );

      // Cập nhật avatarUrl trong localStorage
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          avatarUrl: response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Lấy thông tin người dùng mới nhất từ server
        await userService.getCurrentUserInfo();
      }

      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh đại diện:', error);
      throw error;
    }
  }
};

export default userService;
