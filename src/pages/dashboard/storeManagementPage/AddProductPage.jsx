"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X, Save, Eye } from "lucide-react";
import placeholderImg from "../../../components/storeManagement/img/placeholder.svg";
import productService from "../../../services/productService";
import "./STM-Style/STM-AddProductPage.css";

const AddProductPage = ({ onBack, onAddSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    { value: "Y tế", label: "Y tế" },
    { value: "Thiết bị", label: "Thiết bị" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 1); // Limit to one image
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: newImages, // Replace existing images
    }));
  };

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.description.trim())
      newErrors.description = "Mô tả sản phẩm là bắt buộc";
    if (!formData.category) newErrors.category = "Danh mục là bắt buộc";
    if (!formData.price || Number.parseFloat(formData.price) <= 0)
      newErrors.price = "Giá phải lớn hơn 0";
    if (!formData.quantity || Number.parseInt(formData.quantity) < 0)
      newErrors.quantity = "Số lượng không được âm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapCategoryToProductType = (category) => {
    const categoryMap = {
      "Y tế": "MEDICINE",
      "Thiết bị": "EYEWEAR",
    };
    return categoryMap[category] || "EYEWEAR"; // Fallback to EYEWEAR
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stockQuantity: Number.parseInt(formData.quantity),
        type: mapCategoryToProductType(formData.category),
      };

      // Use createProductWithImage if there's an image, otherwise createProduct
      const response = formData.images.length > 0
          ? await productService.createProductWithImage(productData, formData.images[0].file)
          : await productService.createProduct(productData);

      console.log("Product created:", response);
      alert("Sản phẩm đã được thêm thành công!");
      onAddSuccess(); // Trigger product list refresh
      onBack(); // Navigate back
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Có lỗi xảy ra khi thêm sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (previewMode) {
    return (
        <div className="pm-add-product-container">
          <div className="pm-page-header">
            <button
                className="btn btn-secondary"
                onClick={() => setPreviewMode(false)}
            >
              <ArrowLeft size={16} />
              Quay lại chỉnh sửa
            </button>
            <h1>Xem trước sản phẩm</h1>
            <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>

          <div className="pm-product-preview">
            <div className="pm-preview-card">
              <div className="pm-preview-images">
                {formData.images.length > 0 ? (
                    <div className="pm-image-gallery">
                      <img
                          src={formData.images[0].url || placeholderImg}
                          alt="Main product"
                          className="pm-main-image"
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
                <h2 className="pm-product-title">
                  {formData.name || "Tên sản phẩm"}
                </h2>
                <div className="pm-product-price">
                <span className="pm-price">
                  ₫
                  {formData.price
                      ? Number.parseFloat(formData.price).toLocaleString()
                      : "0"}
                </span>
                  <span
                      className={`pm-stock ${Number.parseInt(formData.quantity) > 0
                          ? "pm-in-stock"
                          : "pm-out-of-stock"
                      }`}
                  >
                  {Number.parseInt(formData.quantity) > 0
                      ? `Còn ${formData.quantity} sản phẩm`
                      : "Hết hàng"}
                </span>
                </div>

                <div className="pm-product-details">
                  <div className="pm-detail-row">
                    <span className="pm-label">Danh mục:</span>
                    <span className="pm-value">
                    {categories.find((cat) => cat.value === formData.category)
                        ?.label || "Chưa chọn"}
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
        </div>
    );
  }

  return (
      <div className="pm-add-product-container">
        <div className="pm-page-header">
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <h1>Thêm sản phẩm mới</h1>
          <div className="pm-header-actions">
            <button
                className="btn btn-secondary"
                onClick={() => setPreviewMode(true)}
            >
              <Eye size={16} />
              Xem trước
            </button>
            <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pm-add-product-form">
          <div className="pm-form-grid">
            {/* Basic Information */}
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
                {errors.name && (
                    <span className="pm-error-message">{errors.name}</span>
                )}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Mô tả sản phẩm</label>
                <textarea
                    className={`pm-form-textarea ${errors.description ? "pm-error" : ""}`}
                    value={formData.description}
                    onChange={(e) =>
                        handleInputChange("description", e.target.value)
                    }
                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                    rows={4}
                />
                {errors.description && (
                    <span className="pm-error-message">{errors.description}</span>
                )}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Danh mục</label>
                <select
                    className={`pm-form-select ${errors.category ? "pm-error" : ""}`}
                    value={formData.category}
                    onChange={(e) =>
                        handleInputChange("category", e.target.value)
                    }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                  ))}
                </select>
                {errors.category && (
                    <span className="pm-error-message">{errors.category}</span>
                )}
              </div>
            </div>

            {/* Pricing & Inventory */}
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
                  {errors.price && (
                      <span className="pm-error-message">{errors.price}</span>
                  )}
                </div>

                <div className="pm-form-group">
                  <label className="pm-form-label required">Số lượng</label>
                  <input
                      type="number"
                      className={`pm-form-input ${errors.quantity ? "pm-error" : ""}`}
                      value={formData.quantity}
                      onChange={(e) =>
                          handleInputChange("quantity", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                  />
                  {errors.quantity && (
                      <span className="pm-error-message">{errors.quantity}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="pm-form-section">
              <h2>Hình ảnh sản phẩm</h2>

              <div className="pm-image-upload-area">
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="pm-hidden-input"
                />
                <label htmlFor="image-upload" className="pm-upload-label">
                  <Upload size={24} />
                  <span>Chọn hình ảnh hoặc kéo thả vào đây</span>
                  <small>Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)</small>
                </label>
              </div>

              {formData.images.length > 0 && (
                  <div className="pm-uploaded-images">
                    {formData.images.map((image) => (
                        <div key={image.id} className="pm-image-item">
                          <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                          />
                          <button
                              type="button"
                              className="pm-remove-image"
                              onClick={() => removeImage(image.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </form>
      </div>
  );
};

export default AddProductPage;