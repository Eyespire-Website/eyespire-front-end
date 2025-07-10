"use client";

import { useState, useEffect, useCallback } from "react";
import StatCard from "../../../components/storeManagement/StatCard";
import CreateOrderPage from "./CreateOrderPage";
import AddProductPage from "./AddProductPage";
import OrderDetailModal from "../../../components/storeManagement/OrderDetailModal";
import "./STM-Style/STM-DashboardPage.css";
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  AlertTriangle,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import orderService from "../../../services/orderService";
import productService from "../../../services/productService";
import feedbackService from "../../../services/feedbackService";

const DashboardPage = ({ setActiveTab }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newOrders: 0,
    topSellingProducts: 0,
    productsInStock: 0,
    averageRating: 0,
    systemAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const fallbackImage = "https://placehold.co/40x40?text=Image";

  // Normalize image URL
  const getFullUrl = (url) => {
    if (!url || url.trim() === "") {
      return fallbackImage;
    }
    return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.warn(`Failed to load image: ${e.target.src}`);
    e.target.src = fallbackImage;
  };

  // Map backend status to frontend status text
  const getOrderStatusText = (status) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "Đã thanh toán";
      case "SHIPPED":
        return "Đã gửi hàng";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELED":
        return "Đã hủy";
      default:
        return "Đang xử lý";
    }
  };

  // Handle view order details
  const handleViewOrder = async (order) => {
    try {
      const cleanOrderId = order.id.replace(/^#/, "");
      const numericOrderId = parseInt(cleanOrderId, 10);
      if (isNaN(numericOrderId)) {
        throw new Error(`Invalid order ID: ${cleanOrderId}`);
      }

      // Fetch full order details from backend
      const orderData = await orderService.getOrderById(numericOrderId);
      const patient = await orderService.getPatientForOrder(orderData.userId);

      const fullOrderDetails = {
        id: `#${orderData.id.toString().padStart(3, "0")}`,
        customerName: patient.name || `Khách hàng ${orderData.userId || "N/A"}`,
        customerEmail: patient.email || `user${orderData.userId || "unknown"}@example.com`,
        customerPhone: patient.phone || "N/A",
        customerAddress: orderData.shippingAddress || "N/A",
        orderDate: orderData.orderDate
            ? new Date(orderData.orderDate).toLocaleDateString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })
            : "N/A",
        status: orderData.status || "PENDING",
        statusText: getOrderStatusText(orderData.status || "PENDING"),
        paymentMethod: orderData.payment?.transactionNo ? "Chuyển khoản" : "Tiền mặt",
        paymentStatus: orderData.payment?.status || "PENDING",
        shippingMethod: "Giao hàng tiêu chuẩn",
        items: (orderData.items || []).map((item) => ({
          id: item.id?.toString() || "0",
          name: item.productName || "Không xác định",
          image: item.image || "/placeholder.svg?height=60&width=60",
          quantity: item.quantity || 0,
          price: parseFloat(item.price || 0),
          total: parseFloat(item.subtotal || 0),
        })),
        subtotal: parseFloat(
            (orderData.items || []).reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
        ),
        shipping: 50000,
        tax: parseFloat(orderData.totalAmount || 0) * 0.1,
        total: parseFloat(orderData.totalAmount || 0),
        notes: orderData.notes || "N/A",
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: orderData.updatedAt || orderData.createdAt || new Date().toISOString(),
      };

      setSelectedOrder(fullOrderDetails);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching order details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      alert(`Lỗi khi tải chi tiết đơn hàng: ${err.message}`);
    }
  };

  // Handle order status update
  const handleStatusUpdate = (updatedOrder) => {
    setRecentOrders((prevOrders) =>
        prevOrders.map((order) =>
            order.id === updatedOrder.id
                ? {
                  ...order,
                  status: updatedOrder.status,
                  statusText: updatedOrder.statusText,
                }
                : order
        )
    );
    setIsModalOpen(false);
  };

  // Handle order creation
  const handleOrderCreated = async (orderData) => {
    try {
      const response = await orderService.createOrder({
        userId: orderData.userId || 1,
        shippingAddress: orderData.shippingAddress,
      });
      const patient = await orderService.getPatientForOrder(response.userId);
      const mappedOrder = {
        id: `#${response.id.toString().padStart(3, "0")}`,
        customer: patient.name || `Khách hàng ${response.userId || "N/A"}`,
        total: `₫${parseFloat(response.totalAmount || 0).toLocaleString("vi-VN")}`,
        status: response.status.toLowerCase() || "processing",
        statusText: getOrderStatusText(response.status || "PENDING"),
        time: response.createdAt
            ? new Date(response.createdAt).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Ho_Chi_Minh",
            })
            : "N/A",
        createdAt: response.createdAt,
      };
      setRecentOrders((prevOrders) => {
        const updatedOrders = [mappedOrder, ...prevOrders].slice(0, 10);
        return updatedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      });
      setStats((prevStats) => ({
        ...prevStats,
        newOrders: prevStats.newOrders + 1,
      }));
      setShowCreateOrder(false);
      alert(`Đơn hàng ${mappedOrder.id} đã được tạo thành công!`);
    } catch (err) {
      console.error("Error creating order:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      alert(`Lỗi khi tạo đơn hàng: ${err.message}`);
    }
  };

  // Handle product addition
  const handleAddProductSuccess = () => {
    fetchDashboardData();
    setShowAddProduct(false);
  };

  // Fetch data for the dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent orders
      const ordersData = await orderService.getAllOrders();
      const mappedOrders = await Promise.all(
          ordersData
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
              .filter((order) => order && order.id && order.status !== "PENDING")
              .slice(0, 10)
              .map(async (order) => {
                const patient = await orderService.getPatientForOrder(order.userId);
                return {
                  id: `#${order.id.toString().padStart(3, "0")}`,
                  customer: patient.name || `Khách hàng ${order.userId || "N/A"}`,
                  total: `₫${parseFloat(order.totalAmount || 0).toLocaleString("vi-VN")}`,
                  status: order.status.toLowerCase() || "processing",
                  statusText: getOrderStatusText(order.status || "PENDING"),
                  time: order.createdAt
                      ? new Date(order.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Ho_Chi_Minh",
                      })
                      : "N/A",
                  createdAt: order.createdAt,
                };
              })
      );

      // Fetch top products and ratings
      const productsData = await productService.getAllProducts();
      const mappedProducts = await Promise.all(
          productsData
              .filter((product) => product && product.id && product.sales > 0)
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 4)
              .map(async (product) => {
                const feedbacks = await feedbackService.getFeedbackByProductId(product.id);
                const averageRating = feedbacks.length
                    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                    : 0;
                return {
                  id: product.id.toString(),
                  name: product.name || "Không có tên",
                  sales: Number(product.sales) || 0,
                  revenue: `₫${(Number(product.price || 0) * Number(product.sales || 0)).toLocaleString("vi-VN")}`,
                  growth: `+${Math.round(Math.random() * 15)}%`,
                  image: getFullUrl(product.imageUrl),
                  rating: parseFloat(averageRating),
                };
              })
      );

      // Calculate stats
      const totalRevenue = ordersData
          .filter((order) => order.status === "COMPLETED")
          .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
      const newOrders = ordersData.filter((order) => {
        if (!order.createdAt) {
          console.warn(`Order ${order.id} missing createdAt`);
          return false;
        }
        try {
          return (
              new Date(order.createdAt).toLocaleDateString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              }) === new Date().toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
          );
        } catch (e) {
          console.warn(`Invalid createdAt for order ${order.id}:`, order.createdAt);
          return false;
        }
      }).length;
      const topSellingProducts = productsData.filter((product) => product.sales > 0).length;
      const productsInStock = productsData.length;
      const averageRating = productsData.length
          ? (
              (await Promise.all(
                  productsData.map(async (product) => {
                    const feedbacks = await feedbackService.getFeedbackByProductId(product.id);
                    return feedbacks.length
                        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
                        : 0;
                  })
              )).reduce((sum, rating) => sum + rating, 0) / productsData.length
          ).toFixed(1)
          : 0;
      const lowStockCount = productsData.filter(
          (product) => product.stockQuantity <= 5 && product.stockQuantity > 0
      ).length;
      const systemAlerts = lowStockCount;

      setTopProducts(mappedProducts);
      setRecentOrders(mappedOrders);
      setStats({
        totalRevenue,
        newOrders,
        topSellingProducts,
        productsInStock,
        averageRating,
        systemAlerts,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
          err.response?.status === 404
              ? "Không tìm thấy dữ liệu"
              : err.response?.status === 500
                  ? "Lỗi server, vui lòng thử lại sau"
                  : "Không thể tải dữ liệu dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
        <div className="inventory-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="inventory-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchDashboardData}>
            Thử lại
          </button>
        </div>
    );
  }

  if (showCreateOrder) {
    return (
        <CreateOrderPage
            onBack={() => setShowCreateOrder(false)}
            onOrderCreated={handleOrderCreated}
        />
    );
  }

  if (showAddProduct) {
    return (
        <AddProductPage
            onBack={() => setShowAddProduct(false)}
            onAddSuccess={handleAddProductSuccess}
        />
    );
  }

  return (
      <div>
        <div className="stm-stats-grid">
          <StatCard
              title="Tổng doanh thu"
              value={`₫${stats.totalRevenue.toLocaleString("vi-VN")}`}
              icon={<DollarSign size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Đơn hàng mới"
              value={stats.newOrders.toString()}
              change={`+${stats.newOrders} từ hôm nay`}
              icon={<ShoppingCart size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Sản phẩm bán chạy"
              value={stats.topSellingProducts.toString()}
              icon={<TrendingUp size={24} />}
              changeType="positive"
          />
        </div>

        <div className="stm-stats-grid">
          <StatCard
              title="Sản phẩm trong kho"
              value={stats.productsInStock.toLocaleString("vi-VN")}
              icon={<Package size={24} />}
              changeType={stats.systemAlerts > 0 ? "negative" : "positive"}
          />
          <StatCard
              title="Đánh giá trung bình"
              value={stats.averageRating}
              change="Từ tất cả sản phẩm"
              icon={<Star size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Cảnh báo hệ thống"
              value={stats.systemAlerts.toString()}
              change="Cần được nhập thêm sản phẩm"
              icon={<AlertTriangle size={24} />}
              changeType={stats.systemAlerts > 0 ? "negative" : "positive"}
          />
        </div>

        <div className="stm-dashboard-grid">
          <div className="stm-card stm-card--dashboard">
            <div className="stm-card-header">
              <h3 className="stm-card-title--dashboard">Sản phẩm bán chạy</h3>
            </div>
            <div className="stm-card-content--dashboard">
              <div className="stm-products-list">
                {topProducts.length > 0 ? (
                    topProducts.map((product) => (
                        <div key={product.id} className="stm-product-item">
                          <div className="stm-product-info">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="stm-product-image"
                                onError={handleImageError}
                            />
                            <div className="stm-product-details">
                              <h4 className="stm-product-name">{product.name}</h4>
                              <p className="stm-product-sales">{product.sales} đã bán</p>
                            </div>
                          </div>
                          <div className="stm-product-stats">
                            <div className="stm-product-revenue">{product.revenue}</div>
                            <div className="stm-product-growth stm-product-growth--positive">
                              {product.growth}
                            </div>
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="stm-no-results">
                      Chưa có sản phẩm bán chạy nào
                    </div>
                )}
              </div>
              <div className="stm-card-footer--dashboard">
                <button
                    className="stm-btn stm-btn--secondary"
                    onClick={() => setActiveTab && setActiveTab("inventory")}
                >
                  Xem tất cả sản phẩm
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="stm-card stm-card--dashboard">
            <div className="stm-card-header">
              <h3 className="stm-card-title--dashboard">Đơn hàng gần đây</h3>
            </div>
            <div className="stm-card-content--dashboard">
              <div className="stm-orders-list">
                {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                        <div key={order.id} className="stm-order-item">
                          <div className="stm-order-info">
                            <div className="stm-order-id">{order.id}</div>
                            <div className="stm-order-customer">{order.customer}</div>
                            <div className="stm-order-time">{order.time}</div>
                          </div>
                          <div className="stm-order-meta">
                            <div className="stm-order-total">{order.total}</div>
                            <span className={`stm-status stm-status--${order.status}`}>
                        {order.statusText}
                      </span>
                          </div>
                          <button
                              className="stm-btn stm-btn--icon"
                              title="Xem chi tiết"
                              onClick={() => handleViewOrder(order)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                    ))
                ) : (
                    <div className="stm-no-results">
                      Chưa có đơn hàng nào
                    </div>
                )}
              </div>
              <div className="stm-card-footer--dashboard">
                <button
                    className="stm-btn stm-btn--secondary"
                    onClick={() => setActiveTab && setActiveTab("orders")}
                >
                  Xem tất cả đơn hàng
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="stm-card stm-card--dashboard">
            <div className="stm-card-header">
              <h3 className="stm-card-title--dashboard">Thao tác nhanh</h3>
            </div>
            <div className="stm-card-content--dashboard">
              <div className="stm-quick-actions">
                <button
                    className="stm-quick-action-btn"
                    onClick={() => setShowCreateOrder(true)}
                >
                  <ShoppingCart size={20} />
                  <span>Tạo đơn hàng</span>
                </button>
                <button
                    className="stm-quick-action-btn"
                    onClick={() => setShowAddProduct(true)}
                >
                  <Package size={20} />
                  <span>Thêm sản phẩm</span>
                </button>
                <button className="stm-quick-action-btn">
                  <TrendingUp size={20} />
                  <span>Xem báo cáo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <OrderDetailModal
            order={selectedOrder}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onStatusUpdate={handleStatusUpdate}
        />
      </div>
  );
};

export default DashboardPage;