import axios from 'axios';

const API_URL = 'https://eyespire-back-end.onrender.com';


const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/products`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Lấy sản phẩm theo ID
    getProductById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/api/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo loại (MEDICINE hoặc EYEWEAR)
    getProductsByType: async (type) => {
        try {
            const response = await axios.get(`${API_URL}/api/products/type/${type}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products of type ${type}:`, error);
            throw error;
        }
    },

    // Tạo sản phẩm mới (không có hình ảnh)
    createProduct: async (productData) => {
        try {
            const response = await axios.post(`${API_URL}/api/products`, productData);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Tạo sản phẩm mới với hình ảnh
    createProductWithImage: async (productData, imageFile) => {
        try {
            let productDataWithImage = { ...productData };
            
            // Nếu có file ảnh, upload trước
            if (imageFile) {
                const uploadResult = await productService.uploadProductImage(imageFile);
                productDataWithImage.imageUrl = uploadResult.imageUrl;
            }
            
            // Sau đó tạo sản phẩm với URL ảnh
            const response = await axios.post(`${API_URL}/api/products`, productDataWithImage);
            return response.data;
        } catch (error) {
            console.error('Error creating product with image:', error);
            throw error;
        }
    },

    // Cập nhật sản phẩm (không có hình ảnh)
    updateProduct: async (id, productData) => {
        try {
            const response = await axios.put(`${API_URL}/api/products/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product with id ${id}:`, error);
            throw error;
        }
    },

    // Cập nhật sản phẩm với hình ảnh
    updateProductWithImage: async (id, productData, imageFile) => {
        try {
            let productDataWithImage = { ...productData };
            
            // Nếu có file ảnh mới, upload trước
            if (imageFile) {
                const uploadResult = await productService.uploadProductImage(imageFile);
                productDataWithImage.imageUrl = uploadResult.imageUrl;
            }
            
            // Sau đó cập nhật sản phẩm với URL ảnh mới (nếu có)
            const response = await axios.put(`${API_URL}/api/products/${id}`, productDataWithImage);
            return response.data;
        } catch (error) {
            console.error(`Error updating product with id ${id} with image:`, error);
            throw error;
        }
    },

    // Xóa sản phẩm
    deleteProduct: async (id) => {
        try {
            await axios.delete(`${API_URL}/api/products/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting product with id ${id}:`, error);
            throw error;
        }
    },

    // Cập nhật số lượng tồn kho
    updateProductStock: async (id, stockQuantity) => {
        try {
            const response = await axios.patch(`${API_URL}/api/products/${id}/stock`, { stockQuantity });
            return response.data;
        } catch (error) {
            console.error(`Error updating stock for product with id ${id}:`, error);
            throw error;
        }
    },

    // Upload ảnh sản phẩm
    uploadProductImage: async (imageFile) => {
        try {
            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await axios.post(`${API_URL}/api/products/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return response.data; // { imageUrl: "http://example.com/images/filename.jpg" }
        } catch (error) {
            console.error('Lỗi khi upload ảnh sản phẩm:', error);
            
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
    }
};

export default productService;
