"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, X, Save, Eye, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import productService from "../../../services/productService";
// import "./edit-product.css";

const EditProductPage = ({ productId, onBack, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageContainerRef = useRef(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const fallbackImage = "https://picsum.photos/50/50";

  const categories = [
    { value: "Y tế", label: "Y tế" },
    { value: "Thiết bị", label: "Thiết bị" },
  ];

  const getFullUrl = (url) => {
    if (!url || url.trim() === "") {
      console.log("Image URL is null or empty, using fallback:", fallbackImage);
      return fallbackImage;
    }
    return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
  };

  const handleImageError = (e) => {
    console.warn(`Failed to load image: ${e.target.src}`);
    e.target.src = fallbackImage;
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoomLevel(1);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  const mapProductTypeToCategory = (type) => {
    const categoryMap = {
      MEDICINE: "Y tế",
      EYEWEAR: "Thiết bị",
    };
    return categoryMap[type] || "Thiết bị";
  };

  const mapCategoryToProductType = (category) => {
    const categoryMap = {
      "Y tế": "MEDICINE",
      "Thiết bị": "EYEWEAR",
    };
    return categoryMap[category] || "EYEWEAR";
  };

  useEffect(() => {
    const loadProductData = async () => {
      setIsLoading(true);
      setErrors({});

      try {
        if (!productId) {
          throw new Error("Product ID is required");
        }

        const productData = await productService.getProductById(productId);
        if (productData) {
          const imageUrl = getFullUrl(productData.imageUrl);
          const mappedData = {
            id: productData.id.toString(),
            name: productData.name || "",
            description: productData.description || "",
            category: mapProductTypeToCategory(productData.type),
            price: productData.price?.toString() || "",
            quantity: productData.stockQuantity?.toString() || "",
            image: productData.imageUrl
                ? { id: Date.now(), url: imageUrl, name: "main-image.jpg", isExisting: true }
                : null,
          };
          setFormData(mappedData);
          setOriginalData(mappedData);
          console.log("Loaded product data:", mappedData);
        } else {
          throw new Error(`Product with ID "${productId}" not found`);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        const errorMessage = error.message.includes("not found")
            ? `Không tìm thấy sản phẩm với mã "${productId}".`
            : "Có lỗi xảy ra khi tải thông tin sản phẩm.";
        alert(errorMessage);
        setTimeout(() => onBack(), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProductData();
    } else {
      console.warn("No product ID provided");
      alert("Không có mã sản phẩm để chỉnh sửa!");
      onBack();
    }
  }, [productId, onBack]);

  useEffect(() => {
    if (originalData) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(hasChanged);
    }
  }, [formData, originalData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 1); // Limit to one image
    if (files.length === 0) {
      console.log("No file selected");
      return;
    }

    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    console.log(`Selected file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      alert("Chỉ hỗ trợ định dạng JPG, PNG, hoặc GIF!");
      return;
    }
    if (file.size > maxSize) {
      console.error("File size exceeds 5MB:", file.size);
      alert("Kích thước file vượt quá 5MB!");
      return;
    }

    try {
      console.log("Uploading image to backend...");
      const uploadResponse = await productService.uploadProductImage(file);
      console.log("Upload response:", uploadResponse);
      const imageUrl = getFullUrl(uploadResponse.imageUrl);
      console.log("Normalized image URL:", imageUrl);
      setFormData((prev) => ({
        ...prev,
        image: {
          id: Date.now() + Math.random(),
          url: imageUrl,
          name: file.name,
          file: file, // Store file for submission
          isExisting: false,
        },
      }));
      console.log(`Uploaded image: ${file.name} -> ${imageUrl}`);
    } catch (error) {
      console.error(`Error uploading image ${file.name}:`, error.message, error.stack);
      alert(`Không thể tải lên hình ảnh ${file.name}: ${error.message}`);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.description.trim()) newErrors.description = "Mô tả sản phẩm là bắt buộc";
    if (!formData.category) newErrors.category = "Danh mục là bắt buộc";
    if (!formData.price || Number.parseFloat(formData.price) <= 0) newErrors.price = "Giá phải lớn hơn 0";
    if (!formData.quantity || Number.parseInt(formData.quantity) < 0) newErrors.quantity = "Số lượng không được âm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stockQuantity: Number.parseInt(formData.quantity),
        type: mapCategoryToProductType(formData.category),
      };

      const response = formData.image && !formData.image.isExisting
          ? await productService.updateProductWithImage(productId, productData, formData.image.file)
          : await productService.updateProduct(productId, { ...productData, imageUrl: formData.image?.url || null });

      console.log("Product updated:", response);
      alert("Sản phẩm đã được cập nhật thành công!");
      setOriginalData(formData);
      setHasChanges(false);
      onEditSuccess();
      onBack();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Có lỗi xảy ra khi cập nhật sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.")) {
      try {
        await productService.deleteProduct(productId);
        console.log("Deleted product:", productId);
        alert("Sản phẩm đã được xóa thành công!");
        onEditSuccess();
        onBack();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Có lỗi xảy ra khi xóa sản phẩm!");
      }
    }
  };

  const resetForm = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy tất cả thay đổi không?")) {
      setFormData(originalData);
      setErrors({});
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
        <div className="pm-edit-product-container">
          <div className="pm-loading-state">
            <div className="pm-loading-spinner"></div>
            <p>Đang tải thông tin sản phẩm...</p>
            <small>Mã sản phẩm: {productId}</small>
          </div>
        </div>
    );
  }

  if (!formData.id && !isLoading) {
    return (
        <div className="pm-edit-product-container">
          <div className="pm-error-state">
            <div className="pm-error-icon">⚠️</div>
            <h2>Không thể tải sản phẩm</h2>
            <p>Sản phẩm với mã "{productId}" không tồn tại hoặc đã bị xóa.</p>
            <button className="btn btn-primary" onClick={onBack}>
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
          </div>
        </div>
    );
  }

  if (previewMode) {
    return (
        <div className="pm-edit-product-container">
          <div className="pm-page-header">
            <button className="btn btn-secondary" onClick={() => setPreviewMode(false)}>
              <ArrowLeft size={16} />
              Quay lại chỉnh sửa
            </button>
            <h1>Xem trước sản phẩm</h1>
            <div className="pm-header-actions">
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={16} />
                Xóa sản phẩm
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || !hasChanges}>
                <Save size={16} />
                {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>

          <div className="pm-product-preview">
            <div className="pm-preview-card">
              <div className="pm-preview-images">
                {formData.image ? (
                    <div className="pm-image-gallery">
                      <img
                          src={getFullUrl(formData.image.url)}
                          alt="Main product"
                          className="pm-main-image"
                          onError={handleImageError}
                          onClick={() => handleImageClick(getFullUrl(formData.image.url))}
                          style={{ cursor: "pointer" }}
                      />
                    </div>
                ) : (
                    <div className="pm-no-image-placeholder">
                      <Upload size={48} />
                      <p>Chưa có hình ảnh</p>
                    </div>
                )}
              </div>

              <div className="pm-preview-info">
                <h2 className="pm-product-title">{formData.name || "Tên sản phẩm"}</h2>
                <div className="pm-product-price">
                <span className="pm-price">
                  ₫{formData.price ? Number.parseFloat(formData.price).toLocaleString() : "0"}
                </span>
                  <span className={`pm-stock ${Number.parseInt(formData.quantity) > 0 ? "pm-in-stock" : "pm-out-of-stock"}`}>
                  {Number.parseInt(formData.quantity) > 0 ? `Còn ${formData.quantity} sản phẩm` : "Hết hàng"}
                </span>
                </div>

                <div className="pm-product-details">
                  <div className="pm-detail-row">
                    <span className="pm-label">Danh mục:</span>
                    <span className="pm-value">
                    {categories.find((cat) => cat.value === formData.category)?.label || "Chưa chọn"}
                  </span>
                  </div>
                </div>

                <div className="pm-product-description">
                  <h3>Mô tả sản phẩm</h3>
                  <p>{formData.description || "Chưa có mô tả"}</p>
                </div>
              </div>
            </div>
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
    );
  }

  return (
      <div className="pm-edit-product-container">
        <div className="pm-page-header">
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <h1>Chỉnh sửa sản phẩm #{formData.id}</h1>
          <div className="pm-header-actions">
            {hasChanges && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Hủy thay đổi
                </button>
            )}
            <button className="btn btn-secondary" onClick={() => setPreviewMode(true)}>
              <Eye size={16} />
              Xem trước
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} />
              Xóa
            </button>
            <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !hasChanges}
            >
              <Save size={16} />
              {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </div>

        {hasChanges && (
            <div className="pm-changes-indicator">
              <p>⚠️ Bạn có thay đổi chưa được lưu</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="pm-edit-product-form">
          <div className="pm-form-grid">
            <div className="pm-form-section">
              <h2>Thông tin cơ bản</h2>

              <div className="pm-form-group">
                <label className="pm-form-label required">Tên sản phẩm</label>
                <input
                    type="text"
                    className={`pm-form-input ${errors.name ? "pm-error" : ""}`}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <span className="pm-error-message">{errors.name}</span>}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Mô tả sản phẩm</label>
                <textarea
                    className={`pm-form-textarea ${errors.description ? "pm-error" : ""}`}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                    rows={4}
                />
                {errors.description && <span className="pm-error-message">{errors.description}</span>}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Danh mục</label>
                <select
                    className={`pm-form-select ${errors.category ? "pm-error" : ""}`}
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                  ))}
                </select>
                {errors.category && <span className="pm-error-message">{errors.category}</span>}
              </div>
            </div>

            <div className="pm-form-section">
              <h2>Giá & Kho hàng</h2>

              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label className="pm-form-label required">Giá bán (₫)</label>
                  <input
                      type="number"
                      className={`pm-form-input ${errors.price ? "pm-error" : ""}`}
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0"
                      min="0"
                  />
                  {errors.price && <span className="pm-error-message">{errors.price}</span>}
                </div>

                <div className="pm-form-group">
                  <label className="pm-form-label required">Số lượng</label>
                  <input
                      type="number"
                      className={`pm-form-input ${errors.quantity ? "pm-error" : ""}`}
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                      placeholder="0"
                      min="0"
                  />
                  {errors.quantity && <span className="pm-error-message">{errors.quantity}</span>}
                </div>
              </div>
            </div>

            <div className="pm-form-section">
              <h2>Hình ảnh sản phẩm</h2>

              <div className="pm-image-upload-area">
                <input
                    type="file"
                    id="pm-image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="pm-hidden-input"
                />
                <label htmlFor="pm-image-upload" className="pm-upload-label">
                  <Upload size={24} />
                  <span>Chọn hình ảnh hoặc kéo thả vào đây</span>
                  <small>Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)</small>
                </label>
              </div>

              {formData.image && (
                  <div className="pm-uploaded-images">
                    <div className="pm-image-item">
                      <img
                          src={getFullUrl(formData.image.url)}
                          alt={formData.image.name}
                          onError={handleImageError}
                          onClick={() => handleImageClick(getFullUrl(formData.image.url))}
                          style={{ cursor: "pointer" }}
                      />
                      {formData.image.isExisting && <div className="pm-existing-badge">Hiện tại</div>}
                      <button type="button" className="pm-remove-image" onClick={removeImage}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
              )}
            </div>
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
        </form>
      </div>
  );
};

export default EditProductPage;