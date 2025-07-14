import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import CartHeader from "./CartHeader";
import Footer from "../../components/Footer/Footer";
import cartService from "../../services/cartService";
import authService from "../../services/authService";
import orderService from "../../services/orderService";
import ChatBox from "../../components/ChatBox/ChatBox";
import AddressSelector from "../../components/AddressSelector/AddressSelector";
import "./index.css";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const navigate = useNavigate();

  // Function to get proper image URL for cart items
  const getImageUrl = (item) => {
    const productName = item.productName || item.name;
    const originalImageUrl = item.productImage || item.image || item.imageUrl;
    
    console.log('[CART IMAGE DEBUG] Product:', productName);
    console.log('[CART IMAGE DEBUG] Original imageUrl:', originalImageUrl);
    
    const imageUrl = originalImageUrl 
      ? (originalImageUrl.startsWith('http') 
        ? originalImageUrl 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${originalImageUrl}`)
      : "/placeholder.svg";
    
    console.log('[CART IMAGE DEBUG] Constructed URL:', imageUrl);
    return imageUrl;
  };

  // Handle address selection from AddressSelector
  const handleAddressSelect = (addressData) => {
    setShippingAddress(addressData.address);
    console.log('Selected address:', addressData);
  };

  // Handle distance calculation and shipping fee
  const handleDistanceCalculated = (distanceData) => {
    setShippingFee(distanceData.shippingFee);
    setDistanceInfo(distanceData);
    console.log('Distance calculated:', distanceData);
  };

  useEffect(() => {
    // Lấy dữ liệu giỏ hàng khi component được mount
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        // Nếu người dùng đăng nhập, đồng bộ giỏ hàng local với server
        if (authService.isLoggedIn()) {
          await cartService.syncCartWithServer();
        }
        
        const cartData = await cartService.getCart();
        setCart(cartData);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", err);
        setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Xử lý cập nhật số lượng sản phẩm
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const updatedCart = await cartService.updateQuantity(itemId, newQuantity);
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", err);
      setError("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (itemId) => {
    if (isProcessing) return;
    
    console.log('handleRemoveItem called with itemId:', itemId);
    console.log('Current cart before remove:', cart);
    
    setIsProcessing(true);
    try {
      const updatedCart = await cartService.removeFromCart(itemId);
      console.log('Updated cart from API:', updatedCart);
      // Force React re-render by creating new object with deep clone of items
      setCart({ 
        ...updatedCart, 
        items: [...(updatedCart.items || [])] 
      });
      console.log('Cart state updated successfully');
      setError(null);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err);
      setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    if (isProcessing) return;
    
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
      setIsProcessing(true);
      try {
        const emptyCart = await cartService.clearCart();
        setCart(emptyCart);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi xóa giỏ hàng:", err);
        setError("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Xử lý chuyển đến trang thanh toán
  const handleCheckout = async () => {
    // Kiểm tra xem giỏ hàng có sản phẩm không
    if (cart.items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    
    // Kiểm tra địa chỉ giao hàng
    if (!shippingAddress.trim()) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!authService.isLoggedIn()) {
      // Lưu đường dẫn hiện tại để sau khi đăng nhập sẽ chuyển hướng lại
      localStorage.setItem('redirectAfterLogin', '/cart');
      alert("Vui lòng đăng nhập để tiếp tục thanh toán.");
      navigate("/login");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Lấy thông tin người dùng
      const user = authService.getCurrentUser();
      
      // Tạo đơn hàng từ giỏ hàng
      const orderData = {
        userId: user.id,
        shippingAddress: shippingAddress
      };
      
      const order = await orderService.createOrder(orderData);
      
      // Tạo thanh toán PayOS
      const paymentData = {
        orderId: order.id,
        amount: order.totalAmount,
        description: `Thanh toán đơn hàng #${order.id}`,
        returnUrl: `${window.location.origin}/payment/order-return`
      };
      
      const paymentResponse = await orderService.createPayOSPayment(paymentData);
      
      // Chuyển hướng đến trang thanh toán PayOS
      if (paymentResponse && paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        throw new Error("Không thể tạo URL thanh toán");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng hoặc thanh toán:", error);
      alert(`Có lỗi xảy ra: ${error.message || "Không thể xử lý thanh toán"}`);
      setIsProcessing(false);
    }
  };

  // Hiển thị khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="crt-cart-loading-container">
        <div className="crt-cart-loading-spinner"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  // Hiển thị khi có lỗi
  if (error) {
    return (
      <div className="crt-cart-error-container">
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button 
          className="crt-retry-btn"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="crt-cart-page">
      <CartHeader />
      
      <div className="crt-cart-container">
        {cart.items.length === 0 ? (
          <div className="crt-cart-empty">
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
            <Link to="/shop" className="crt-continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="crt-cart-content">
            <div className="crt-cart-items">
              <div className="crt-cart-header-row">
                <div className="crt-cart-header-product">Sản phẩm</div>
                <div className="crt-cart-header-price">Đơn giá</div>
                <div className="crt-cart-header-quantity">Số lượng</div>
                <div className="crt-cart-header-total">Thành tiền</div>
                <div className="crt-cart-header-actions">Thao tác</div>
              </div>
              
              {cart.items.map((item, index) => (
                <div key={item.id || `cart-item-${index}`} className="crt-cart-item">
                  <div className="crt-cart-item-product">
                    <img 
                      src={getImageUrl(item)} 
                      alt={item.productName || item.name} 
                      className="crt-cart-item-image"
                      onError={(e) => {
                        console.log('[CART IMAGE ERROR] Failed to load image for', item.productName || item.name, ':', e.target.src);
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="crt-cart-item-details">
                      <Link to={`/product/${item.productId}`} className="crt-cart-item-name">
                        {item.productName || item.name}
                      </Link>
                      {item.color && (
                        <div className="crt-cart-item-color">
                          <span>Màu: </span>
                          <span 
                            className="crt-color-dot" 
                            style={{ backgroundColor: item.color.color }}
                            title={item.color.name}
                          ></span>
                          <span>{item.color.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="crt-cart-item-price">${item.price}</div>
                  
                  <div className="crt-cart-item-quantity">
                    <button 
                      className="crt-quantity-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isProcessing}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="crt-quantity-input"
                      disabled={isProcessing}
                    />
                    <button 
                      className="crt-quantity-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={isProcessing}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div className="crt-cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <div className="crt-cart-item-actions">
                    <button 
                      className="crt-remove-item-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Xóa sản phẩm"
                      disabled={isProcessing}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="crt-cart-summary">
              <h2 className="crt-summary-title">Tóm tắt đơn hàng</h2>
              
              {/* Address Selector */}
              <div className="crt-address-section">
                <AddressSelector
                  onAddressSelect={handleAddressSelect}
                  onDistanceCalculated={handleDistanceCalculated}
                  defaultAddress={shippingAddress}
                />
              </div>
              
              <div className="crt-summary-row">
                <span>Tổng sản phẩm:</span>
                <span>{cart.totalItems}</span>
              </div>
              
              <div className="crt-summary-row">
                <span>Tạm tính:</span>
                <span>{cart.totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
              
              <div className="crt-summary-row crt-shipping">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')} VND` : 'Chưa tính'}</span>
              </div>
              
              <div className="crt-summary-row crt-total">
                <span>Tổng cộng:</span>
                <span>{(cart.totalPrice + (shippingFee / 25000)).toLocaleString('vi-VN')} VND</span>
              </div>
              
              <button 
                className="crt-checkout-btn" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Đang xử lý..." : "Tiến hành thanh toán"}
              </button>
              
              <Link to="/shop" className="crt-continue-shopping-link">
                Tiếp tục mua sắm
              </Link>
              
              <button 
                className="crt-clear-cart-btn" 
                onClick={handleClearCart}
                disabled={isProcessing}
              >
                {isProcessing ? "Đang xử lý..." : "Xóa giỏ hàng"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      <ChatBox />
    </div>
  );
}
