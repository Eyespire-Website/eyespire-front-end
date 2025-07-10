"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, X, Search, User, Package, Save, Eye, Calculator, Trash2 } from "lucide-react";
import orderService from "../../../services/orderService";
import "./STM-Style/editOrder.css";

const EditOrderPage = ({ orderId, orderData: initialOrderData, onBack, onOrderUpdated, onOrderDeleted }) => {
  const [orderData, setOrderData] = useState({
    id: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
      userId: null,
    },
    items: [],
    notes: "",
    discount: 0,
    discountType: "amount",
    status: "PENDING",
    createdAt: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showQuickStatusUpdate, setShowQuickStatusUpdate] = useState(false);
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);

  const customerSearchRef = useRef(null);
  const productSearchRef = useRef(null);

  const orderStatuses = [
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "SHIPPED", label: "Đã gửi hàng" },
    { value: "COMPLETED", label: "Đã hoàn thành" },
    { value: "CANCELED", label: "Đã hủy" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrors({});

      try {
        const fetchedCustomers = await orderService.getPatientForOrder(1);
        setCustomers([fetchedCustomers]);

        setProducts([
          { id: "SP001", name: "Thức ăn cá Koi cao cấp", price: 250000, quantity: 150, image: "/placeholder.svg?height=40&width=40" },
          { id: "SP002", name: "Máy lọc nước hồ cá", price: 1500000, quantity: 25, image: "/placeholder.svg?height=40&width=40" },
        ]);

        if (orderId && initialOrderData) {
          const convertedData = {
            id: initialOrderData.id || "",
            customer: {
              name: initialOrderData.customerName || "",
              email: initialOrderData.customerEmail || "",
              phone: initialOrderData.customerPhone || "",
              address: initialOrderData.customerAddress || "",
              userId: initialOrderData.userId || 1,
            },
            items: (initialOrderData.items || []).map((item) => ({
              ...item,
              maxQuantity: products.find((p) => p.id === item.id)?.quantity || item.quantity + 10,
            })),
            notes: initialOrderData.notes || "",
            discount: initialOrderData.discount || 0,
            discountType: initialOrderData.discountType || "amount",
            status: initialOrderData.status?.toUpperCase() || "PENDING",
            createdAt: initialOrderData.createdAt || "",
          };
          setOrderData(convertedData);
          setOriginalData(convertedData);
          setCustomerSearch(convertedData.customer.name);
        } else {
          throw new Error("Invalid order ID or data");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        alert("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
        onBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderId, initialOrderData, onBack]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
        setShowCustomerList(false);
      }
      if (productSearchRef.current && !productSearchRef.current.contains(event.target)) {
        setShowProductList(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (originalData) {
      setHasChanges(JSON.stringify(orderData) !== JSON.stringify(originalData));
    }
  }, [orderData, originalData]);

  const filteredCustomers = customers.filter(
      (customer) =>
          customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.phone?.includes(customerSearch) ||
          customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter(
      (product) =>
          product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.id?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectCustomer = (customer) => {
    setOrderData((prev) => ({
      ...prev,
      customer: {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        userId: customer.id || 1,
      },
    }));
    setCustomerSearch(customer.name || "");
    setShowCustomerList(false);
    setErrors((prev) => ({
      ...prev,
      "customer.name": "",
      "customer.email": "",
      "customer.phone": "",
      "customer.address": "",
    }));
  };

  const addProduct = (product) => {
    if (product.quantity === 0) {
      alert("Sản phẩm này đã hết hàng!");
      return;
    }
    const existingItem = orderData.items.find((item) => item.id === product.id);
    if (existingItem && existingItem.quantity >= product.quantity) {
      alert("Không thể thêm vì vượt quá số lượng tồn kho!");
      return;
    }
    setOrderData((prev) => ({
      ...prev,
      items: existingItem
          ? prev.items.map((item) =>
              item.id === product.id
                  ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                  : item
          )
          : [
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
    }));
    setProductSearch("");
    setShowProductList(false);
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    const item = orderData.items.find((item) => item.id === itemId);
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    if (newQuantity > item.maxQuantity) {
      alert("Số lượng vượt quá tồn kho!");
      return;
    }
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item
      ),
    }));
  };

  const removeItem = (itemId) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleCustomerChange = (field, value) => {
    setOrderData((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [`customer.${field}`]: "" }));
  };

  const calculateSubtotal = () => orderData.items.reduce((sum, item) => sum + item.total, 0);

  const calculateDiscount = () =>
      orderData.discountType === "percentage"
          ? (calculateSubtotal() * orderData.discount) / 100
          : orderData.discount;

  const calculateTax = () => Math.round((calculateSubtotal() - calculateDiscount()) * 0.1);

  const calculateTotal = () => calculateSubtotal() - calculateDiscount() + calculateTax();

  const validateForm = () => {
    const newErrors = {};
    if (!orderData.customer.name?.trim()) newErrors["customer.name"] = "Tên khách hàng là bắt buộc";
    if (!orderData.customer.email?.trim()) newErrors["customer.email"] = "Email là bắt buộc";
    if (!orderData.customer.phone?.trim()) newErrors["customer.phone"] = "Số điện thoại là bắt buộc";
    if (!orderData.customer.address?.trim()) newErrors["customer.address"] = "Địa chỉ là bắt buộc";
    if (orderData.items.length === 0) newErrors.items = "Phải có ít nhất một sản phẩm";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (orderData.customer.email && !emailRegex.test(orderData.customer.email)) {
      newErrors["customer.email"] = "Email không hợp lệ";
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (orderData.customer.phone && !phoneRegex.test(orderData.customer.phone.replace(/\s/g, ""))) {
      newErrors["customer.phone"] = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: orderData.customer.userId || 1,
        shippingAddress: orderData.customer.address,
        items: orderData.items.map((item) => ({
          productId: parseInt(item.id.replace("SP", "")),
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.total,
        })),
        totalAmount: calculateTotal(),
        status: orderData.status,
        notes: orderData.notes,
        discount: calculateDiscount(),
      };

      await orderService.updateOrder(orderId, orderPayload);
      const updatedOrder = {
        ...orderData,
        customerName: orderData.customer.name,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        customerAddress: orderData.customer.address,
        userId: orderData.customer.userId,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        discount: calculateDiscount(),
        updatedAt: new Date().toISOString(),
        statusText: orderStatuses.find((s) => s.value === orderData.status)?.label || orderData.status,
      };

      onOrderUpdated(updatedOrder);
      setOriginalData(orderData);
      setHasChanges(false);
      alert("Đơn hàng đã được cập nhật thành công!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Có lỗi xảy ra khi cập nhật đơn hàng: " + (error.message || "Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    setIsSubmitting(true);
    try {
      await orderService.deleteOrder(orderId);
      onOrderDeleted(orderId);
      alert("Đơn hàng đã được xóa thành công!");
      onBack();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Có lỗi xảy ra khi xóa đơn hàng: " + (error.message || "Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    if (newStatus === orderData.status) return;
    setIsQuickUpdating(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const updatedOrder = {
        ...orderData,
        status: newStatus,
        statusText: orderStatuses.find((s) => s.value === newStatus)?.label || newStatus,
        updatedAt: new Date().toISOString(),
      };
      setOrderData(updatedOrder);
      onOrderUpdated(updatedOrder);
      alert(`Trạng thái đơn hàng đã được cập nhật thành "${orderStatuses.find((s) => s.value === newStatus)?.label || newStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái: " + (error.message || "Vui lòng thử lại."));
    } finally {
      setIsQuickUpdating(false);
      setShowQuickStatusUpdate(false);
    }
  };

  const resetForm = () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy tất cả thay đổi?")) return;
    setOrderData(originalData);
    setCustomerSearch(originalData.customer.name);
    setErrors({});
    setHasChanges(false);
  };

  if (isLoading) {
    return (
        <div className="eop-edit-order-container eop-max-w-7xl eop-mx-auto eop-p-6">
          <div className="eop-loading-state eop-flex eop-flex-col eop-items-center eop-justify-center eop-h-64">
            <div className="eop-animate-spin eop-rounded-full eop-h-12 eop-w-12 eop-border-t-2 eop-border-b-2 eop-border-blue-500"></div>
            <p className="eop-mt-4 eop-text-gray-600">Đang tải thông tin đơn hàng...</p>
            <p className="eop-text-sm eop-text-gray-500">Mã đơn hàng: {orderId}</p>
          </div>
        </div>
    );
  }

  if (!orderData.id && !isLoading) {
    return (
        <div className="eop-edit-order-container eop-max-w-7xl eop-mx-auto eop-p-6">
          <div className="eop-error-state eop-flex eop-flex-col eop-items-center eop-justify-center eop-h-64 eop-bg-red-50 eop-rounded-lg">
            <div className="eop-text-4xl eop-text-red-500">⚠️</div>
            <h2 className="eop-text-xl eop-font-semibold eop-text-red-600 eop-mt-4">Không thể tải đơn hàng</h2>
            <p className="eop-text-gray-600 eop-mt-2">Đơn hàng với mã "{orderId}" không tồn tại hoặc đã bị xóa.</p>
            <button
                className="eop-mt-4 eop-btn eop-bg-blue-500 eop-text-white eop-hover:bg-blue-600 eop-flex eop-items-center eop-gap-2"
                onClick={onBack}
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="eop-edit-order-container eop-max-w-7xl eop-mx-auto eop-p-6">
        <div className="eop-page-header eop-flex eop-items-center eop-justify-between eop-mb-6">
          <button
              className="eop-btn eop-bg-gray-500 eop-text-white eop-hover:bg-gray-600 eop-flex eop-items-center eop-gap-2"
              onClick={onBack}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <h1 className="eop-text-2xl eop-font-bold eop-text-gray-800">Chỉnh sửa đơn hàng #{orderData.id}</h1>
          <div className="eop-header-actions eop-flex eop-gap-3">
            {hasChanges && (
                <button
                    className="eop-btn eop-bg-yellow-500 eop-text-white eop-hover:bg-yellow-600 eop-flex eop-items-center eop-gap-2"
                    onClick={resetForm}
                >
                  Hủy thay đổi
                </button>
            )}
            <button
                className="eop-btn eop-bg-blue-500 eop-text-white eop-hover:bg-blue-600 eop-flex eop-items-center eop-gap-2"
                onClick={() => setPreviewMode(true)}
            >
              <Eye size={16} />
              Xem trước
            </button>
            <button
                className="eop-btn eop-bg-red-500 eop-text-white eop-hover:bg-red-600 eop-flex eop-items-center eop-gap-2"
                onClick={handleDelete}
                disabled={isSubmitting}
            >
              <Trash2 size={16} />
              Xóa
            </button>
            <button
                className="eop-btn eop-bg-green-500 eop-text-white eop-hover:bg-green-600 eop-flex eop-items-center eop-gap-2"
                onClick={handleSubmit}
                disabled={isSubmitting || !hasChanges}
            >
              <Save size={16} />
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {hasChanges && (
            <div className="eop-changes-indicator eop-bg-yellow-100 eop-text-yellow-800 eop-p-3 eop-rounded-lg eop-mb-4">
              ⚠️ Bạn có thay đổi chưa được lưu
            </div>
        )}

        <form onSubmit={handleSubmit} className="eop-edit-order-form eop-grid eop-grid-cols-1 eop-lg:grid-cols-3 eop-gap-6">
          <div className="eop-lg:col-span-2 eop-space-y-6">
            <div className="eop-form-section eop-bg-white eop-p-6 eop-rounded-lg eop-shadow-md">
              <h2 className="eop-text-lg eop-font-semibold eop-mb-4 eop-flex eop-items-center eop-gap-2">
                <Calculator size={20} />
                Trạng thái đơn hàng
              </h2>
              <div className="eop-flex eop-justify-between eop-items-center eop-mb-4">
                <select
                    className="eop-form-select eop-w-1/2 eop-p-2 eop-border eop-rounded-lg"
                    value={orderData.status}
                    onChange={(e) => setOrderData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                  ))}
                </select>
                <button
                    type="button"
                    className="eop-btn eop-bg-blue-500 eop-text-white eop-hover:bg-blue-600"
                    onClick={() => setShowQuickStatusUpdate(!showQuickStatusUpdate)}
                    disabled={isQuickUpdating}
                >
                  Cập nhật nhanh
                </button>
              </div>
              {showQuickStatusUpdate && (
                  <div className="eop-quick-status-update eop-grid eop-grid-cols-3 eop-gap-2">
                    {orderStatuses.map((status) => (
                        <button
                            key={status.value}
                            type="button"
                            className={`eop-btn ${status.value === orderData.status ? "eop-bg-gray-300" : "eop-bg-blue-100 eop-hover:bg-blue-200"} eop-text-gray-800`}
                            onClick={() => handleQuickStatusUpdate(status.value)}
                            disabled={isQuickUpdating || status.value === orderData.status}
                        >
                          {isQuickUpdating ? "..." : status.label}
                        </button>
                    ))}
                  </div>
              )}
            </div>

            <div className="eop-form-section eop-bg-white eop-p-6 eop-rounded-lg eop-shadow-md">
              <h2 className="eop-text-lg eop-font-semibold eop-mb-4 eop-flex eop-items-center eop-gap-2">
                <User size={20} />
                Thông tin khách hàng
              </h2>
              <div className="eop-relative eop-mb-4" ref={customerSearchRef}>
                <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700">Tìm khách hàng</label>
                <div className="eop-relative">
                  <input
                      type="text"
                      className="eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerList(true);
                      }}
                      placeholder="Tìm theo tên, email hoặc số điện thoại"
                      onFocus={() => setShowCustomerList(true)}
                  />
                  <Search size={16} className="eop-absolute eop-right-3 eop-top-1/2 eop-transform eop--translate-y-1/2 eop-text-gray-400" />
                </div>
                {showCustomerList && filteredCustomers.length > 0 && (
                    <div className="eop-absolute eop-z-10 eop-w-full eop-bg-white eop-border eop-rounded-lg eop-shadow-lg eop-mt-1 eop-max-h-60 eop-overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                          <div
                              key={customer.id}
                              className="eop-p-3 eop-hover:bg-blue-50 eop-cursor-pointer"
                              onClick={() => selectCustomer(customer)}
                          >
                            <h4 className="eop-font-medium">{customer.name}</h4>
                            <p className="eop-text-sm eop-text-gray-600">{customer.phone} • {customer.email}</p>
                          </div>
                      ))}
                    </div>
                )}
              </div>
              <div className="eop-grid eop-grid-cols-2 eop-gap-4">
                <div className="eop-form-group">
                  <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700 eop-required">Tên khách hàng</label>
                  <input
                      type="text"
                      className={`eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg ${errors["customer.name"] ? "eop-border-red-500" : ""}`}
                      value={orderData.customer.name}
                      onChange={(e) => handleCustomerChange("name", e.target.value)}
                      placeholder="Nhập tên khách hàng"
                  />
                  {errors["customer.name"] && <span className="eop-text-red-500 eop-text-sm">{errors["customer.name"]}</span>}
                </div>
                <div className="eop-form-group">
                  <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700 eop-required">Email</label>
                  <input
                      type="email"
                      className={`eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg ${errors["customer.email"] ? "eop-border-red-500" : ""}`}
                      value={orderData.customer.email}
                      onChange={(e) => handleCustomerChange("email", e.target.value)}
                      placeholder="Nhập email"
                  />
                  {errors["customer.email"] && <span className="eop-text-red-500 eop-text-sm">{errors["customer.email"]}</span>}
                </div>
                <div className="eop-form-group">
                  <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700 eop-required">Số điện thoại</label>
                  <input
                      type="tel"
                      className={`eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg ${errors["customer.phone"] ? "eop-border-red-500" : ""}`}
                      value={orderData.customer.phone}
                      onChange={(e) => handleCustomerChange("phone", e.target.value)}
                      placeholder="Nhập số điện thoại"
                  />
                  {errors["customer.phone"] && <span className="eop-text-red-500 eop-text-sm">{errors["customer.phone"]}</span>}
                </div>
                <div className="eop-form-group">
                  <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700 eop-required">Địa chỉ</label>
                  <input
                      type="text"
                      className={`eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg ${errors["customer.address"] ? "eop-border-red-500" : ""}`}
                      value={orderData.customer.address}
                      onChange={(e) => handleCustomerChange("address", e.target.value)}
                      placeholder="Nhập địa chỉ"
                  />
                  {errors["customer.address"] && <span className="eop-text-red-500 eop-text-sm">{errors["customer.address"]}</span>}
                </div>
              </div>
            </div>

            <div className="eop-form-section eop-bg-white eop-p-6 eop-rounded-lg eop-shadow-md">
              <h2 className="eop-text-lg eop-font-semibold eop-mb-4 eop-flex eop-items-center eop-gap-2">
                <Package size={20} />
                Sản phẩm
              </h2>
              <div className="eop-relative eop-mb-4" ref={productSearchRef}>
                <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700">Thêm sản phẩm</label>
                <div className="eop-relative">
                  <input
                      type="text"
                      className="eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductList(true);
                      }}
                      placeholder="Tìm sản phẩm theo tên hoặc mã"
                      onFocus={() => setShowProductList(true)}
                  />
                  <Search size={16} className="eop-absolute eop-right-3 eop-top-1/2 eop-transform eop--translate-y-1/2 eop-text-gray-400" />
                </div>
                {showProductList && filteredProducts.length > 0 && (
                    <div className="eop-absolute eop-z-10 eop-w-full eop-bg-white eop-border eop-rounded-lg eop-shadow-lg eop-mt-1 eop-max-h-60 eop-overflow-y-auto">
                      {filteredProducts.map((product) => (
                          <div
                              key={product.id}
                              className={`eop-p-3 eop-hover:bg-blue-50 eop-cursor-pointer ${product.quantity === 0 ? "eop-opacity-50 eop-cursor-not-allowed" : ""}`}
                              onClick={() => product.quantity > 0 && addProduct(product)}
                          >
                            <div className="eop-flex eop-items-center eop-gap-3">
                              <img src={product.image} alt={product.name} className="eop-w-10 eop-h-10 eop-object-cover eop-rounded" />
                              <div>
                                <h4 className="eop-font-medium">{product.name}</h4>
                                <p className="eop-text-sm eop-text-gray-600">₫{product.price.toLocaleString()} • Còn {product.quantity}</p>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>
              {errors.items && <span className="eop-text-red-500 eop-text-sm">{errors.items}</span>}
              {orderData.items.length > 0 && (
                  <div className="eop-order-items eop-space-y-4">
                    <h3 className="eop-text-md eop-font-semibold">Sản phẩm đã chọn</h3>
                    {orderData.items.map((item) => (
                        <div key={item.id} className="eop-flex eop-items-center eop-gap-4 eop-p-3 eop-bg-gray-50 eop-rounded-lg">
                          <img src={item.image} alt={item.name} className="eop-w-12 eop-h-12 eop-object-cover eop-rounded" />
                          <div className="eop-flex-1">
                            <h4 className="eop-font-medium">{item.name}</h4>
                            <p className="eop-text-sm eop-text-gray-600">₫{item.price.toLocaleString()}</p>
                          </div>
                          <div className="eop-flex eop-items-center eop-gap-2">
                            <button
                                type="button"
                                className="eop-btn eop-bg-gray-200 eop-hover:bg-gray-300 eop-text-gray-800"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="eop-w-12 eop-text-center">{item.quantity}</span>
                            <button
                                type="button"
                                className="eop-btn eop-bg-gray-200 eop-hover:bg-gray-300 eop-text-gray-800"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <p className="eop-font-semibold">₫{item.total.toLocaleString()}</p>
                          <button
                              type="button"
                              className="eop-btn eop-bg-red-500 eop-text-white eop-hover:bg-red-600"
                              onClick={() => removeItem(item.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>

          <div className="eop-lg:col-span-1">
            <div className="eop-form-section eop-bg-white eop-p-6 eop-rounded-lg eop-shadow-md eop-sticky eop-top-6">
              <h2 className="eop-text-lg eop-font-semibold eop-mb-4">Tổng kết</h2>
              <div className="eop-space-y-4">
                <div className="eop-form-group">
                  <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700">Giảm giá</label>
                  <div className="eop-flex eop-gap-2">
                    <input
                        type="number"
                        className="eop-form-input eop-w-full eop-p-2 eop-border eop-rounded-lg"
                        value={orderData.discount}
                        onChange={(e) => setOrderData((prev) => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                    />
                    <select
                        className="eop-form-select eop-p-2 eop-border eop-rounded-lg"
                        value={orderData.discountType}
                        onChange={(e) => setOrderData((prev) => ({ ...prev, discountType: e.target.value }))}
                    >
                      <option value="amount">₫</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
                </div>
                <div className="eop-form-group">
                  <label className="eop-form-label eop-block eop-text-sm eop-font-medium eop-text-gray-700">Ghi chú</label>
                  <textarea
                      className="eop-form-textarea eop-w-full eop-p-2 eop-border eop-rounded-lg"
                      value={orderData.notes}
                      onChange={(e) => setOrderData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú đặc biệt cho đơn hàng"
                      rows={4}
                  />
                </div>
                {orderData.items.length > 0 && (
                    <div className="eop-order-summary eop-space-y-2">
                      <h3 className="eop-text-md eop-font-semibold">Tổng kết đơn hàng</h3>
                      <div className="eop-flex eop-justify-between"><span>Tạm tính:</span><span>₫{calculateSubtotal().toLocaleString()}</span></div>
                      {calculateDiscount() > 0 && (
                          <div className="eop-flex eop-justify-between eop-text-green-600"><span>Giảm giá:</span><span>-₫{calculateDiscount().toLocaleString()}</span></div>
                      )}
                      <div className="eop-flex eop-justify-between"><span>Thuế (10%):</span><span>₫{calculateTax().toLocaleString()}</span></div>
                      <div className="eop-flex eop-justify-between eop-font-bold eop-text-lg"><span>Tổng cộng:</span><span>₫{calculateTotal().toLocaleString()}</span></div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
  );
};

export default EditOrderPage;