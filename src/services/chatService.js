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
  response: "Xin chào! Tôi là trợ lý Eyespire. Hiện tại tôi đang gặp vấn đề kết nối. Vui lòng thử lại sau hoặc liên hệ với phòng khám qua số điện thoại để được hỗ trợ.",
  success: false
};

// Lấy thông tin user từ localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const chatService = {
  // Gửi tin nhắn đến API và nhận phản hồi (với AI capabilities)
  sendMessage: async (message) => {
    try {
      const user = getCurrentUser();
      const requestData = {
        message: message,
        userId: user ? user.id : null
      };
      
      console.log('Sending message with AI capabilities:', requestData);
      
      const response = await chatInstance.post('/send', requestData);
      
      // Enhanced response with metadata
      return {
        response: response.data.response,
        timestamp: response.data.timestamp,
        success: response.data.success || true,
        isAIQuery: chatService.isDataQuery(message)
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return fallbackResponse;
    }
  },

  // Kiểm tra xem có phải câu hỏi về dữ liệu không
  isDataQuery: (message) => {
    const lowerMessage = message.toLowerCase();
    
    const dataKeywords = [
      'tìm', 'tìm kiếm', 'search', 'find', 'có bao nhiêu', 'how many',
      'danh sách', 'list', 'thống kê', 'statistics', 'báo cáo', 'report',
      'doanh thu', 'revenue', 'bệnh nhân nào', 'which patient',
      'bác sĩ nào', 'which doctor', 'thuốc nào', 'which medicine',
      'lịch hẹn', 'appointment', 'hồ sơ', 'medical record',
      'sản phẩm', 'product', 'kính', 'glasses', 'eyewear'
    ];
    
    return dataKeywords.some(keyword => lowerMessage.includes(keyword));
  },

  // Lấy lịch sử chat của user
  getChatHistory: async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.warn('No user found for chat history');
        return { history: [], totalSessions: 0, success: false };
      }
      
      const response = await chatInstance.get(`/history/${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return { history: [], totalSessions: 0, success: false };
    }
  },

  // Xóa lịch sử chat
  deleteChatHistory: async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.warn('No user found for deleting chat history');
        return { success: false };
      }
      
      const response = await chatInstance.delete(`/history/${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat history:', error);
      return { success: false };
    }
  },

  // Lấy thống kê chat
  getChatStats: async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.warn('No user found for chat stats');
        return { stats: {}, success: false };
      }
      
      const response = await chatInstance.get(`/stats/${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return { stats: {}, success: false };
    }
  },

  // Gợi ý câu hỏi thông minh
  getSuggestedQueries: () => {
    return [
      {
        category: 'Lịch hẹn',
        queries: [
          'Tìm lịch hẹn hôm nay',
          'Có bao nhiêu cuộc hẹn tuần này?',
          'Danh sách lịch hẹn đã hoàn thành',
          'Lịch hẹn nào bị hủy?'
        ]
      },
      {
        category: 'Bệnh nhân',
        queries: [
          'Tìm bệnh nhân có triệu chứng mờ mắt',
          'Danh sách bệnh nhân khám hôm nay',
          'Bệnh nhân nào cần tái khám?'
        ]
      },
      {
        category: 'Sản phẩm',
        queries: [
          'Thuốc nhỏ mắt nào có sẵn?',
          'Kính mắt giá dưới 500k',
          'Sản phẩm bán chạy nhất',
          'Thuốc điều trị viêm kết mạc'
        ]
      },
      {
        category: 'Thống kê',
        queries: [
          'Doanh thu tháng này',
          'Báo cáo cuộc hẹn tuần này',
          'Thống kê bệnh nhân mới',
          'Sản phẩm bán chạy'
        ]
      }
    ];
  },

  // Format response cho hiển thị
  formatResponse: (response) => {
    if (!response || !response.response) {
      return 'Xin lỗi, tôi không thể xử lý yêu cầu này.';
    }
    
    let formatted = response.response;
    
    // Add emoji cho các loại response
    if (response.isAIQuery) {
      if (formatted.includes('Tìm thấy')) {
        formatted = '🔍 ' + formatted;
      } else if (formatted.includes('thống kê')) {
        formatted = '📊 ' + formatted;
      } else if (formatted.includes('lịch hẹn')) {
        formatted = '📅 ' + formatted;
      } else if (formatted.includes('sản phẩm')) {
        formatted = '🛍️ ' + formatted;
      }
    }
    
    return formatted;
  }
};

export default chatService;