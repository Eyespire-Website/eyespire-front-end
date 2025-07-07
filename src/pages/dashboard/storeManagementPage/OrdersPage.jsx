"use client";

import { useState } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import FilterBar from "../../../components/storeManagement/FilterBar";
import Pagination from "../../../components/storeManagement/Pagination";
import OrderDetailModal from "../../../components/storeManagement/OrderDetailModal";

import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  Eye,
  Edit,
  Package,
} from "lucide-react";
import CreateOrderPage from "./CreateOrderPage";
import EditOrderPage from "./EditOrderPage";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  // State để quản lý danh sách đơn hàng
  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      customerName: "Nguyễn Văn A",
      customerEmail: "nguyenvana@gmail.com",
      customerPhone: "0901234567",
      customerAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      orderDate: "15/01/2024",
      status: "confirmed",
      statusText: "Đã xác nhận",
      paymentMethod: "Chuyển khoản",
      paymentStatus: "paid",
      shippingMethod: "Giao hàng tiêu chuẩn",
      items: [
        {
          id: "1",
          name: "Thức ăn cá Koi cao cấp",
          image: "/placeholder.svg?height=60&width=60",
          quantity: 2,
          price: 250000,
          total: 500000,
        },
        {
          id: "2",
          name: "Máy lọc nước hồ cá",
          image: "/placeholder.svg?height=60&width=60",
          quantity: 1,
          price: 1500000,
          total: 1500000,
        },
      ],
      subtotal: 2000000,
      shipping: 50000,
      tax: 200000,
      total: 2250000,
      notes: "Giao hàng vào buổi sáng",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "ORD002",
      customerName: "Trần Thị B",
      customerEmail: "tranthib@gmail.com",
      customerPhone: "0912345678",
      customerAddress: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
      orderDate: "14/01/2024",
      status: "processing",
      statusText: "Đang xử lý",
      paymentMethod: "Tiền mặt",
      paymentStatus: "pending",
      shippingMethod: "Giao hàng nhanh",
      items: [
        {
          id: "3",
          name: "Thuốc trị bệnh cho cá",
          image: "/placeholder.svg?height=60&width=60",
          quantity: 3,
          price: 180000,
          total: 540000,
        },
      ],
      subtotal: 540000,
      shipping: 30000,
      tax: 54000,
      total: 624000,
      createdAt: "2024-01-14T09:45:00Z",
      updatedAt: "2024-01-14T09:45:00Z",
    },
    {
      id: "ORD003",
      customerName: "Lê Văn C",
      customerEmail: "levanc@gmail.com",
      customerPhone: "0923456789",
      customerAddress: "789 Đường Pasteur, Quận 1, TP.HCM",
      orderDate: "13/01/2024",
      status: "shipped",
      statusText: "Đã gửi hàng",
      paymentMethod: "Thẻ tín dụng",
      paymentStatus: "paid",
      shippingMethod: "Giao hàng tiêu chuẩn",
      items: [
        {
          id: "4",
          name: "Đèn LED chiếu sáng hồ",
          image: "/placeholder.svg?height=60&width=60",
          quantity: 2,
          price: 800000,
          total: 1600000,
        },
      ],
      subtotal: 1600000,
      shipping: 50000,
      tax: 160000,
      total: 1810000,
      createdAt: "2024-01-13T08:20:00Z",
      updatedAt: "2024-01-13T08:20:00Z",
    },
    {
      id: "ORD004",
      customerName: "Phạm Thị D",
      customerEmail: "phamthid@gmail.com",
      customerPhone: "0934567890",
      customerAddress: "321 Đường Võ Văn Tần, Quận 3, TP.HCM",
      orderDate: "12/01/2024",
      status: "delivered",
      statusText: "Đã giao hàng",
      paymentMethod: "Chuyển khoản",
      paymentStatus: "paid",
      shippingMethod: "Giao hàng nhanh",
      items: [
        {
          id: "5",
          name: "Bộ test nước hồ cá",
          image: "/placeholder.svg?height=60&width=60",
          quantity: 1,
          price: 350000,
          total: 350000,
        },
      ],
      subtotal: 350000,
      shipping: 30000,
      tax: 35000,
      total: 415000,
      createdAt: "2024-01-12T07:15:00Z",
      updatedAt: "2024-01-12T07:15:00Z",
    },
    {
      id: "ORD005",
      customerName: "Hoàng Văn E",
      customerEmail: "hoangvane@gmail.com",
      customerPhone: "0945678901",
      customerAddress: "654 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
      orderDate: "11/01/2024",
      status: "pending",
      statusText: "Chờ xác nhận",
      paymentMethod: "Tiền mặt",
      paymentStatus: "pending",
      shippingMethod: "Giao hàng tiêu chuẩn",
      items: [
        {
          id: "6",
          name: "Thức ăn cá Koi loại thường",
          image: "/placeholder.svg?height=60&width=60",
          quantity: 5,
          price: 120000,
          total: 600000,
        },
      ],
      subtotal: 600000,
      shipping: 50000,
      tax: 60000,
      total: 710000,
      createdAt: "2024-01-11T08:00:00Z",
      updatedAt: "2024-01-11T08:00:00Z",
    },
  ]);

  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const paymentStatuses = ["paid", "pending", "failed"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đã gửi hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chờ thanh toán";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEditOrder = (orderId) => {
    console.log("Editing order:", orderId);
    setEditingOrderId(orderId);
  };

  // Hàm xử lý khi tạo đơn hàng mới thành công
  const handleOrderCreated = (newOrder) => {
    console.log("New order created:", newOrder);

    // Thêm đơn hàng mới vào đầu danh sách
    setOrders((prevOrders) => [newOrder, ...prevOrders]);

    // Đóng trang tạo đơn hàng
    setShowCreateOrder(false);

    // Hiển thị thông báo thành công
    alert(`Đơn hàng ${newOrder.id} đã được tạo thành công!`);

    // Reset các filter để hiển thị đơn hàng mới
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setCurrentPage(1);
  };

  // Hàm xử lý khi cập nhật đơn hàng thành công
  const handleOrderUpdated = (updatedOrder) => {
    console.log("Order updated:", updatedOrder);

    // Cập nhật đơn hàng trong danh sách
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );

    // Đóng trang chỉnh sửa
    setEditingOrderId(null);

    // Hiển thị thông báo thành công
    alert(`Đơn hàng ${updatedOrder.id} đã được cập nhật thành công!`);

    // Cập nhật modal nếu đang mở
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  };

  // Hàm xử lý khi xóa đơn hàng
  const handleOrderDeleted = (deletedOrderId) => {
    console.log("Order deleted:", deletedOrderId);

    // Xóa đơn hàng khỏi danh sách
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== deletedOrderId)
    );

    // Đóng trang chỉnh sửa
    setEditingOrderId(null);

    // Đóng modal nếu đang mở
    if (selectedOrder && selectedOrder.id === deletedOrderId) {
      setIsModalOpen(false);
      setSelectedOrder(null);
    }

    // Hiển thị thông báo thành công
    alert(`Đơn hàng ${deletedOrderId} đã được xóa thành công!`);
  };

  // Hàm lấy đơn hàng theo ID (để truyền cho EditOrderPage)
  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId);
  };

  // Tính toán thống kê
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

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
    {
      label: "Thanh toán",
      value: paymentFilter,
      options: [
        { value: "all", label: "Tất cả" },
        ...paymentStatuses.map((status) => ({
          value: status,
          label: getPaymentStatusText(status),
        })),
      ],
      onChange: setPaymentFilter,
    },
  ];

  // Thêm function xử lý cập nhật trạng thái từ modal
  const handleStatusUpdateFromModal = (updatedOrder) => {
    console.log("Status updated from modal:", updatedOrder);

    // Cập nhật đơn hàng trong danh sách
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );

    // Cập nhật selectedOrder để modal hiển thị dữ liệu mới
    setSelectedOrder(updatedOrder);
  };

  if (showCreateOrder) {
    return (
      <CreateOrderPage
        onBack={() => setShowCreateOrder(false)}
        onOrderCreated={handleOrderCreated}
      />
    );
  }

  if (editingOrderId) {
    const orderToEdit = getOrderById(editingOrderId);
    return (
      <EditOrderPage
        orderId={editingOrderId}
        orderData={orderToEdit}
        onBack={() => setEditingOrderId(null)}
        onOrderUpdated={handleOrderUpdated}
        onOrderDeleted={handleOrderDeleted}
      />
    );
  }

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          title="Tổng đơn hàng"
          value={totalOrders.toString()}
          change={`+${Math.floor(totalOrders * 0.1)} đơn hàng mới`}
          icon={<ShoppingCart size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Chờ xử lý"
          value={pendingOrders}
          change="Cần xem xét"
          icon={<Clock size={24} />}
          changeType={pendingOrders > 0 ? "negative" : "neutral"}
        />
        <StatCard
          title="Đã hoàn thành"
          value={completedOrders}
          change={`${Math.round(
            (completedOrders / totalOrders) * 100
          )}% tỷ lệ hoàn thành`}
          icon={<CheckCircle size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Doanh thu"
          value={`₫${Math.round(totalRevenue / 1000000)}M`}
          change="+8% từ tháng trước"
          icon={<DollarSign size={24} />}
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
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">
                            {order.customerName}
                          </div>
                          <div className="customer-contact">
                            {order.customerPhone}
                          </div>
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
                        <span className={`stm-status stm-status--${order.paymentStatus}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td>
                        <span className={`stm-status stm-status--${order.status}`}>
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
                          <button
                            className="btn btn-icon"
                            title="Chỉnh sửa"
                            onClick={() => handleEditOrder(order.id)}
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="stm-no-results">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      paymentFilter !== "all"
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
              totalPages={Math.ceil(filteredOrders.length / 10)}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdateFromModal}
      />
    </div>
  );
};

export default OrdersPage;
