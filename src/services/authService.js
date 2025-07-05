import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/'; // Thay đổi URL này theo cấu hình backend của bạn

// Cập nhật hàm login trong authService.js
const login = async (email, password) => {
  try {
    const response = await axios.post(API_URL + 'login', {
      username: email,
      password
    });

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return { success: true, data: response.data };
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';

    if (error.response) {
      const data = error.response.data;

      if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else {
        errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến server';
    }

    return { success: false, message: errorMessage };
  }
};


const signup = async (username, name, email, password) => {
  try {
    const response = await axios.post(API_URL + 'signup', {
      username,
      name,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    // Log rõ lỗi
    console.error("Lỗi từ server:", error.response?.data);
    console.error("Status code:", error.response?.status);
    console.error("Headers:", error.response?.headers);

    // Ném ra lỗi với message backend trả về
    throw new Error(error.response?.data || "Đã xảy ra lỗi");
  }
};


const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(API_URL + 'signup/verify-otp', { email, otp },
    {
      withCredentials: true,
    });
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

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(API_URL + 'forgot-password', { email });
    return { success: true, message: response.data };
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu';

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else {
        errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến server';
    }

    return { success: false, message: errorMessage };
  }
};

const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(API_URL + 'reset-password', { email, otp, newPassword });
    return { success: true, message: response.data };
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi khi đặt lại mật khẩu';

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else {
        errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến server';
    }

    return { success: false, message: errorMessage };
  }
};

// Hàm tiện ích để xác định đường dẫn chuyển hướng dựa trên vai trò người dùng
const getRoleBasedRedirectPath = (role) => {
  switch (role) {
    case 'DOCTOR':
      return '/dashboard/doctor';
    case 'RECEPTIONIST':
      return '/dashboard/receptionist';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'STORE_MANAGER':
      return '/dashboard/storeManagement'; // Chuyển hướng đến Store Management Dashboard
    case 'PATIENT':
    default:
      return '/'; // Mặc định chuyển hướng về trang chủ cho bệnh nhân
  }
};

const authService = {
  login,
  signup,
  loginWithGoogle,
  handleGoogleCallback,
  logout,
  getCurrentUser,
  isLoggedIn,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getRoleBasedRedirectPath
};

export default authService;
