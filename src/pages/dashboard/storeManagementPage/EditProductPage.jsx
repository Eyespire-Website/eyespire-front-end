"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, X, Plus, Save, Eye, Trash2 } from "lucide-react"

const EditProductPage = ({ productId, onBack }) => {
  const [formData, setFormData] = useState({
    id: "",
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
  })

  const [originalData, setOriginalData] = useState(null)
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const categories = [
    { value: "thuc-an", label: "Thức ăn" },
    { value: "thiet-bi", label: "Thiết bị" },
    { value: "y-te", label: "Y tế" },
    { value: "trang-tri", label: "Trang trí" },
    { value: "cham-soc", label: "Chăm sóc" },
  ]

  const suppliers = [
    "Công ty TNHH Thức ăn Thủy sản",
    "Công ty CP Thiết bị Thủy sinh",
    "Công ty Dược phẩm Thủy sản",
    "Công ty TNHH Ánh sáng Thủy sinh",
    "Công ty Trang trí Hồ cá",
  ]

  // Mock data for existing product - moved outside component to avoid recreation
  const getMockProductData = (id) => {
    const mockData = {
      SP001: {
        id: "SP001",
        name: "Thức ăn cá Koi cao cấp",
        description:
          "Thức ăn cao cấp dành cho cá Koi với công thức dinh dưỡng đặc biệt, giúp cá phát triển khỏe mạnh và có màu sắc đẹp.",
        category: "thuc-an",
        price: "250000",
        quantity: "150",
        supplier: "Công ty TNHH Thức ăn Thủy sản",
        sku: "TH0001",
        weight: "2.5",
        dimensions: {
          length: "30",
          width: "20",
          height: "15",
        },
        tags: ["thức ăn", "koi", "cao cấp", "dinh dưỡng"],
        status: "active",
        images: [
          {
            id: 1,
            url: "/placeholder.svg?height=300&width=300",
            name: "main-product.jpg",
            isExisting: true,
          },
          {
            id: 2,
            url: "/placeholder.svg?height=300&width=300",
            name: "product-detail.jpg",
            isExisting: true,
          },
        ],
      },
      SP002: {
        id: "SP002",
        name: "Máy lọc nước hồ cá",
        description:
          "Máy lọc nước hiệu suất cao cho hồ cá Koi, có khả năng lọc sạch và duy trì chất lượng nước tối ưu.",
        category: "thiet-bi",
        price: "1500000",
        quantity: "25",
        supplier: "Công ty CP Thiết bị Thủy sinh",
        sku: "TB0002",
        weight: "5.2",
        dimensions: {
          length: "45",
          width: "30",
          height: "25",
        },
        tags: ["máy lọc", "thiết bị", "hồ cá"],
        status: "active",
        images: [
          {
            id: 3,
            url: "/placeholder.svg?height=300&width=300",
            name: "filter-main.jpg",
            isExisting: true,
          },
        ],
      },
      SP003: {
        id: "SP003",
        name: "Thuốc trị bệnh cho cá",
        description: "Thuốc điều trị các bệnh thường gặp ở cá Koi, an toàn và hiệu quả.",
        category: "y-te",
        price: "180000",
        quantity: "5",
        supplier: "Công ty Dược phẩm Thủy sản",
        sku: "YT0003",
        weight: "0.5",
        dimensions: {
          length: "10",
          width: "5",
          height: "15",
        },
        tags: ["thuốc", "y tế", "điều trị"],
        status: "active",
        images: [
          {
            id: 4,
            url: "/placeholder.svg?height=300&width=300",
            name: "medicine.jpg",
            isExisting: true,
          },
        ],
      },
      SP004: {
        id: "SP004",
        name: "Đèn LED chiếu sáng hồ",
        description: "Đèn LED chuyên dụng cho hồ cá với nhiều chế độ ánh sáng, tiết kiệm điện.",
        category: "thiet-bi",
        price: "800000",
        quantity: "0",
        supplier: "Công ty TNHH Ánh sáng Thủy sinh",
        sku: "TB0004",
        weight: "1.8",
        dimensions: {
          length: "60",
          width: "8",
          height: "5",
        },
        tags: ["đèn led", "chiếu sáng", "tiết kiệm"],
        status: "inactive",
        images: [
          {
            id: 5,
            url: "/placeholder.svg?height=300&width=300",
            name: "led-light.jpg",
            isExisting: true,
          },
        ],
      },
    }
    return mockData[id] || null
  }

  useEffect(() => {
    // Simulate loading product data
    const loadProductData = async () => {
      setIsLoading(true)
      setErrors({})

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Check if productId exists
        if (!productId) {
          throw new Error("Product ID is required")
        }

        const productData = getMockProductData(productId)

        if (productData) {
          setFormData(productData)
          setOriginalData(productData)
          console.log("Loaded product data:", productData)
        } else {
          throw new Error(`Product with ID "${productId}" not found. Available products: SP001, SP002, SP003, SP004`)
        }
      } catch (error) {
        console.error("Error loading product:", error)

        // Show user-friendly error message
        const errorMessage = error.message.includes("not found")
          ? `Không tìm thấy sản phẩm với mã "${productId}". Vui lòng kiểm tra lại mã sản phẩm.`
          : "Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại."

        alert(errorMessage)

        // Don't navigate back immediately, let user see the error
        setTimeout(() => {
          onBack()
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      loadProductData()
    } else {
      // Handle case where no productId is provided
      console.warn("No product ID provided")
      alert("Không có mã sản phẩm để chỉnh sửa!")
      onBack()
    }
  }, [productId, onBack])

  useEffect(() => {
    // Check if form data has changed
    if (originalData) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData)
      setHasChanges(hasChanged)
    }
  }, [formData, originalData])

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }))

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
  }

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc"
    if (!formData.description.trim()) newErrors.description = "Mô tả sản phẩm là bắt buộc"
    if (!formData.category) newErrors.category = "Danh mục là bắt buộc"
    if (!formData.price || Number.parseFloat(formData.price) <= 0) newErrors.price = "Giá phải lớn hơn 0"
    if (!formData.quantity || Number.parseInt(formData.quantity) < 0) newErrors.quantity = "Số lượng không được âm"
    if (!formData.supplier.trim()) newErrors.supplier = "Nhà cung cấp là bắt buộc"
    if (!formData.sku.trim()) newErrors.sku = "Mã SKU là bắt buộc"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Updated product data:", formData)
      alert("Sản phẩm đã được cập nhật thành công!")

      // Update original data to reflect changes
      setOriginalData(formData)
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Có lỗi xảy ra khi cập nhật sản phẩm!")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.")) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log("Deleted product:", productId)
        alert("Sản phẩm đã được xóa thành công!")
        onBack()
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Có lỗi xảy ra khi xóa sản phẩm!")
      }
    }
  }

  const resetForm = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy tất cả thay đổi không?")) {
      setFormData(originalData)
      setErrors({})
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pm-edit-product-container">
        <div className="pm-loading-state">
          <div className="pm-loading-spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
          <small>Mã sản phẩm: {productId}</small>
        </div>
      </div>
    )
  }

  // Add error state check
  if (!formData.id && !isLoading) {
    return (
      <div className="pm-edit-product-container">
        <div className="pm-error-state">
          <div className="pm-error-icon">⚠️</div>
          <h2>Không thể tải sản phẩm</h2>
          <p>Sản phẩm với mã "{productId}" không tồn tại hoặc đã bị xóa.</p>
          <p>Các sản phẩm có sẵn: SP001, SP002, SP003, SP004</p>
          <button className="btn btn-primary" onClick={onBack}>
            <ArrowLeft size={16} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
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
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="pm-product-preview">
          <div className="pm-preview-card">
            <div className="pm-preview-images">
              {formData.images.length > 0 ? (
                <div className="pm-image-gallery">
                  <img src={formData.images[0].url || "/placeholder.svg"} alt="Main product" className="pm-main-image" />
                  {formData.images.length > 1 && (
                    <div className="pm-thumbnail-list">
                      {formData.images.slice(1, 4).map((image) => (
                        <img
                          key={image.id}
                          src={image.url || "/placeholder.svg"}
                          alt="Product thumbnail"
                          className="pm-thumbnail"
                        />
                      ))}
                      {formData.images.length > 4 && (
                        <div className="pm-more-images">+{formData.images.length - 4}</div>
                      )}
                    </div>
                  )}
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
              <p className="pm-product-sku">SKU: {formData.sku || "Chưa có mã SKU"}</p>

              <div className="pm-product-price">
                <span className="pm-price">
                  ₫{formData.price ? Number.parseInt(formData.price).toLocaleString() : "0"}
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
                <div className="pm-detail-row">
                  <span className="pm-label">Nhà cung cấp:</span>
                  <span className="pm-value">{formData.supplier || "Chưa chọn"}</span>
                </div>
                {formData.weight && (
                  <div className="pm-detail-row">
                    <span className="pm-label">Trọng lượng:</span>
                    <span className="pm-value">{formData.weight} kg</span>
                  </div>
                )}
                {(formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) && (
                  <div className="pm-detail-row">
                    <span className="pm-label">Kích thước:</span>
                    <span className="pm-value">
                      {formData.dimensions.length}×{formData.dimensions.width}×{formData.dimensions.height} cm
                    </span>
                  </div>
                )}
              </div>

              <div className="pm-product-description">
                <h3>Mô tả sản phẩm</h3>
                <p>{formData.description || "Chưa có mô tả"}</p>
              </div>

              {formData.tags.length > 0 && (
                <div className="pm-product-tags">
                  <h3>Tags</h3>
                  <div className="pm-tags-list">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="pm-tag">
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
    )
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
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || !hasChanges}>
            <Save size={16} />
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
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

            <div className="pm-form-row">
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

              <div className="pm-form-group">
                <label className="pm-form-label required">Trạng thái</label>
                <select
                  className="pm-form-select"
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

            <div className="pm-form-row">
              <div className="pm-form-group">
                <label className="pm-form-label required">Mã SKU</label>
                <input
                  type="text"
                  className={`pm-form-input ${errors.sku ? "pm-error" : ""}`}
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Nhập mã SKU"
                  disabled
                />
                <small className="pm-form-help">Mã SKU không thể thay đổi sau khi tạo</small>
                {errors.sku && <span className="pm-error-message">{errors.sku}</span>}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label">Trọng lượng (kg)</label>
                <input
                  type="number"
                  className="pm-form-input"
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
          <div className="pm-form-section">
            <h2>Nhà cung cấp & Kích thước</h2>

            <div className="pm-form-group">
              <label className="pm-form-label required">Nhà cung cấp</label>
              <select
                className={`pm-form-select ${errors.supplier ? "pm-error" : ""}`}
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
              {errors.supplier && <span className="pm-error-message">{errors.supplier}</span>}
            </div>

            <div className="pm-form-group">
              <label className="pm-form-label">Kích thước (cm)</label>
              <div className="pm-dimensions-input">
                <input
                  type="number"
                  className="pm-form-input"
                  value={formData.dimensions.length}
                  onChange={(e) => handleInputChange("dimensions.length", e.target.value)}
                  placeholder="Dài"
                  min="0"
                />
                <span>×</span>
                <input
                  type="number"
                  className="pm-form-input"
                  value={formData.dimensions.width}
                  onChange={(e) => handleInputChange("dimensions.width", e.target.value)}
                  placeholder="Rộng"
                  min="0"
                />
                <span>×</span>
                <input
                  type="number"
                  className="pm-form-input"
                  value={formData.dimensions.height}
                  onChange={(e) => handleInputChange("dimensions.height", e.target.value)}
                  placeholder="Cao"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="pm-form-section">
            <h2>Hình ảnh sản phẩm</h2>

            <div className="pm-image-upload-area">
              <input
                type="file"
                id="pm-image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="pm-hidden-input"
              />
              <label htmlFor="pm-image-upload" className="pm-upload-label">
                <Upload size={24} />
                <span>Chọn hình ảnh hoặc kéo thả vào đây</span>
                <small>Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi file)</small>
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="pm-uploaded-images">
                {formData.images.map((image) => (
                  <div key={image.id} className="pm-image-item">
                    <img src={image.url || "/placeholder.svg"} alt={image.name} />
                    {image.isExisting && <div className="pm-existing-badge">Hiện tại</div>}
                    <button type="button" className="pm-remove-image" onClick={() => removeImage(image.id)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="pm-form-section">
            <h2>Tags</h2>

            <div className="pm-tags-input">
              <div className="pm-tag-input-container">
                <input
                  type="text"
                  className="pm-form-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nhập tag và nhấn Enter"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <button type="button" className="btn btn-secondary" onClick={addTag}>
                  <Plus size={16} />
                  Thêm
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="pm-tags-list">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="pm-tag">
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
  )
}

export default EditProductPage