"use client"
import { Link } from "react-router-dom";
import "./ProductCard.css"

export default function ProductCard({ product, onAddToCart }) {
  // Format price to VND
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Check if product is out of stock
  const isOutOfStock = () => {
    return product.stockQuantity <= 0 || product.status === "Hết hàng";
  };

  // Check if product is low on stock
  const isLowStock = () => {
    return !isOutOfStock() && (product.status === "Sắp hết" || (product.stockQuantity > 0 && product.stockQuantity <= 5));
  };

  return (
    <div className="st-product-card">
      <Link to={`/product/${product.id}`} className="st-product-link">
        <div className="st-product-image">
          <img 
            src={product.imageUrl 
              ? (product.imageUrl.startsWith('http') 
                ? product.imageUrl 
                : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${product.imageUrl}`) 
              : "/placeholder.svg"} 
            alt={product.name} 
            loading="lazy"
          />
          {isOutOfStock() && <span className="st-out-of-stock-label">Hết hàng</span>}
          {isLowStock() && <span className="st-low-stock-label">Sắp hết</span>}
        </div>
        <div className="st-product-info">
          <h3 className="st-product-name">{product.name}</h3>
          <p className="st-product-price">{formatPrice(product.price)}</p>
          {product.description && (
            <p className="st-product-description">{product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description}
            </p>
          )}
        </div>
      </Link>
      <button 
        className={`st-add-to-cart-btn ${isOutOfStock() ? 'disabled' : ''}`} 
        onClick={(e) => {
          e.preventDefault();
          if (!isOutOfStock()) {
            onAddToCart(product);
          }
        }}
        disabled={isOutOfStock()}
        aria-label={isOutOfStock() ? 'Sản phẩm hết hàng' : 'Thêm vào giỏ hàng'}
      >
        {isOutOfStock() ? 'Hết hàng' : 'Thêm vào giỏ'}
      </button>
    </div>
  )
}