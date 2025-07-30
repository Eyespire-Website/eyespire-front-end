import API_CONFIG from '../config/api.config';
import axios from "axios"
import authService from "./authService"

const API_URL = "https://eyespire-back-end.onrender.com/api"

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser()
    if (user) {
      // Thêm userId vào header để backend có thể xác thực
      config.headers["User-Id"] = user.id
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * Service xử lý các API liên quan đến chuyên khoa
 */
const specialtyService = {
  /**
   * Lấy danh sách tất cả chuyên khoa
   * @returns {Promise<Array>} Danh sách chuyên khoa
   */
  getAllSpecialties: async () => {
    try {
      const response = await axiosInstance.get('/specialties');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chuyên khoa:', error);
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu");
        return getMockSpecialties();
      }
      
      throw error;
    }
  },

  /**
   * Lấy thông tin chuyên khoa theo ID
   * @param {number} id ID của chuyên khoa
   * @returns {Promise<Object>} Thông tin chuyên khoa
   */
  getSpecialtyById: async (id) => {
    try {
      const response = await axiosInstance.get(`/specialties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin chuyên khoa ID=${id}:`, error);
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu");
        const mockData = getMockSpecialties();
        const specialty = mockData.find(s => s.id === parseInt(id));
        return specialty || null;
      }
      
      throw error;
    }
  },

  /**
   * Tìm kiếm chuyên khoa theo từ khóa
   * @param {string} keyword Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách chuyên khoa phù hợp
   */
  searchSpecialties: async (keyword) => {
    try {
      const response = await axiosInstance.get(`/specialties/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm chuyên khoa:', error);
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu được lọc theo từ khóa
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu");
        const mockData = getMockSpecialties();
        const filteredData = mockData.filter(s => 
          s.name.toLowerCase().includes(keyword.toLowerCase())
        );
        return filteredData;
      }
      
      throw error;
    }
  },

  /**
   * Tạo chuyên khoa mới
   * @param {Object} specialtyData Dữ liệu chuyên khoa mới
   * @returns {Promise<Object>} Chuyên khoa đã được tạo
   */
  createSpecialty: async (specialtyData) => {
    try {
      const response = await axiosInstance.post('/specialties', specialtyData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo chuyên khoa mới:', error);
      
      // Nếu API chưa sẵn sàng, giả lập tạo mới với dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, giả lập tạo mới");
        const mockData = getMockSpecialties();
        const newId = Math.max(...mockData.map(s => s.id)) + 1;
        const newSpecialty = { ...specialtyData, id: newId };
        return newSpecialty;
      }
      
      throw error;
    }
  },

  /**
   * Cập nhật thông tin chuyên khoa
   * @param {number} id ID của chuyên khoa cần cập nhật
   * @param {Object} specialtyData Dữ liệu cập nhật
   * @returns {Promise<Object>} Chuyên khoa đã được cập nhật
   */
  updateSpecialty: async (id, specialtyData) => {
    try {
      const response = await axiosInstance.put(`/specialties/${id}`, specialtyData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật chuyên khoa ID=${id}:`, error);
      
      // Nếu API chưa sẵn sàng, giả lập cập nhật với dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, giả lập cập nhật");
        return { ...specialtyData, id: parseInt(id) };
      }
      
      throw error;
    }
  },

  /**
   * Xóa chuyên khoa
   * @param {number} id ID của chuyên khoa cần xóa
   * @returns {Promise<void>}
   */
  deleteSpecialty: async (id) => {
    try {
      await axiosInstance.delete(`/specialties/${id}`);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa chuyên khoa ID=${id}:`, error);
      
      // Nếu API chưa sẵn sàng, giả lập xóa thành công
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, giả lập xóa thành công");
        return true;
      }
      
      throw error;
    }
  }
};

/**
 * Dữ liệu mẫu cho trường hợp API chưa sẵn sàng
 * @returns {Array} Danh sách chuyên khoa mẫu
 */
function getMockSpecialties() {
  return [
    { id: 1, name: 'Nhãn khoa', description: 'Chuyên khoa về các bệnh lý về mắt', imageUrl: 'https://example.com/images/nhan-khoa.jpg' },
    { id: 2, name: 'Giác mạc', description: 'Chuyên khoa về bệnh lý giác mạc', imageUrl: 'https://example.com/images/giac-mac.jpg' },
    { id: 3, name: 'Đục thủy tinh thể', description: 'Chuyên khoa về bệnh đục thủy tinh thể', imageUrl: 'https://example.com/images/duc-thuy-tinh-the.jpg' },
    { id: 4, name: 'Võng mạc', description: 'Chuyên khoa về bệnh lý võng mạc', imageUrl: 'https://example.com/images/vong-mac.jpg' }
  ];
}

export default specialtyService;
