"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X, Plus, Save, Eye } from "lucide-react";
import placeholderImg from "../../../components/storeManagement/img/placeholder.svg";
import "./STM-Style/STM-AddProductPage.css";
const AddProductPage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    supplier: "",
    sku: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    tags: [],
    status: "active",
    images: [],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    { value: "thuc-an", label: "Thức ăn" },
    { value: "thiet-bi", label: "Thiết bị" },
    { value: "y-te", label: "Y tế" },
    { value: "trang-tri", label: "Trang trí" },
    { value: "cham-soc", label: "Chăm sóc" },
  ];

  const suppliers = [
    "Công ty TNHH Thức ăn Thủy sản",
    "Công ty CP Thiết bị Thủy sinh",
    "Công ty Dược phẩm Thủy sản",
    "Công ty TNHH Ánh sáng Thủy sinh",
    "Công ty Trang trí Hồ cá",
  ];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
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
    if (!formData.supplier.trim())
      newErrors.supplier = "Nhà cung cấp là bắt buộc";
    if (!formData.sku.trim()) newErrors.sku = "Mã SKU là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Product data:", formData);
      alert("Sản phẩm đã được thêm thành công!");

      // Reset form or navigate back
      onBack();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Có lỗi xảy ra khi thêm sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSKU = () => {
    const categoryCode = formData.category.toUpperCase().slice(0, 2);
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const sku = `${categoryCode}${randomNum}`;
    handleInputChange("sku", sku);
  };

  if (previewMode) {
    return (
      <div className="add-product-container">
        <div className="page-header">
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

        <div className="product-preview">
          <div className="preview-card">
            <div className="preview-images">
              {formData.images.length > 0 ? (
                <div className="image-gallery">
                  <img
                    src={formData.images[0].url || placeholderImg}
                    alt="Main product"
                    className="main-image"
                  />
                  {formData.images.length > 1 && (
                    <div className="thumbnail-list">
                      {formData.images.slice(1, 4).map((image) => (
                        <img
                          key={image.id}
                          src={image.url || placeholderImg}
                          alt="Product thumbnail"
                          className="thumbnail"
                        />
                      ))}
                      {formData.images.length > 4 && (
                        <div className="more-images">
                          +{formData.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-image-placeholder">
                  <Upload size={48} />
                  <p>Chưa có hình ảnh</p>
                </div>
              )}
            </div>

            <div className="preview-info">
              <h2 className="product-title">
                {formData.name || "Tên sản phẩm"}
              </h2>
              <p className="product-sku">
                SKU: {formData.sku || "Chưa có mã SKU"}
              </p>

              <div className="product-price">
                <span className="price">
                  ₫
                  {formData.price
                    ? Number.parseInt(formData.price).toLocaleString()
                    : "0"}
                </span>
                <span
                  className={`stock ${
                    Number.parseInt(formData.quantity) > 0
                      ? "in-stock"
                      : "out-of-stock"
                  }`}
                >
                  {Number.parseInt(formData.quantity) > 0
                    ? `Còn ${formData.quantity} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>

              <div className="product-details">
                <div className="detail-row">
                  <span className="label">Danh mục:</span>
                  <span className="value">
                    {categories.find((cat) => cat.value === formData.category)
                      ?.label || "Chưa chọn"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Nhà cung cấp:</span>
                  <span className="value">
                    {formData.supplier || "Chưa chọn"}
                  </span>
                </div>
                {formData.weight && (
                  <div className="detail-row">
                    <span className="label">Trọng lượng:</span>
                    <span className="value">{formData.weight} kg</span>
                  </div>
                )}
                {(formData.dimensions.length ||
                  formData.dimensions.width ||
                  formData.dimensions.height) && (
                  <div className="detail-row">
                    <span className="label">Kích thước:</span>
                    <span className="value">
                      {formData.dimensions.length}×{formData.dimensions.width}×
                      {formData.dimensions.height} cm
                    </span>
                  </div>
                )}
              </div>

              <div className="product-description">
                <h3>Mô tả sản phẩm</h3>
                <p>{formData.description || "Chưa có mô tả"}</p>
              </div>

              {formData.tags.length > 0 && (
                <div className="product-tags">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <h1>Thêm sản phẩm mới</h1>
        <div className="header-actions">
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

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Thông tin cơ bản</h2>

            <div className="form-group">
              <label className="form-label required">Tên sản phẩm</label>
              <input
                type="text"
                className={`form-input ${errors.name ? "error" : ""}`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Mô tả sản phẩm</label>
              <textarea
                className={`form-textarea ${errors.description ? "error" : ""}`}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Nhập mô tả chi tiết về sản phẩm"
                rows={4}
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Danh mục</label>
                <select
                  className={`form-select ${errors.category ? "error" : ""}`}
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
                  <span className="error-message">{errors.category}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">Trạng thái</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="form-section">
            <h2>Giá & Kho hàng</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Giá bán (₫)</label>
                <input
                  type="number"
                  className={`form-input ${errors.price ? "error" : ""}`}
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0"
                  min="0"
                />
                {errors.price && (
                  <span className="error-message">{errors.price}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">Số lượng</label>
                <input
                  type="number"
                  className={`form-input ${errors.quantity ? "error" : ""}`}
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                  placeholder="0"
                  min="0"
                />
                {errors.quantity && (
                  <span className="error-message">{errors.quantity}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Mã SKU</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    className={`form-input ${errors.sku ? "error" : ""}`}
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Nhập mã SKU"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={generateSKU}
                  >
                    Tự động tạo
                  </button>
                </div>
                {errors.sku && (
                  <span className="error-message">{errors.sku}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Trọng lượng (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Supplier & Dimensions */}
          <div className="form-section">
            <h2>Nhà cung cấp & Kích thước</h2>

            <div className="form-group">
              <label className="form-label required">Nhà cung cấp</label>
              <select
                className={`form-select ${errors.supplier ? "error" : ""}`}
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
              {errors.supplier && (
                <span className="error-message">{errors.supplier}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Kích thước (cm)</label>
              <div className="dimensions-input">
                <input
                  type="number"
                  className="form-input"
                  value={formData.dimensions.length}
                  onChange={(e) =>
                    handleInputChange("dimensions.length", e.target.value)
                  }
                  placeholder="Dài"
                  min="0"
                />
                <span>×</span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dimensions.width}
                  onChange={(e) =>
                    handleInputChange("dimensions.width", e.target.value)
                  }
                  placeholder="Rộng"
                  min="0"
                />
                <span>×</span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dimensions.height}
                  onChange={(e) =>
                    handleInputChange("dimensions.height", e.target.value)
                  }
                  placeholder="Cao"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>Hình ảnh sản phẩm</h2>

            <div className="image-upload-area">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden-input"
              />
              <label htmlFor="image-upload" className="upload-label">
                <Upload size={24} />
                <span>Chọn hình ảnh hoặc kéo thả vào đây</span>
                <small>Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi file)</small>
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="uploaded-images">
                {formData.images.map((image) => (
                  <div key={image.id} className="image-item">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.name}
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(image.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-section">
            <h2>Tags</h2>

            <div className="tags-input">
              <div className="tag-input-container">
                <input
                  type="text"
                  className="form-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nhập tag và nhấn Enter"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addTag}
                >
                  <Plus size={16} />
                  Thêm
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="tags-list">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
