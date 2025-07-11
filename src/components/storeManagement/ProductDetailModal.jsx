import React, { useState, useEffect, useRef } from 'react';
import { X, Star, ZoomIn, ZoomOut } from 'lucide-react';
import './stmStyle/STM-ProductDetailModal.css';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageContainerRef = useRef(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const fallbackImage = "https://placehold.co/50x50?text=Image";

  // Normalize image URL
  const getFullUrl = (url) => {
    if (!url || url.trim() === "") {
      console.log("Image URL is null or empty, using fallback:", fallbackImage);
      return fallbackImage;
    }
    return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
  };

  // Handle image click to open modal
  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoomLevel(1);
  };

  // Close image modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    };

    const imageContainer = imageContainerRef.current;
    if (selectedImage && imageContainer) {
      imageContainer.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (imageContainer) {
        imageContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, [selectedImage]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

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
                <img
                    src={getFullUrl(product.image)}
                    alt={product.name}
                    onClick={() => handleImageClick(getFullUrl(product.image))}
                    style={{ cursor: "pointer" }}
                />
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
                          <img
                              src={getFullUrl(image)}
                              alt={`Ảnh ${index + 1}`}
                              onClick={() => handleImageClick(getFullUrl(image))}
                              style={{ cursor: "pointer" }}
                          />
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

          {selectedImage && (
              <div className="image-modal-overlay" onClick={handleCloseModal}>
                <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                  <button className="image-modal-close" onClick={handleCloseModal}>
                    <X size={24} />
                  </button>
                  <div className="image-modal-content" ref={imageContainerRef}>
                    <img
                        src={selectedImage}
                        alt="Zoomed product"
                        style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s" }}
                    />
                  </div>
                  <div className="image-modal-controls">
                    <button onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                      <ZoomIn size={20} />
                    </button>
                    <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                      <ZoomOut size={20} />
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default ProductDetailModal;