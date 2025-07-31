// CartService.js - Quản lý giỏ hàng sử dụng API và localStorage

import axios from 'axios';
import authHeader from './auth-header';
import authService from './authService';

// Key để lưu giỏ hàng trong localStorage
const CART_STORAGE_KEY = 'eyespire_cart';
const API_URL = 'https://eyespire-back-end.onrender.com/api';


console.log('API URL being used:', API_URL);

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Thêm interceptor để tự động thêm userId và token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user) {
      // Thêm userId vào header để backend có thể xác thực
      config.headers['User-Id'] = user.id;
      
      // Sử dụng authHeader để thêm token JWT vào header Authorization
      const authHeaders = authHeader();
      if (authHeaders.Authorization) {
        config.headers['Authorization'] = authHeaders.Authorization;
        console.log('Adding Authorization header from authHeader');
      }
      
      console.log('Adding User-Id to header:', user.id);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Kiểm tra xem người dùng đã đăng nhập chưa
const isUserLoggedIn = () => {
  const user = authService.getCurrentUser();
  console.log('User from auth service:', user);
  // Kiểm tra nếu user tồn tại và có id (đã đăng nhập)
  return user && user.id;
};

// Lấy giỏ hàng từ localStorage
const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : { items: [], totalItems: 0, totalPrice: 0 };
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return { items: [], totalItems: 0, totalPrice: 0 };
  }
};

// Lưu giỏ hàng vào localStorage
const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Lấy giỏ hàng
const getCart = async () => {
  console.log('Fetching cart from API...');
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      console.log('No user logged in, using localStorage cart');
      return getCartFromLocalStorage();
    }
    
    // Thêm userId vào URL để backend có thể tìm user bằng ID thay vì email
    const response = await axiosInstance.get(`/cart?userId=${user.id}`);
    
    if (response.data) {
      return response.data;
    }
    return { items: [] };
  } catch (error) {
    console.log('Error getting cart:', error);
    console.log('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    // Nếu có lỗi, sử dụng giỏ hàng từ localStorage
    return getCartFromLocalStorage();
  }
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (product, selectedColor, quantity) => {
  try {
    console.log('Adding to cart:', { product, selectedColor, quantity });
    
    // Tạo dữ liệu sản phẩm để thêm vào giỏ hàng
    const cartItem = {
      productId: product.id,
      colorId: selectedColor ? selectedColor.id : null,
      quantity: quantity
    };
    
    console.log('Cart item to add:', cartItem);
    console.log('Is user logged in?', isUserLoggedIn());

    // Nếu người dùng đã đăng nhập, chỉ gọi API và không lưu vào localStorage
    if (isUserLoggedIn()) {
      console.log('User is logged in, calling API...');
      
      const user = authService.getCurrentUser();
      console.log('User from auth service:', user);
      
      // Thêm userId vào URL để backend có thể tìm user bằng ID thay vì email
      const response = await axiosInstance.post(`/cart/items?userId=${user.id}`, cartItem);
      console.log('API response:', response.data);
      return response.data;
    } else {
      console.log('User is not logged in, using localStorage');
      // Nếu chưa đăng nhập, xử lý trong localStorage
      const cart = getCartFromLocalStorage();
      
      // Tạo ID duy nhất cho item trong giỏ hàng (kết hợp ID sản phẩm và màu sắc)
      const cartItemId = selectedColor ? `${product.id}_${selectedColor.id}` : `${product.id}`;
      
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
      
      if (existingItemIndex !== -1) {
        // Nếu đã có, tăng số lượng
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Nếu chưa có, thêm mới
        cart.items.push({
          cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'),
          color: selectedColor,
          quantity
        });
      }
      
      // Cập nhật tổng số lượng và tổng giá
      updateCartTotals(cart);
      
      // Lưu giỏ hàng
      saveCartToLocalStorage(cart);
      
      return cart;
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Nếu API lỗi và người dùng đã đăng nhập, throw lỗi để xử lý ở UI
    if (isUserLoggedIn()) {
      throw error;
    }
    
    // Nếu chưa đăng nhập, fallback về localStorage
    const cart = getCartFromLocalStorage();
    
    // Tạo ID duy nhất cho item trong giỏ hàng
    const cartItemId = selectedColor ? `${product.id}_${selectedColor.id}` : `${product.id}`;
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
    
    if (existingItemIndex !== -1) {
      // Nếu đã có, tăng số lượng
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới
      cart.items.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'),
        color: selectedColor,
        quantity
      });
    }
    
    // Cập nhật tổng số lượng và tổng giá
    updateCartTotals(cart);
    saveCartToLocalStorage(cart);
    
    return cart;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (cartItemId) => {
  console.log('removeFromCart called with cartItemId:', cartItemId, 'type:', typeof cartItemId);
  try {
    if (isUserLoggedIn()) {
      console.log('Sending DELETE request to:', `/cart/items/${cartItemId}`);
      const response = await axiosInstance.delete(`/cart/items/${cartItemId}`);
      console.log('API response:', response.data);
      return response.data;
    } else {
      const cart = getCartFromLocalStorage();
      
      // Tìm và xóa sản phẩm khỏi giỏ hàng
      cart.items = cart.items.filter(item => item.cartItemId !== cartItemId);
      
      // Cập nhật tổng số lượng và tổng giá
      updateCartTotals(cart);
      
      // Lưu giỏ hàng
      saveCartToLocalStorage(cart);
      
      return cart;
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Nếu API lỗi và người dùng đã đăng nhập, throw lỗi để xử lý ở UI
    if (isUserLoggedIn()) {
      throw error;
    }
    
    // Nếu chưa đăng nhập hoặc API lỗi, fallback về localStorage
    const cart = getCartFromLocalStorage();
    cart.items = cart.items.filter(item => item.cartItemId !== cartItemId);
    updateCartTotals(cart);
    saveCartToLocalStorage(cart);
    return cart;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateQuantity = async (cartItemId, quantity) => {
  console.log('updateQuantity called with cartItemId:', cartItemId, 'type:', typeof cartItemId, 'quantity:', quantity);
  try {
    if (quantity <= 0) {
      // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
      return await removeFromCart(cartItemId);
    }
    
    if (isUserLoggedIn()) {
      console.log('Sending PUT request to:', `/cart/items/${cartItemId}`);
      const response = await axiosInstance.put(`/cart/items/${cartItemId}`, 
        { quantity }
      );
      console.log('API response:', response.data);
      return response.data;
    } else {
      const cart = getCartFromLocalStorage();
      
      // Tìm sản phẩm cần cập nhật
      const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
      
      if (itemIndex !== -1) {
        // Cập nhật số lượng
        cart.items[itemIndex].quantity = quantity;
        
        // Cập nhật tổng số lượng và tổng giá
        updateCartTotals(cart);
        
        // Lưu giỏ hàng
        saveCartToLocalStorage(cart);
      }
      
      return cart;
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Nếu API lỗi và người dùng đã đăng nhập, throw lỗi để xử lý ở UI
    if (isUserLoggedIn()) {
      throw error;
    }
    
    // Nếu chưa đăng nhập hoặc API lỗi, fallback về localStorage
    const cart = getCartFromLocalStorage();
    const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
    
    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity = quantity;
      updateCartTotals(cart);
      saveCartToLocalStorage(cart);
    }
    
    return cart;
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async () => {
  try {
    if (isUserLoggedIn()) {
      const response = await axiosInstance.delete('/cart');
      console.log('API response:', response.data);
      return { items: [], totalItems: 0, totalPrice: 0 };
    } else {
      const emptyCart = { items: [], totalItems: 0, totalPrice: 0 };
      saveCartToLocalStorage(emptyCart);
      return emptyCart;
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Nếu API lỗi, fallback về localStorage
    const emptyCart = { items: [], totalItems: 0, totalPrice: 0 };
    saveCartToLocalStorage(emptyCart);
    return emptyCart;
  }
};

// Cập nhật tổng số lượng và tổng giá
const updateCartTotals = (cart) => {
  cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Lấy số lượng sản phẩm trong giỏ hàng
const getCartItemCount = async () => {
  try {
    const cart = await getCart();
    return cart?.totalItems || 0;
  } catch (error) {
    // Xử lý lỗi yên lặng, không log ra console
    const cart = getCartFromLocalStorage();
    return cart?.totalItems || 0;
  }
};

// Đồng bộ giỏ hàng từ localStorage lên server khi đăng nhập
const syncCartWithServer = async () => {
  try {
    if (isUserLoggedIn()) {
      const localCart = getCartFromLocalStorage();
      
      // Chỉ đồng bộ nếu có sản phẩm trong giỏ hàng local
      if (localCart.items.length > 0) {
        // Gửi toàn bộ giỏ hàng local lên server để đồng bộ
        const response = await axiosInstance.post('/cart/sync', { items: localCart.items });
        console.log('API response:', response.data);
        
        // Sau khi đồng bộ thành công, xóa giỏ hàng local
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      
      // Lấy giỏ hàng mới nhất từ server
      return await getCart();
    }
    
    return getCartFromLocalStorage();
  } catch (error) {
    console.error('Error syncing cart with server:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return getCartFromLocalStorage();
  }
};

const cartService = {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartItemCount,
  syncCartWithServer
};

export default cartService;
