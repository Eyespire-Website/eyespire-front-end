"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, X, Search, User, Package, CreditCard, Save, Eye, Calculator, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import orderService from "../../../services/orderService";
import productService from "../../../services/productService";
import userService from "../../../services/userService";

const CreateOrderPage = ({ onBack, onOrderCreated }) => {
  const [orderData, setOrderData] = useState({
    patient: { id: null, name: "", email: "", phone: "" },
    items: [],
    paymentMethod: "CASH",
  });
  const [emailInput, setEmailInput] = useState("");
  const [emailSearchResults, setEmailSearchResults] = useState([]);
  const [showEmailResults, setShowEmailResults] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [showProductList, setShowProductList] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods = [
    { value: "CASH", label: "Tiền mặt" },
    { value: "PAYOS", label: "PayOS (Thanh toán online)" },
  ];

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

  // Handle image loading errors
  const handleImageError = (e) => {
    console.warn(`Failed to load image: ${e.target.src}`);
    e.target.src = fallbackImage;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productData = await productService.getAllProducts();
        setProducts(productData || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Không thể tải danh sách sản phẩm.", {
          toastId: "fetch-products-error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (!event.target.closest(".pm-email-search-container")) {
        setShowEmailResults(false);
      }
      if (!event.target.closest(".pm-product-search-container")) {
        setShowProductList(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput.length > 2 && emailRegex.test(emailInput)) {
        try {
          const response = await userService.searchUsersAdmin(emailInput, 0, 10);
          const users = Array.isArray(response.users) ? response.users : [];
          const exactMatches = users.filter(user => user.email.toLowerCase() === emailInput.toLowerCase());
          setEmailSearchResults(exactMatches);
          setShowEmailResults(true);
          setEmailNotFound(exactMatches.length === 0);
          setShowNewUserForm(false);
        } catch (error) {
          console.error("Error searching users:", error);
          setEmailSearchResults([]);
          setShowEmailResults(false);
          setEmailNotFound(true);
          toast.error("Không thể tìm kiếm khách hàng.", {
            toastId: "search-users-error",
          });
        }
      } else {
        setEmailSearchResults([]);
        setShowEmailResults(false);
        setEmailNotFound(emailInput.length > 2);
        setShowNewUserForm(false);
      }
    };
    searchUsers();
  }, [emailInput]);

  const selectUser = (user) => {
    setOrderData((prev) => ({
      ...prev,
      patient: { id: user.id, name: user.name, email: user.email, phone: user.phone || "" },
    }));
    setEmailInput(user.email);
    setShowEmailResults(false);
    setEmailNotFound(false);
    setShowNewUserForm(false);
    setErrors((prev) => ({ ...prev, "patient.email": "", "patient.name": "", "patient.phone": "" }));
  };

  const resetPatient = () => {
    setOrderData((prev) => ({
      ...prev,
      patient: { id: null, name: "", email: "", phone: "" },
    }));
    setEmailInput("");
    setShowEmailResults(false);
    setEmailNotFound(false);
    setShowNewUserForm(false);
    setErrors((prev) => ({ ...prev, "patient.email": "", "patient.name": "", "patient.phone": "" }));
  };

  const handleEmailInput = (value) => {
    setEmailInput(value);
    setOrderData((prev) => ({
      ...prev,
      patient: { id: null, name: "", email: value, phone: "" },
    }));
    setShowNewUserForm(false);
  };

  const handleCreateNewUser = () => {
    setShowNewUserForm(true);
    setEmailNotFound(false);
    setErrors((prev) => ({ ...prev, "patient.email": "", "patient.name": "", "patient.phone": "" }));
  };

  const handlePatientChange = (field, value) => {
    setOrderData((prev) => ({
      ...prev,
      patient: { ...prev.patient, [field]: value },
    }));
    if (errors[`patient.${field}`]) {
      setErrors((prev) => ({ ...prev, [`patient.${field}`]: "" }));
    }
  };

  const validateUserForm = () => {
    const newErrors = {};
    if (!orderData.patient.email.trim()) newErrors["patient.email"] = "Email là bắt buộc";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (orderData.patient.email && !emailRegex.test(orderData.patient.email)) {
      newErrors["patient.email"] = "Email không hợp lệ";
    }
    if (!orderData.patient.name.trim()) newErrors["patient.name"] = "Tên khách hàng là bắt buộc";
    if (!orderData.patient.phone.trim()) newErrors["patient.phone"] = "Số điện thoại là bắt buộc";
    const phoneRegex = /^[0-9]{10,11}$/;
    if (orderData.patient.phone && !phoneRegex.test(orderData.patient.phone.replace(/\s/g, ""))) {
      newErrors["patient.phone"] = "Số điện thoại không hợp lệ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUserProfile = async () => {
    if (!validateUserForm()) return;
    setIsCreatingUser(true);
    try {
      const userData = {
        name: orderData.patient.name,
        email: orderData.patient.email,
        phone: orderData.patient.phone,
        role: "PATIENT",
        status: "active",
      };
      const newUser = await userService.createPatient(userData);
      if (!newUser.id) throw new Error("Không nhận được ID từ user mới");
      setOrderData((prev) => ({
        ...prev,
        patient: { ...prev.patient, id: newUser.id },
      }));
      setShowNewUserForm(false);
      setErrors((prev) => ({ ...prev, general: "", "patient.email": "", "patient.name": "", "patient.phone": "" }));
      toast.success("Hồ sơ khách hàng đã được tạo thành công!", {
        toastId: "create-user-success",
      });
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error(error.response?.data?.message || error.message || "Không thể tạo hồ sơ khách hàng.", {
        toastId: "create-user-error",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const addProduct = (product) => {
    if (product.stockQuantity === 0) {
      toast.error("Sản phẩm này đã hết hàng!", {
        toastId: `product-out-of-stock-${product.id}`,
      });
      return;
    }
    const existingItem = orderData.items.find((item) => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        toast.error("Không thể thêm vì vượt quá số lượng tồn kho!", {
          toastId: `product-exceed-stock-${product.id}`,
        });
        return;
      }
      setOrderData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
            item.productId === product.id
                ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                : item
        ),
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            total: product.price,
            image: getFullUrl(product.imageUrl), // Use getFullUrl
            maxQuantity: product.stockQuantity,
          },
        ],
      }));
    }
    setProductSearch("");
    setShowProductList(false);
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    const item = orderData.items.find((item) => item.productId === productId);
    if (newQuantity > item.maxQuantity) {
      toast.error("Số lượng vượt quá tồn kho!", {
        toastId: `quantity-exceed-${productId}`,
      });
      return;
    }
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
          item.productId === productId
              ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
              : item
      ),
    }));
  };

  const removeItem = (productId) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  };

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const validateOrderForm = () => {
    const newErrors = {};
    if (!orderData.patient.id) newErrors["patient.email"] = "Vui lòng chọn hoặc tạo hồ sơ khách hàng";
    if (orderData.items.length === 0) newErrors.items = "Phải có ít nhất một sản phẩm";
    if (!orderData.paymentMethod) newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
    if (!["CASH", "PAYOS"].includes(orderData.paymentMethod))
      newErrors.paymentMethod = "Phương thức thanh toán không hợp lệ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateOrderForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đơn hàng.", {
        toastId: "order-validation-error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!orderData.patient || !orderData.patient.id) {
        throw new Error("Không có ID khách hàng");
      }
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error("Không có sản phẩm trong đơn hàng");
      }
      if (!orderData.paymentMethod || typeof orderData.paymentMethod !== "string") {
        throw new Error("Không có phương thức thanh toán");
      }

      orderData.items.forEach((item) => {
        if (!item.productId || !item.quantity || !item.price) {
          throw new Error("Thông tin sản phẩm không hợp lệ");
        }
      });

      const formattedData = {
        userId: Number(orderData.patient.id),
        items: orderData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: orderData.paymentMethod,
        shippingAddress: null,
      };

      if (!formattedData.userId || typeof formattedData.userId !== "number") {
        throw new Error("userId không hợp lệ");
      }
      if (!formattedData.items || !Array.isArray(formattedData.items) || formattedData.items.length === 0) {
        throw new Error("Danh sách sản phẩm không hợp lệ");
      }
      if (!formattedData.paymentMethod || !["CASH", "PAYOS"].includes(formattedData.paymentMethod)) {
        throw new Error("Phương thức thanh toán không hợp lệ");
      }

      console.log("Sending in-store order data:", formattedData);

      const newOrder = await orderService.createInStoreOrder(formattedData);
      console.log("In-store order created successfully:", newOrder);

      if (orderData.paymentMethod === "PAYOS") {
        const paymentData = {
          orderId: newOrder.id,
          userId: Number(orderData.patient.id),
          amount: Number(calculateTotal()),
          description: `Thanh toán đơn hàng #${newOrder.id}`,
          returnUrl: `${window.location.origin}/payment/payos-return`,
        };
        const paymentResponse = await orderService.createPayOSPayment(paymentData);
        if (paymentResponse && paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
          return; // Prevent further execution
        } else {
          throw new Error("Không thể tạo URL thanh toán PayOS");
        }
      }

      toast.success(`Đơn hàng #${newOrder.id.toString().padStart(3, "0")} đã được tạo thành công!`, {
        toastId: `order-created-${newOrder.id}`,
      });
      onOrderCreated?.(newOrder);
      onBack();
    } catch (error) {
      console.error("Error creating in-store order:", error);
      toast.error(error.response?.data?.message || error.message || "Lỗi khi tạo đơn hàng tại quầy. Vui lòng thử lại.", {
        toastId: "order-error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
      (product) =>
          product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.id.toString().includes(productSearch)
  );

  return (
      <div className="pm-create-order-container">
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="pm-page-header">
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <h1>Tạo đơn hàng tại quầy</h1>
          <div className="pm-header-actions">
            <button
                className="btn btn-secondary"
                onClick={() => setPreviewMode(true)}
                disabled={isSubmitting || orderData.items.length === 0 || !orderData.patient.id}
            >
              <Eye size={16} /> Xem trước
            </button>
            <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting || orderData.items.length === 0 || !orderData.patient.id}
            >
              <Save size={16} /> {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
            </button>
          </div>
        </div>

        {errors.general && <div className="pm-error-message">{errors.general}</div>}
        {isLoading && <div className="pm-loading">Đang tải dữ liệu...</div>}

        {previewMode ? (
            <div className="pm-order-preview">
              <div className="pm-preview-card">
                <h3>
                  <User size={18} /> Thông tin khách hàng
                </h3>
                <div className="pm-customer-preview">
                  <p><strong>Tên:</strong> {orderData.patient.name}</p>
                  <p><strong>Email:</strong> {orderData.patient.email}</p>
                  <p><strong>Điện thoại:</strong> {orderData.patient.phone}</p>
                </div>
                <h3>
                  <Package size={18} /> Sản phẩm đặt hàng
                </h3>
                <div className="pm-items-preview">
                  {orderData.items.map((item) => (
                      <div key={item.productId} className="pm-item-preview">
                        <img
                            src={getFullUrl(item.image)}
                            alt={item.name}
                            className="product-img"
                            onError={handleImageError}
                        />
                        <div className="pm-item-details">
                          <h4>{item.name}</h4>
                          <p>Số lượng: {item.quantity}</p>
                          <p>Đơn giá: ₫{item.price.toLocaleString()}</p>
                          <p className="pm-item-total">Thành tiền: ₫{item.total.toLocaleString()}</p>
                        </div>
                      </div>
                  ))}
                </div>
                <h3>
                  <CreditCard size={18} /> Thông tin thanh toán
                </h3>
                <div className="pm-payment-preview">
                  <p>
                    <strong>Phương thức thanh toán:</strong>{" "}
                    {paymentMethods.find((m) => m.value === orderData.paymentMethod)?.label}
                  </p>
                </div>
                <h3>
                  <Calculator size={18} /> Tổng kết đơn hàng
                </h3>
                <div className="pm-order-summary">
                  <div className="pm-summary-row pm-total">
                    <span>Tổng cộng:</span>
                    <span>₫{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setPreviewMode(false)}>
                  <ArrowLeft size={16} /> Quay lại chỉnh sửa
                </button>
              </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="pm-create-order-form">
              <div className="pm-form-grid">
                <div className="pm-form-section">
                  <h2>
                    <User size={20} /> Thông tin khách hàng
                  </h2>
                  <div className="pm-email-search-container">
                    <label className="pm-form-label required">Email khách hàng</label>
                    <div className="pm-search-input-container">
                      <input
                          type="email"
                          className={`pm-form-input ${errors["patient.email"] ? "pm-error" : ""}`}
                          value={emailInput}
                          onChange={(e) => handleEmailInput(e.target.value)}
                          placeholder="Nhập email khách hàng"
                          onFocus={() => setShowEmailResults(true)}
                      />
                      <Search size={16} className="pm-search-icon" />
                      {orderData.patient.id && (
                          <button type="button" className="pm-clear-button" onClick={resetPatient}>
                            <X size={16} />
                          </button>
                      )}
                    </div>
                    {errors["patient.email"] && <span className="pm-error-message">{errors["patient.email"]}</span>}
                    {showEmailResults && emailSearchResults.length > 0 && (
                        <div className="pm-dropdown-list">
                          {emailSearchResults.map((user) => (
                              <div key={user.id} className="pm-dropdown-item" onClick={() => selectUser(user)}>
                                <div className="pm-customer-item">
                                  <h4>{user.name}</h4>
                                  <p>
                                    {user.email} {user.phone ? `• ${user.phone}` : ""}
                                  </p>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                    {emailNotFound && emailInput.length > 2 && (
                        <div className="pm-error-message">
                          Thông tin khách hàng không tồn tại.{" "}
                          <button
                              type="button"
                              className="btn btn-primary pm-inline-button"
                              onClick={handleCreateNewUser}
                          >
                            <Plus size={16} /> Tạo thông tin khách hàng
                          </button>
                        </div>
                    )}
                  </div>
                  {showNewUserForm && (
                      <div className="pm-form-row">
                        <div className="pm-form-group">
                          <label className="pm-form-label required">Tên khách hàng</label>
                          <input
                              type="text"
                              className={`pm-form-input ${errors["patient.name"] ? "pm-error" : ""}`}
                              value={orderData.patient.name}
                              onChange={(e) => handlePatientChange("name", e.target.value)}
                              placeholder="Nhập tên khách hàng"
                          />
                          {errors["patient.name"] && <span className="pm-error-message">{errors["patient.name"]}</span>}
                        </div>
                        <div className="pm-form-group">
                          <label className="pm-form-label required">Số điện thoại</label>
                          <input
                              type="tel"
                              className={`pm-form-input ${errors["patient.phone"] ? "pm-error" : ""}`}
                              value={orderData.patient.phone}
                              onChange={(e) => handlePatientChange("phone", e.target.value)}
                              placeholder="Nhập số điện thoại"
                          />
                          {errors["patient.phone"] && <span className="pm-error-message">{errors["patient.phone"]}</span>}
                        </div>
                        <div className="pm-form-actions pm-inline-actions">
                          <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleCreateUserProfile}
                              disabled={isCreatingUser}
                          >
                            <Save size={16} /> {isCreatingUser ? "Đang tạo..." : "Tạo hồ sơ"}
                          </button>
                          <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setShowNewUserForm(false);
                                setOrderData((prev) => ({
                                  ...prev,
                                  patient: { ...prev.patient, name: "", phone: "" },
                                }));
                                setErrors((prev) => ({ ...prev, "patient.name": "", "patient.phone": "" }));
                              }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                  )}
                  {orderData.patient.id && (orderData.patient.name || orderData.patient.phone) && (
                      <div className="pm-form-row">
                        {orderData.patient.name && (
                            <div className="pm-form-group">
                              <label className="pm-form-label">Tên khách hàng</label>
                              <input type="text" className="pm-form-input" value={orderData.patient.name} readOnly />
                            </div>
                        )}
                        {orderData.patient.phone && (
                            <div className="pm-form-group">
                              <label className="pm-form-label">Số điện thoại</label>
                              <input type="tel" className="pm-form-input" value={orderData.patient.phone} readOnly />
                            </div>
                        )}
                      </div>
                  )}
                </div>
                <div className="pm-form-section">
                  <h2>
                    <Package size={20} /> Sản phẩm
                  </h2>
                  <div className="pm-product-search-container">
                    <label className="pm-form-label">Thêm sản phẩm</label>
                    <div className="pm-search-input-container">
                      <input
                          type="text"
                          className="pm-form-input"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductList(true);
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
                                  className={`pm-dropdown-item ${product.stockQuantity === 0 ? "pm-disabled" : ""}`}
                                  onClick={() => product.stockQuantity > 0 && addProduct(product)}
                              >
                                <div className="pm-product-item">
                                  <img
                                      src={getFullUrl(product.imageUrl)}
                                      alt={product.name}
                                      className="product-img"
                                      onError={handleImageError}
                                  />
                                  <div className="pm-product-details">
                                    <h4>{product.name}</h4>
                                    <p>₫{product.price.toLocaleString()} • Còn {product.stockQuantity}</p>
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
                            <div key={item.productId} className="pm-order-item">
                              <img
                                  src={getFullUrl(item.image)}
                                  alt={item.name}
                                  className="product-img"
                                  onError={handleImageError}
                              />
                              <div className="pm-item-info">
                                <h4>{item.name}</h4>
                                <p>₫{item.price.toLocaleString()}</p>
                              </div>
                              <div className="pm-quantity-controls">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <span className="pm-quantity">{item.quantity}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              <div className="pm-item-total">₫{item.total.toLocaleString()}</div>
                              <button
                                  type="button"
                                  className="btn btn-icon"
                                  onClick={() => removeItem(item.productId)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
                <div className="pm-form-section">
                  <h2>
                    <CreditCard size={20} /> Thanh toán
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
                      {errors.paymentMethod && <span className="pm-error-message">{errors.paymentMethod}</span>}
                    </div>
                  </div>
                </div>
                {orderData.items.length > 0 && (
                    <div className="pm-form-section">
                      <h2>
                        <Calculator size={20} /> Tổng kết đơn hàng
                      </h2>
                      <div className="pm-order-summary">
                        <div className="pm-summary-row pm-total">
                          <span>Tổng cộng:</span>
                          <span>₫{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </form>
        )}
      </div>
  );
};

export default CreateOrderPage;