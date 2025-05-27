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

    return response.data;
  } catch (error) {
    throw error;
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
