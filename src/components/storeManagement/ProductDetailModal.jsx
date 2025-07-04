"use client"

import { X, Star, Package, Tag, ShoppingCart, Truck, Calendar } from "lucide-react"
import "./stmStyle/STM-ProductDetailModal.css"

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.floor(rating) ? "star-filled" : "star-empty"}
        fill={index < Math.floor(rating) ? "#fbbf24" : "none"}
        color="#fbbf24"
      />
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981"
      case "inactive":
        return "#ef4444"
      case "draft":
        return "#6b7280"
      default:
        return "#64748b"
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết sản phẩm</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="product-detail-grid">
            <div className="product-images">
              <div className="main-image-container">
                <img
                  src={product.image || "/placeholder.svg?height=300&width=300"}
                  alt={product.name}
                  className="main-image"
                />
                <span
                  className="product-status-badge"
                  style={{
                    backgroundColor: getStatusColor(product.status) + "20",
                    color: getStatusColor(product.status),
                  }}
                >
                  {product.statusText}
                </span>
              </div>
              {product.gallery && product.gallery.length > 0 && (
                <div className="product-thumbnails">
                  {product.gallery.map((img, index) => (
                    <img
                      key={index}
                      src={img || "/placeholder.svg?height=80&width=80"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="thumbnail"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="product-info">
              <h1 className="product-name">{product.name}</h1>
              <div className="product-id">Mã sản phẩm: {product.id}</div>

              {product.rating && (
                <div className="product-rating">
                  <div className="stars">{renderStars(product.rating)}</div>
                  <span className="rating-text">
                    {product.rating} ({product.totalReviews} đánh giá)
                  </span>
                </div>
              )}

              <div className="product-price">₫{product.price?.toLocaleString()}</div>

              <div className="product-description">
                <h3>Mô tả sản phẩm</h3>
                <p>{product.description}</p>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <Package size={16} />
                  <span className="meta-label">Danh mục:</span>
                  <span className="meta-value">{product.category}</span>
                </div>

                {product.sales !== undefined && (
                  <div className="meta-item">
                    <ShoppingCart size={16} />
                    <span className="meta-label">Đã bán:</span>
                    <span className="meta-value">{product.sales} sản phẩm</span>
                  </div>
                )}

                {product.supplier && (
                  <div className="meta-item">
                    <Truck size={16} />
                    <span className="meta-label">Nhà cung cấp:</span>
                    <span className="meta-value">{product.supplier}</span>
                  </div>
                )}

                {product.lastUpdated && (
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span className="meta-label">Cập nhật:</span>
                    <span className="meta-value">{product.lastUpdated}</span>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="meta-item tags-item">
                    <Tag size={16} />
                    <span className="meta-label">Tags:</span>
                    <div className="tags-list">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {product.feedbacks && product.feedbacks.length > 0 && (
            <div className="product-feedbacks">
              <h3>Đánh giá từ khách hàng ({product.feedbacks.length})</h3>
              <div className="feedback-list">
                {product.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="feedback-item">
                    <div className="feedback-header">
                      <div className="customer-info">
                        <span className="customer-name">{feedback.customerName}</span>
                        {feedback.verified && <span className="verified-badge">Đã xác minh</span>}
                      </div>
                      <div className="feedback-meta">
                        <div className="stars">{renderStars(feedback.rating)}</div>
                        <span className="feedback-date">{feedback.date}</span>
                      </div>
                    </div>
                    <div className="feedback-content">
                      <p>{feedback.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button className="btn btn-primary">Chỉnh sửa sản phẩm</button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
