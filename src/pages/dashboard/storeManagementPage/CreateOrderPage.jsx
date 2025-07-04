"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, X, Search, User, Package, CreditCard, Save, Eye, Calculator } from "lucide-react"

const CreateOrderPage = ({ onBack, onOrderCreated }) => {
  const [orderData, setOrderData] = useState({
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    items: [],
    paymentMethod: "cash",
    shippingMethod: "standard",
    notes: "",
    discount: 0,
    discountType: "amount", // amount or percentage
  })

  const [customerSearch, setCustomerSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [showProductList, setShowProductList] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Mock data
  const customers = [
    {
      id: "KH001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      phone: "0901234567",
      address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    },
    {
      id: "KH002",
      name: "Trần Thị B",
      email: "tranthib@gmail.com",
      phone: "0912345678",
      address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    },
    {
      id: "KH003",
      name: "Lê Văn C",
      email: "levanc@gmail.com",
      phone: "0923456789",
      address: "789 Đường Pasteur, Quận 1, TP.HCM",
    },
    {
      id: "KH004",
      name: "Phạm Thị D",
      email: "phamthid@gmail.com",
      phone: "0934567890",
      address: "321 Đường Võ Văn Tần, Quận 3, TP.HCM",
    },
    {
      id: "KH005",
      name: "Hoàng Văn E",
      email: "hoangvane@gmail.com",
      phone: "0945678901",
      address: "654 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
    },
  ]

  const products = [
    {
      id: "SP001",
      name: "Thức ăn cá Koi cao cấp",
      price: 250000,
      quantity: 150,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP002",
      name: "Máy lọc nước hồ cá",
      price: 1500000,
      quantity: 25,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP003",
      name: "Thuốc trị bệnh cho cá",
      price: 180000,
      quantity: 5,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP004",
      name: "Đèn LED chiếu sáng hồ",
      price: 800000,
      quantity: 12,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP005",
      name: "Bộ test nước hồ cá",
      price: 350000,
      quantity: 8,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP006",
      name: "Thức ăn cá Koi loại thường",
      price: 120000,
      quantity: 200,
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const paymentMethods = [
    { value: "cash", label: "Tiền mặt" },
    { value: "transfer", label: "Chuyển khoản" },
    { value: "credit", label: "Thẻ tín dụng" },
    { value: "cod", label: "Thu hộ (COD)" },
  ]

  const shippingMethods = [
    { value: "standard", label: "Giao hàng tiêu chuẩn", fee: 50000 },
    { value: "express", label: "Giao hàng nhanh", fee: 30000 },
    { value: "pickup", label: "Khách tự đến lấy", fee: 0 },
  ]

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone.includes(customerSearch) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase()),
  )

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.id.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const selectCustomer = (customer) => {
    setOrderData((prev) => ({
      ...prev,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    }))
    setCustomerSearch(customer.name)
    setShowCustomerList(false)

    // Clear customer errors
    setErrors((prev) => ({
      ...prev,
      "customer.name": "",
      "customer.email": "",
      "customer.phone": "",
      "customer.address": "",
    }))
  }

  const addProduct = (product) => {
    if (product.quantity === 0) {
      alert("Sản phẩm này đã hết hàng!")
      return
    }

    const existingItem = orderData.items.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert("Không thể thêm vì vượt quá số lượng tồn kho!")
        return
      }

      setOrderData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item,
        ),
      }))
    } else {
      setOrderData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            total: product.price,
            image: product.image,
            maxQuantity: product.quantity,
          },
        ],
      }))
    }

    setProductSearch("")
    setShowProductList(false)
  }

  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    const item = orderData.items.find((item) => item.id === itemId)
    if (newQuantity > item.maxQuantity) {
      alert("Số lượng vượt quá tồn kho!")
      return
    }

    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item,
      ),
    }))
  }

  const removeItem = (itemId) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const handleCustomerChange = (field, value) => {
    setOrderData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }))

    // Clear error when user starts typing
    if (errors[`customer.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`customer.${field}`]: "",
      }))
    }
  }

  const calculateSubtotal = () => {
    return orderData.items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    if (orderData.discountType === "percentage") {
      return (subtotal * orderData.discount) / 100
    }
    return orderData.discount
  }

  const calculateShipping = () => {
    const method = shippingMethods.find((m) => m.value === orderData.shippingMethod)
    return method ? method.fee : 0
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return Math.round((subtotal - discount) * 0.1) // 10% tax
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const shipping = calculateShipping()
    const tax = calculateTax()
    return subtotal - discount + shipping + tax
  }

  const validateForm = () => {
    const newErrors = {}

    if (!orderData.customer.name.trim()) newErrors["customer.name"] = "Tên khách hàng là bắt buộc"
    if (!orderData.customer.email.trim()) newErrors["customer.email"] = "Email là bắt buộc"
    if (!orderData.customer.phone.trim()) newErrors["customer.phone"] = "Số điện thoại là bắt buộc"
    if (!orderData.customer.address.trim()) newErrors["customer.address"] = "Địa chỉ là bắt buộc"

    if (orderData.items.length === 0) newErrors.items = "Phải có ít nhất một sản phẩm"

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (orderData.customer.email && !emailRegex.test(orderData.customer.email)) {
      newErrors["customer.email"] = "Email không hợp lệ"
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,11}$/
    if (orderData.customer.phone && !phoneRegex.test(orderData.customer.phone.replace(/\s/g, ""))) {
      newErrors["customer.phone"] = "Số điện thoại không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `ORD${timestamp}`
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận"
      case "confirmed":
        return "Đã xác nhận"
      case "processing":
        return "Đang xử lý"
      case "shipped":
        return "Đã gửi hàng"
      case "delivered":
        return "Đã giao hàng"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Generate order ID
      const orderId = generateOrderId()
      const now = new Date()

      const newOrder = {
        id: orderId,
        customerName: orderData.customer.name,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        customerAddress: orderData.customer.address,
        orderDate: now.toLocaleDateString("vi-VN"),
        status: "pending",
        statusText: getStatusText("pending"),
        paymentMethod: paymentMethods.find((m) => m.value === orderData.paymentMethod)?.label,
        paymentStatus: "pending",
        shippingMethod: shippingMethods.find((m) => m.value === orderData.shippingMethod)?.label,
        items: orderData.items,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        tax: calculateTax(),
        total: calculateTotal(),
        notes: orderData.notes,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Created order:", newOrder)

      // Gọi callback để cập nhật danh sách đơn hàng
      if (onOrderCreated) {
        onOrderCreated(newOrder)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Có lỗi xảy ra khi tạo đơn hàng!")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".customer-search-container")) {
        setShowCustomerList(false)
      }
      if (!event.target.closest(".product-search-container")) {
        setShowProductList(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  if (previewMode) {
    return (
      <div className="pm-create-order-container">
        <div className="pm-page-header">
          <button className="btn btn-secondary" onClick={() => setPreviewMode(false)}>
            <ArrowLeft size={16} />
            Quay lại chỉnh sửa
          </button>
          <h1>Xem trước đơn hàng</h1>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            <Save size={16} />
            {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
          </button>
        </div>

        <div className="pm-order-preview">
          <div className="pm-preview-card">
            <div className="pm-preview-section">
              <h3>
                <User size={18} />
                Thông tin khách hàng
              </h3>
              <div className="pm-customer-preview">
                <p>
                  <strong>Tên:</strong> {orderData.customer.name}
                </p>
                <p>
                  <strong>Email:</strong> {orderData.customer.email}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {orderData.customer.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {orderData.customer.address}
                </p>
              </div>
            </div>

            <div className="pm-preview-section">
              <h3>
                <Package size={18} />
                Sản phẩm đặt hàng
              </h3>
              <div className="pm-items-preview">
                {orderData.items.map((item) => (
                  <div key={item.id} className="pm-item-preview">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} />
                    <div className="pm-item-details">
                      <h4>{item.name}</h4>
                      <p>Số lượng: {item.quantity}</p>
                      <p>Đơn giá: ₫{item.price.toLocaleString()}</p>
                      <p className="pm-item-total">Thành tiền: ₫{item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pm-preview-section">
              <h3>
                <CreditCard size={18} />
                Thông tin thanh toán
              </h3>
              <div className="pm-payment-preview">
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {paymentMethods.find((m) => m.value === orderData.paymentMethod)?.label}
                </p>
                <p>
                  <strong>Phương thức vận chuyển:</strong>{" "}
                  {shippingMethods.find((m) => m.value === orderData.shippingMethod)?.label}
                </p>
                {orderData.notes && (
                  <p>
                    <strong>Ghi chú:</strong> {orderData.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="pm-preview-section">
              <h3>Tổng kết đơn hàng</h3>
              <div className="pm-order-summary">
                <div className="pm-summary-row">
                  <span>Tạm tính:</span>
                  <span>₫{calculateSubtotal().toLocaleString()}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="pm-summary-row">
                    <span>Giảm giá:</span>
                    <span>-₫{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}
                <div className="pm-summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>₫{calculateShipping().toLocaleString()}</span>
                </div>
                <div className="pm-summary-row">
                  <span>Thuế (10%):</span>
                  <span>₫{calculateTax().toLocaleString()}</span>
                </div>
                <div className="pm-summary-row pm-total">
                  <span>Tổng cộng:</span>
                  <span>₫{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pm-create-order-container">
      <div className="pm-page-header">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <h1>Tạo đơn hàng mới</h1>
        <div className="pm-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setPreviewMode(true)}
            disabled={orderData.items.length === 0}
          >
            <Eye size={16} />
            Xem trước
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || orderData.items.length === 0}
          >
            <Save size={16} />
            {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pm-create-order-form">
        <div className="pm-form-grid">
          {/* Customer Information */}
          <div className="pm-form-section">
            <h2>
              <User size={20} />
              Thông tin khách hàng
            </h2>

            <div className="pm-customer-search-container">
              <label className="pm-form-label">Tìm khách hàng</label>
              <div className="pm-search-input-container">
                <input
                  type="text"
                  className="pm-form-input"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerList(true)
                  }}
                  placeholder="Tìm theo tên, email hoặc số điện thoại"
                  onFocus={() => setShowCustomerList(true)}
                />
                <Search size={16} className="pm-search-icon" />
              </div>

              {showCustomerList && filteredCustomers.length > 0 && (
                <div className="pm-dropdown-list">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="pm-dropdown-item" onClick={() => selectCustomer(customer)}>
                      <div className="pm-customer-item">
                        <h4>{customer.name}</h4>
                        <p>
                          {customer.phone} • {customer.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pm-form-row">
              <div className="pm-form-group">
                <label className="pm-form-label required">Tên khách hàng</label>
                <input
                  type="text"
                  className={`pm-form-input ${errors["customer.name"] ? "pm-error" : ""}`}
                  value={orderData.customer.name}
                  onChange={(e) => handleCustomerChange("name", e.target.value)}
                  placeholder="Nhập tên khách hàng"
                />
                {errors["customer.name"] && <span className="pm-error-message">{errors["customer.name"]}</span>}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Email</label>
                <input
                  type="email"
                  className={`pm-form-input ${errors["customer.email"] ? "pm-error" : ""}`}
                  value={orderData.customer.email}
                  onChange={(e) => handleCustomerChange("email", e.target.value)}
                  placeholder="Nhập email"
                />
                {errors["customer.email"] && <span className="pm-error-message">{errors["customer.email"]}</span>}
              </div>
            </div>

            <div className="pm-form-row">
              <div className="pm-form-group">
                <label className="pm-form-label required">Số điện thoại</label>
                <input
                  type="tel"
                  className={`pm-form-input ${errors["customer.phone"] ? "pm-error" : ""}`}
                  value={orderData.customer.phone}
                  onChange={(e) => handleCustomerChange("phone", e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
                {errors["customer.phone"] && <span className="pm-error-message">{errors["customer.phone"]}</span>}
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Địa chỉ</label>
                <input
                  type="text"
                  className={`pm-form-input ${errors["customer.address"] ? "pm-error" : ""}`}
                  value={orderData.customer.address}
                  onChange={(e) => handleCustomerChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
                {errors["customer.address"] && <span className="pm-error-message">{errors["customer.address"]}</span>}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="pm-form-section">
            <h2>
              <Package size={20} />
              Sản phẩm
            </h2>

            <div className="pm-product-search-container">
              <label className="pm-form-label">Thêm sản phẩm</label>
              <div className="pm-search-input-container">
                <input
                  type="text"
                  className="pm-form-input"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setShowProductList(true)
                  }}
                  placeholder="Tìm sản phẩm theo tên hoặc mã"
                  onFocus={() => setShowProductList(true)}
                />
                <Search size={16} className="pm-search-icon" />
              </div>

              {showProductList && filteredProducts.length > 0 && (
                <div className="pm-dropdown-list">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`pm-dropdown-item ${product.quantity === 0 ? "pm-disabled" : ""}`}
                      onClick={() => product.quantity > 0 && addProduct(product)}
                    >
                      <div className="pm-product-item">
                        <img src={product.image || "/placeholder.svg"} alt={product.name} />
                        <div className="pm-product-details">
                          <h4>{product.name}</h4>
                          <p>
                            ₫{product.price.toLocaleString()} • Còn {product.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errors.items && <span className="pm-error-message">{errors.items}</span>}

            {orderData.items.length > 0 && (
              <div className="pm-order-items">
                <h3>Sản phẩm đã chọn</h3>
                {orderData.items.map((item) => (
                  <div key={item.id} className="pm-order-item">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} />
                    <div className="pm-item-info">
                      <h4>{item.name}</h4>
                      <p>₫{item.price.toLocaleString()}</p>
                    </div>
                    <div className="pm-quantity-controls">
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="pm-quantity">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="pm-item-total">₫{item.total.toLocaleString()}</div>
                    <button type="button" className="btn btn-icon" onClick={() => removeItem(item.id)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Shipping */}
          <div className="pm-form-section">
            <h2>
              <CreditCard size={20} />
              Thanh toán & Vận chuyển
            </h2>

            <div className="pm-form-row">
              <div className="pm-form-group">
                <label className="pm-form-label required">Phương thức thanh toán</label>
                <select
                  className="pm-form-select"
                  value={orderData.paymentMethod}
                  onChange={(e) => setOrderData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label required">Phương thức vận chuyển</label>
                <select
                  className="pm-form-select"
                  value={orderData.shippingMethod}
                  onChange={(e) => setOrderData((prev) => ({ ...prev, shippingMethod: e.target.value }))}
                >
                  {shippingMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label} {method.fee > 0 && `(+₫${method.fee.toLocaleString()})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pm-form-row">
              <div className="pm-form-group">
                <label className="pm-form-label">Giảm giá</label>
                <div className="pm-discount-input">
                  <input
                    type="number"
                    className="pm-form-input"
                    value={orderData.discount}
                    onChange={(e) => setOrderData((prev) => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <select
                    className="pm-form-select"
                    value={orderData.discountType}
                    onChange={(e) => setOrderData((prev) => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="amount">₫</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label">Ghi chú</label>
                <textarea
                  className="pm-form-textarea"
                  value={orderData.notes}
                  onChange={(e) => setOrderData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú đặc biệt cho đơn hàng"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {orderData.items.length > 0 && (
            <div className="pm-form-section">
              <h2>
                <Calculator size={20} />
                Tổng kết đơn hàng
              </h2>

              <div className="pm-order-summary">
                <div className="pm-summary-row">
                  <span>Tạm tính:</span>
                  <span>₫{calculateSubtotal().toLocaleString()}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="pm-summary-row pm-discount">
                    <span>Giảm giá:</span>
                    <span>-₫{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}
                <div className="pm-summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>₫{calculateShipping().toLocaleString()}</span>
                </div>
                <div className="pm-summary-row">
                  <span>Thuế (10%):</span>
                  <span>₫{calculateTax().toLocaleString()}</span>
                </div>
                <div className="pm-summary-row pm-total">
                  <span>Tổng cộng:</span>
                  <span>₫{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default CreateOrderPage