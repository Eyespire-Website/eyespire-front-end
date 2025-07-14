import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chat';

// Tạo axios instance
const chatInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback response nếu API không hoạt động
const fallbackResponse = {
  response: "Xin chào! Tôi là trợ lý Eyespire. Hiện tại tôi đang gặp vấn đề kết nối. Vui lòng thử lại sau hoặc liên hệ với phòng khám qua số điện thoại để được hỗ trợ."
};

const chatService = {
  // Gửi tin nhắn đến API và nhận phản hồi
  sendMessage: async (message) => {
    try {
      const response = await chatInstance.post('/send', { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return fallbackResponse;
    }
  },
};

export default chatService;