import React from 'react';
import { X, Star } from 'lucide-react';
import './stmStyle/STM-ProductDetailModal.css';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="stm-modal-overlay">
      <div className="stm-modal-content stm-product-detail-modal">
        <div className="stm-modal-header">
          <h3>Chi tiết sản phẩm</h3>
          <button className="stm-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="stm-modal-body">
          <div className="stm-product-detail-header">
            <div className="stm-product-detail-image">
              <img src={product.image || "/placeholder.svg"} alt={product.name} />
            </div>
            <div className="stm-product-detail-info">
              <h2 className="stm-product-detail-name">{product.name}</h2>
              <div className="stm-product-detail-id">Mã SP: {product.id}</div>
              <div className="stm-product-detail-price">₫{product.price?.toLocaleString()}</div>
              <div className="stm-product-detail-rating">
                <div className="stm-rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating || 0) ? "#FFB800" : "none"}
                      color={i < Math.floor(product.rating || 0) ? "#FFB800" : "#D1D5DB"}
                    />
                  ))}
                </div>
                <span className="stm-rating-value">{product.rating}</span>
                <span className="stm-rating-count">({product.totalReviews} đánh giá)</span>
              </div>
              <div className="stm-product-detail-status">
                <span className={`stm-status stm-status--${product.status}`}>
                  {product.statusText}
                </span>
              </div>
            </div>
          </div>

          <div className="stm-product-detail-section">
            <h4 className="stm-section-title">Thông tin cơ bản</h4>
            <div className="stm-product-detail-grid">
              <div className="stm-detail-item">
                <div className="stm-detail-label">Danh mục:</div>
                <div className="stm-detail-value">{product.category}</div>
              </div>
              <div className="stm-detail-item">
                <div className="stm-detail-label">Số lượng:</div>
                <div className="stm-detail-value">{product.quantity}</div>
              </div>
              <div className="stm-detail-item">
                <div className="stm-detail-label">Nhà cung cấp:</div>
                <div className="stm-detail-value">{product.supplier}</div>
              </div>
              <div className="stm-detail-item">
                <div className="stm-detail-label">Cập nhật:</div>
                <div className="stm-detail-value">{product.lastUpdated}</div>
              </div>
              <div className="stm-detail-item">
                <div className="stm-detail-label">Đã bán:</div>
                <div className="stm-detail-value">{product.sales || 0}</div>
              </div>
            </div>
          </div>

          <div className="stm-product-detail-section">
            <h4 className="stm-section-title">Mô tả sản phẩm</h4>
            <p className="stm-product-description">{product.description}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="stm-product-detail-section">
              <h4 className="stm-section-title">Thẻ</h4>
              <div className="stm-product-tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="stm-product-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {product.gallery && product.gallery.length > 0 && (
            <div className="stm-product-detail-section">
              <h4 className="stm-section-title">Thư viện ảnh</h4>
              <div className="stm-product-gallery">
                {product.gallery.map((image, index) => (
                  <div key={index} className="stm-gallery-item">
                    <img src={image} alt={`Ảnh ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.feedbacks && product.feedbacks.length > 0 && (
            <div className="stm-product-detail-section">
              <h4 className="stm-section-title">Đánh giá gần đây</h4>
              <div className="stm-product-feedbacks">
                {product.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="stm-feedback-item">
                    <div className="stm-feedback-header">
                      <div className="stm-feedback-customer">
                        {feedback.customerName}
                        {feedback.verified && (
                          <span className="stm-verified-badge">Đã xác thực</span>
                        )}
                      </div>
                      <div className="stm-feedback-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < feedback.rating ? "#FFB800" : "none"}
                            color={i < feedback.rating ? "#FFB800" : "#D1D5DB"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="stm-feedback-date">{feedback.date}</div>
                    <div className="stm-feedback-comment">{feedback.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="stm-modal-footer">
          <button className="stm-btn stm-btn--secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
