import axios from "axios";
import authService from "./authService";

import API_CONFIG from '../config/api.config';


// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user) {
      // Thêm userId vào header để backend có thể xác thực
      config.headers["User-Id"] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Service xử lý các API liên quan đến dịch vụ y tế
 */
const medicalServiceService = {
  /**
   * Lấy danh sách tất cả dịch vụ y tế
   * @returns {Promise<Array>} Danh sách dịch vụ y tế
   */
  getAllMedicalServices: async () => {
    try {
      const response = await axiosInstance.get('/medical-services');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ y tế:', error);
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu");
        return getMockMedicalServices();
      }
      
      throw error;
    }
  },

  /**
   * Lấy thông tin dịch vụ y tế theo ID
   * @param {number} id ID của dịch vụ y tế
   * @returns {Promise<Object>} Thông tin dịch vụ y tế
   */
  getMedicalServiceById: async (id) => {
    try {
      const response = await axiosInstance.get(`/medical-services/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin dịch vụ y tế ID=${id}:`, error);
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu");
        const mockData = getMockMedicalServices();
        const service = mockData.find(s => s.id === parseInt(id));
        return service || null;
      }
      
      throw error;
    }
  },

  /**
   * Tìm kiếm dịch vụ y tế theo từ khóa
   * @param {string} keyword Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách dịch vụ y tế phù hợp
   */
  searchMedicalServices: async (keyword) => {
    try {
      let url = `/medical-services/search?keyword=${encodeURIComponent(keyword)}`;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm dịch vụ y tế:', error);
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu được lọc theo từ khóa
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu");
        const mockData = getMockMedicalServices();
        const filteredData = mockData.filter(s => 
          s.name.toLowerCase().includes(keyword.toLowerCase())
        );
        return filteredData;
      }
      
      throw error;
    }
  },

  /**
   * Upload ảnh dịch vụ
   * @param {File} imageFile File ảnh cần upload
   * @returns {Promise<Object>} Kết quả upload với URL ảnh
   */
  uploadServiceImage: async (imageFile) => {
    try {
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axiosInstance.post('/medical-services/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data; // { imageUrl: "http://example.com/images/filename.jpg" }
    } catch (error) {
      console.error('Lỗi khi upload ảnh dịch vụ:', error);
      
      // Nếu API chưa sẵn sàng, giả lập URL ảnh
      if (error.response && error.response.status === 404) {
        console.log("API upload ảnh chưa sẵn sàng, sử dụng ảnh mẫu");
        // Trả về URL ảnh ngẫu nhiên từ Lorem Picsum
        return { 
          imageUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200` 
        };
      }
      
      throw error;
    }
  },

  /**
   * Tạo dịch vụ y tế mới với ảnh
   * @param {Object} medicalServiceData Dữ liệu dịch vụ y tế mới
   * @param {File} imageFile File ảnh (nếu có)
   * @returns {Promise<Object>} Dịch vụ y tế đã được tạo
   */
  createMedicalService: async (medicalServiceData, imageFile) => {
    try {
      let serviceData = { ...medicalServiceData };
      
      // Nếu có file ảnh, upload trước
      if (imageFile) {
        const uploadResult = await medicalServiceService.uploadServiceImage(imageFile);
        serviceData.imageUrl = uploadResult.imageUrl;
      }
      
      // Sau đó tạo dịch vụ với URL ảnh
      const response = await axiosInstance.post('/medical-services', serviceData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo dịch vụ y tế mới:', error);
      
      // Nếu API chưa sẵn sàng, giả lập tạo mới với dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, giả lập tạo mới");
        return {
          ...medicalServiceData,
          id: Math.floor(Math.random() * 1000) + 10, // Tạo ID ngẫu nhiên
          imageUrl: medicalServiceData.imageUrl || (imageFile ? 
            `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200` : '')
        };
      }
      
      throw error;
    }
  },

  /**
   * Cập nhật thông tin dịch vụ y tế với ảnh
   * @param {number} id ID của dịch vụ y tế cần cập nhật
   * @param {Object} medicalServiceData Dữ liệu cập nhật
   * @param {File} imageFile File ảnh mới (nếu có)
   * @returns {Promise<Object>} Dịch vụ y tế đã được cập nhật
   */
  updateMedicalService: async (id, medicalServiceData, imageFile) => {
    try {
      let serviceData = { ...medicalServiceData };
      
      // Nếu có file ảnh mới, upload trước
      if (imageFile) {
        const uploadResult = await medicalServiceService.uploadServiceImage(imageFile);
        serviceData.imageUrl = uploadResult.imageUrl;
      }
      
      // Sau đó cập nhật dịch vụ với URL ảnh mới (nếu có)
      const response = await axiosInstance.put(`/medical-services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật dịch vụ y tế ID=${id}:`, error);
      
      // Nếu API chưa sẵn sàng, giả lập cập nhật với dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, giả lập cập nhật");
        return { 
          ...medicalServiceData, 
          id: parseInt(id),
          imageUrl: medicalServiceData.imageUrl || (imageFile ? 
            `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200` : '')
        };
      }
      
      throw error;
    }
  },

  /**
   * Xóa dịch vụ y tế
   * @param {number} id ID của dịch vụ y tế cần xóa
   * @returns {Promise<void>}
   */
  deleteMedicalService: async (id) => {
    try {
      await axiosInstance.delete(`/medical-services/${id}`);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa dịch vụ y tế ID=${id}:`, error);
      
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
 * @returns {Array} Danh sách dịch vụ y tế mẫu
 */
function getMockMedicalServices() {
  return [
    {
      id: 1,
      name: 'Khám tổng quát mắt',
      description: 'Kiểm tra sức khỏe mắt toàn diện',
      price: 500000,
      duration: 60
    },
    {
      id: 2,
      name: 'Điều trị bệnh viêm giác mạc',
      description: 'Chẩn đoán và điều trị các bệnh viêm giác mạc theo phương pháp tiên tiến',
      price: 800000,
      duration: 90
    },
    {
      id: 3,
      name: 'Tư vấn phẫu thuật',
      description: 'Tư vấn các phương pháp phẫu thuật phù hợp với tình trạng bệnh',
      price: 1200000,
      duration: 120
    }
  ];
}

export default medicalServiceService