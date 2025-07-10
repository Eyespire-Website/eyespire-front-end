"use client";

import { useState, useEffect } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import FilterBar from "../../../components/storeManagement/FilterBar";
import Pagination from "../../../components/storeManagement/Pagination";
import OrderDetailModal from "../../../components/storeManagement/OrderDetailModal";
import CreateOrderPage from "./CreateOrderPage";
import orderService from "../../../services/orderService";
import {
  ShoppingCart,
  CheckCircle,
  DollarSign,
  Eye,
  Package,
} from "lucide-react";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const statuses = ["PAID", "SHIPPED", "COMPLETED", "CANCELED"];
  const itemsPerPage = 10;

  // Function to reset filters and pagination
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Fetch all orders from backend on mount
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedOrders = await orderService.getAllOrders();
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
                shipping: 50000,
                tax: parseFloat(order.totalAmount || 0) * 0.1,
                total: parseFloat(order.totalAmount || 0),
                notes: "N/A",
                createdAt: order.createdAt || new Date().toISOString(),
                updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderCreated = async (orderData) => {
    try {
      const response = await orderService.createOrder({
        userId: orderData.userId || 1,
        shippingAddress: orderData.shippingAddress,
      });
      const patient = await orderService.getPatientForOrder(response.userId);
      const mappedOrder = {
        id: `#${response.id.toString().padStart(3, "0")}`,
        customerName: patient.name || `Khách hàng ${response.userId || "N/A"}`,
        customerEmail: patient.email || `user${response.userId || "unknown"}@example.com`,
        customerPhone: patient.phone || "N/A",
        customerAddress: response.shippingAddress || "N/A",
        orderDate: response.orderDate
            ? new Date(response.orderDate).toLocaleDateString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })
            : "N/A",
        status: response.status || "PENDING",
        statusText: getStatusText(response.status || "PENDING"),
        paymentMethod: response.payment?.transactionNo ? "Chuyển khoản" : "Tiền mặt",
        paymentStatus: response.payment?.status || "PENDING",
        shippingMethod: "Giao hàng tiêu chuẩn",
        items: (response.items || []).map((item) => ({
          id: item.id?.toString() || "0",
          name: item.productName || "Không xác định",
          image: item.image || "/placeholder.svg?height=60&width=60",
          quantity: item.quantity || 0,
          price: parseFloat(item.price || 0),
          total: parseFloat(item.subtotal || 0),
        })),
        subtotal: parseFloat(
            (response.items || []).reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
        ),
        shipping: 50000,
        tax: parseFloat(response.totalAmount || 0) * 0.1,
        total: parseFloat(response.totalAmount || 0),
        notes: "N/A",
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt || response.createdAt || new Date().toISOString(),
      };
      setOrders((prevOrders) => [mappedOrder, ...prevOrders]);
      setShowCreateOrder(false);
      alert(`Đơn hàng ${mappedOrder.id} đã được tạo thành công!`);
      resetFilters(); // Reset filters after order creation
    } catch (err) {
      console.error("Error creating order:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      alert(`Lỗi khi tạo đơn hàng: ${err.message}`);
    }
  };

  // Calculate statistics excluding PENDING orders
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((order) => order.status === "COMPLETED").length;
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

  return (
      <div>
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
            <FilterBar
                filters={filterOptions}
                onAddNew={() => setShowCreateOrder(true)}
                addButtonText="Tạo đơn hàng"
            />

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
            onResetFilters={resetFilters} // Pass the reset function
        />
      </div>
  );
};

export default OrdersPage;