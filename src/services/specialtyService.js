import axios from "axios"
import authService from "./authService"

const API_URL = "http://localhost:8080/api"

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
  }
};

/**
 * Dữ liệu mẫu cho trường hợp API chưa sẵn sàng
 * @returns {Array} Danh sách chuyên khoa mẫu
 */
function getMockSpecialties() {
  return [
    { id: 1, name: 'Nhãn khoa', description: 'Chuyên khoa về các bệnh lý về mắt' },
    { id: 2, name: 'Giác mạc', description: 'Chuyên khoa về bệnh lý giác mạc' },
    { id: 3, name: 'Đục thủy tinh thể', description: 'Chuyên khoa về bệnh đục thủy tinh thể' },
    { id: 4, name: 'Võng mạc', description: 'Chuyên khoa về bệnh lý võng mạc' }
  ];
}

export default specialtyService;
