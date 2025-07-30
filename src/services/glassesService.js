import API_CONFIG from '../config/api.config';
import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'https://eyespire-back-end.onrender.com/api/glasses';

class GlassesService {
  // Lấy tất cả các mẫu kính
  getAllGlasses() {
    // Nếu API chưa sẵn sàng, sử dụng dữ liệu mẫu từ glassesModels.js
    return import('../pages/dashboard/patient-dashboard/pages/VirtualGlasses/glassesModels')
      .then(module => {
        const glassesModels = module.default;
        return {
          data: glassesModels.map(glass => ({
            ...glass,
            imageUrl: glass.thumbnailUrl
          }))
        };
      });
    
    // Khi API đã sẵn sàng, sử dụng đoạn code này thay thế
    // return axios.get(API_URL, { headers: authHeader() });
  }

  // Lấy chi tiết một mẫu kính
  getGlassById(id) {
    return import('../pages/dashboard/patient-dashboard/pages/VirtualGlasses/glassesModels')
      .then(module => {
        const glassesModels = module.default;
        const glass = glassesModels.find(g => g.id === id);
        return {
          data: glass ? {
            ...glass,
            imageUrl: glass.thumbnailUrl
          } : null
        };
      });
    
    // Khi API đã sẵn sàng
    // return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
  }

  // Lấy danh sách kính yêu thích của người dùng
  getUserFavoriteGlasses() {
    // Giả lập dữ liệu yêu thích
    return Promise.resolve({
      data: []
    });
    
    // Khi API đã sẵn sàng
    // return axios.get(`${API_URL}/favorites`, { headers: authHeader() });
  }

  // Lưu kính vào danh sách yêu thích
  saveUserGlassFavorite(glassId) {
    // Giả lập lưu yêu thích
    console.log(`Đã thêm kính ID ${glassId} vào danh sách yêu thích`);
    return Promise.resolve({ success: true });
    
    // Khi API đã sẵn sàng
    // return axios.post(`${API_URL}/favorites`, { glassId }, { headers: authHeader() });
  }

  // Xóa kính khỏi danh sách yêu thích
  removeUserGlassFavorite(glassId) {
    // Giả lập xóa yêu thích
    console.log(`Đã xóa kính ID ${glassId} khỏi danh sách yêu thích`);
    return Promise.resolve({ success: true });
    
    // Khi API đã sẵn sàng
    // return axios.delete(`${API_URL}/favorites/${glassId}`, { headers: authHeader() });
  }
}

export default new GlassesService();