import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/'; // Thay đổi URL này theo cấu hình backend của bạn

// Cập nhật hàm login trong authService.js
const login = async (email, password) => {
  try {
    const response = await axios.post(API_URL + 'login', {
      username: email, // Gửi email như username để phù hợp với backend
      password
    });

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return { success: true, data: response.data };
  } catch (error) {
    // Xử lý thông báo lỗi từ server
    let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';
    
    if (error.response) {
      // Server trả về response với mã lỗi
      if (error.response.status === 401) {
        errorMessage = error.response.data || 'Tên đăng nhập hoặc mật khẩu không đúng';
      } else {
        errorMessage = error.response.data || `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      errorMessage = 'Không thể kết nối đến server';
    }
    
    return { success: false, message: errorMessage };
  }
};

// Thêm hàm đăng nhập bằng Google
const loginWithGoogle = async () => {
  try {
    const response = await axios.get(API_URL + 'google-login-url');
    
    // Chuyển hướng người dùng đến URL đăng nhập Google
    window.location.href = response.data.url;
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm xử lý callback từ Google OAuth
const handleGoogleCallback = async (code) => {
  try {
    const response = await axios.post(API_URL + 'google-callback', { code });
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const isLoggedIn = () => {
  return getCurrentUser() !== null;
};

const authService = {
  login,
  loginWithGoogle,
  handleGoogleCallback,
  logout,
  getCurrentUser,
  isLoggedIn
};

export default authService;
