"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import FilterBar from "../../../components/storeManagement/FilterBar";
import Pagination from "../../../components/storeManagement/Pagination";
import OrderDetailModal from "../../../components/storeManagement/OrderDetailModal";
import CreateOrderPage from "./CreateOrderPage";
import CreateMedicationOrderPage from "./CreateMedicationOrderPage";
import orderService from "../../../services/orderService";
import appointmentService from "../../../services/appointmentService";
import {
  ShoppingCart,
  CheckCircle,
  DollarSign,
  Eye,
  Package,
  Pill,
} from "lucide-react";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showCreateMedicationOrder, setShowCreateMedicationOrder] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const statuses = ["PAID", "SHIPPED", "COMPLETED", "CANCELED"];
  const itemsPerPage = 10;

  const getStatusText = (status) => {
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
        return "Không xác định";
    }
  };

  const filterOptions = [
    {
      label: "Trạng thái",
      value: statusFilter,
      options: [
        { value: "all", label: "Tất cả" },
        ...statuses.map((status) => ({
          value: status,
          label: getStatusText(status),
        })),
      ],
      onChange: setStatusFilter,
    },
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedOrders = await orderService.getAllOrders();
        console.log("Fetched Orders:", fetchedOrders); // Debug log
        const mappedOrders = await Promise.all(
            fetchedOrders.map(async (order) => {
              if (!order || !order.id) {
                console.warn("Dữ liệu đơn hàng không hợp lệ:", order);
                return null;
              }
              const patient = await orderService.getPatientForOrder(order.userId);
              return {
                id: `#${order.id.toString().padStart(3, "0")}`,
                customerName: patient.name || `Khách hàng ${order.userId || "N/A"}`,
                customerEmail: patient.email || `user${order.userId || "unknown"}@example.com`,
                customerPhone: patient.phone || "N/A",
                customerAddress: order.shippingAddress || "N/A",
                orderDate: order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })
                    : "N/A",
                status: order.status || "PENDING",
                statusText: getStatusText(order.status || "PENDING"),
                paymentMethod: order.payment?.transactionNo ? "Chuyển khoản" : "Tiền mặt",
                paymentStatus: order.payment?.status || "PENDING",
                shippingMethod: "Giao hàng tiêu chuẩn",
                items: (order.items || []).map((item) => ({
                  id: item.id?.toString() || "0",
                  name: item.productName || "Không xác định",
                  image: item.image || "/placeholder.svg?height=60&width=60",
                  quantity: item.quantity || 0,
                  price: parseFloat(item.price || 0),
                  total: parseFloat(item.subtotal || 0),
                })),
                subtotal: parseFloat(
                    (order.items || []).reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
                ),
                shipping: order.shippingAddress ? 50000 : 0,
                tax: parseFloat(order.totalAmount || 0) * 0.1,
                total: parseFloat(order.totalAmount || 0),
                notes: "N/A",
                createdAt: order.createdAt || new Date().toISOString(),
                updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
                appointmentId: order.appointmentId,
              };
            })
        );
        setOrders(mappedOrders.filter((order) => order !== null));
      } catch (err) {
        console.error("Error fetching orders:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.filter((order) => order.status !== "PENDING").length;
  const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;
  const totalRevenue = orders
      .filter((order) => order.status === "COMPLETED")
      .reduce((sum, order) => sum + order.total, 0);
  const newOrders = orders.filter((order) => {
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus && order.status !== "PENDING";
  });

  const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderCreated = async (orderData) => {
    try {
      const patient = await orderService.getPatientForOrder(orderData.userId);
      const mappedOrder = {
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
        status: orderData.status || "PAID",
        statusText: getStatusText(orderData.status || "PAID"),
        paymentMethod: orderData.payment?.transactionNo ? "Chuyển khoản" : "Tiền mặt",
        paymentStatus: orderData.payment?.status || "COMPLETED",
        shippingMethod: "Giao hàng tiêu chuẩn",
        items: (orderData.items || []).map((item) => ({
          id: item.productId?.toString() || "0",
          name: item.productName || "Không xác định",
          image: item.image || "/placeholder.svg?height=60&width=60",
          quantity: item.quantity || 0,
          price: parseFloat(item.price || 0),
          total: parseFloat(item.subtotal || item.quantity * item.price || 0),
        })),
        subtotal: parseFloat(
            (orderData.items || []).reduce((sum, item) => sum + parseFloat(item.subtotal || item.quantity * item.price || 0), 0)
        ),
        shipping: orderData.shippingAddress ? 50000 : 0,
        tax: parseFloat(orderData.totalAmount || 0) * 0.1,
        total: parseFloat(orderData.totalAmount || 0),
        notes: "N/A",
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: orderData.updatedAt || orderData.createdAt || new Date().toISOString(),
      };
      setOrders((prevOrders) => [mappedOrder, ...prevOrders]);
      setShowCreateOrder(false);
      toast.success(`Đơn hàng ${mappedOrder.id} đã được tạo thành công!`, {
        toastId: `order-created-${mappedOrder.id}`,
      });
      resetFilters();
    } catch (err) {
      console.error("Error processing order:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      toast.error(`Lỗi khi xử lý đơn hàng: ${err.message || "Vui lòng thử lại."}`, {
        toastId: "order-error",
      });
    }
  };

  const handleCreateMedicationOrder = () => {
    console.log("Lấy thuốc button clicked in FilterBar"); // Debug log
    setSelectedOrder(null); // Clear selected order
    setShowCreateMedicationOrder(true);
  };

  const handleMedicationOrderCreated = async (orderData) => {
    try {
      const patient = await orderService.getPatientForOrder(orderData.userId);
      const mappedOrder = {
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
        status: orderData.status || "PAID",
        statusText: getStatusText(orderData.status || "PAID"),
        paymentMethod: orderData.payment?.transactionNo ? "Chuyển khoản" : "Tiền mặt",
        paymentStatus: orderData.payment?.status || "COMPLETED",
        shippingMethod: "Giao hàng tiêu chuẩn",
        items: (orderData.items || []).map((item) => ({
          id: item.productId?.toString() || "0",
          name: item.productName || "Không xác định",
          image: item.image || "/placeholder.svg?height=60&width=60",
          quantity: item.quantity || 0,
          price: parseFloat(item.price || 0),
          total: parseFloat(item.subtotal || item.quantity * item.price || 0),
        })),
        subtotal: parseFloat(
            (orderData.items || []).reduce((sum, item) => sum + parseFloat(item.subtotal || item.quantity * item.price || 0), 0)
        ),
        shipping: orderData.shippingAddress ? 50000 : 0,
        tax: parseFloat(orderData.totalAmount || 0) * 0.1,
        total: parseFloat(orderData.totalAmount || 0),
        notes: "N/A",
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: orderData.updatedAt || orderData.createdAt || new Date().toISOString(),
        appointmentId: orderData.appointmentId,
      };
      setOrders((prevOrders) => [mappedOrder, ...prevOrders]);
      setShowCreateMedicationOrder(false);
      toast.success(`Đơn hàng thuốc ${mappedOrder.id} đã được tạo thành công!`, {
        toastId: `medication-order-created-${mappedOrder.id}`,
      });
      resetFilters();
    } catch (err) {
      console.error("Error processing medication order:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      toast.error(`Lỗi khi xử lý đơn hàng thuốc: ${err.message || "Vui lòng thử lại."}`, {
        toastId: "medication-order-error",
      });
    }
  };

  const handleStatusUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
        prevOrders.map((order) =>
            order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        )
    );
  };

  if (isLoading) {
    return (
        <div className="card">
          <div className="card-content">
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="card">
          <div className="card-content">
            <p className="stm-error">{error}</p>
            <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
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

  if (showCreateMedicationOrder) {
    console.log("Rendering CreateMedicationOrderPage"); // Debug log
    return (
        <CreateMedicationOrderPage
            onBack={() => setShowCreateMedicationOrder(false)}
            onOrderCreated={handleMedicationOrderCreated}
        />
    );
  }

  return (
      <div>
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="stats-grid">
          <StatCard
              title="Tổng doanh thu"
              value={`₫${totalRevenue.toLocaleString("vi-VN")}`}
              icon={<DollarSign size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Tổng đơn hàng"
              value={totalOrders.toString()}
              change={`+${newOrders} đơn hàng mới hôm nay`}
              icon={<ShoppingCart size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Đã hoàn thành"
              value={completedOrders}
              change={
                totalOrders > 0
                    ? `${Math.round((completedOrders / totalOrders) * 100)}% tỷ lệ hoàn thành`
                    : "0% tỷ lệ hoàn thành"
              }
              icon={<CheckCircle size={24} />}
              changeType="positive"
          />
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-hdr-content">
              <h3 className="card-title">Quản lý đơn hàng</h3>
              <SearchBox value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>
          <div className="card-content">
            <div className="filter-bar-container">
              <FilterBar
                  filters={filterOptions}
                  onAddNew={() => setShowCreateOrder(true)}
                  addButtonText="Tạo đơn hàng"
              />
            </div>

            <div className="tbl-container">
              <table className="tbl">
                <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="order-id">{order.id}</td>
                          <td>
                            <div className="customer-info">
                              <div className="customer-name">{order.customerName}</div>
                              <div className="customer-contact">{order.customerPhone}</div>
                            </div>
                          </td>
                          <td>{order.orderDate}</td>
                          <td>
                            <div className="order-items-preview">
                              <Package size={16} />
                              <span>{order.items.length} sản phẩm</span>
                            </div>
                          </td>
                          <td className="order-total">
                            ₫{order.total.toLocaleString()}
                          </td>
                          <td>
                        <span className={`stm-status stm-status--${order.status.toLowerCase()}`}>
                          {order.statusText}
                        </span>
                          </td>
                          <td>
                            <div className="stm-action-buttons">
                              <button
                                  className="btn btn-icon"
                                  title="Xem chi tiết"
                                  onClick={() => handleViewOrder(order)}
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan={7} className="stm-no-results">
                        {searchTerm || statusFilter !== "all"
                            ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc"
                            : "Chưa có đơn hàng nào. Hãy tạo đơn hàng đầu tiên!"}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            {filteredOrders.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                />
            )}
          </div>
        </div>

        <OrderDetailModal
            order={selectedOrder}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onStatusUpdate={handleStatusUpdate}
            onResetFilters={resetFilters}
        />
      </div>
  );
};

export default OrdersPage;