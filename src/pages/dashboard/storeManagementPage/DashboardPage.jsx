"use client";

import { useState } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import "./STM-Style/STM-DashboardPage.css";
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  Calendar,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const recentActivities = [
    {
      id: 1,
      time: "10:30 AM",
      activity: "Đơn hàng mới #ORD001",
      person: "Nguyễn Văn A",
      status: "active",
      statusText: "Đã xác nhận",
      amount: "₫2,250,000",
    },
    {
      id: 2,
      time: "09:15 AM",
      activity: "Cập nhật kho hàng",
      person: "Nhân viên kho",
      status: "active",
      statusText: "Hoàn thành",
      amount: "+50 sản phẩm",
    },
    {
      id: 3,
      time: "08:45 AM",
      activity: "Đánh giá sản phẩm mới",
      person: "Trần Thị B",
      status: "pending",
      statusText: "5 sao",
      amount: "SP001",
    },
    {
      id: 4,
      time: "08:30 AM",
      activity: "Tin nhắn từ khách hàng",
      person: "Lê Văn C",
      status: "active",
      statusText: "Đã trả lời",
      amount: "Tư vấn sản phẩm",
    },
    {
      id: 5,
      time: "08:00 AM",
      activity: "Cập nhật hồ sơ",
      person: "Admin",
      status: "active",
      statusText: "Hoàn thành",
      amount: "Thông tin cá nhân",
    },
  ];

  const topProducts = [
    {
      id: "SP001",
      name: "Thức ăn cá Koi cao cấp",
      sales: 156,
      revenue: "₫39,000,000",
      growth: "+12%",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP002",
      name: "Máy lọc nước hồ cá",
      sales: 89,
      revenue: "₫133,500,000",
      growth: "+8%",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP003",
      name: "Đèn LED chiếu sáng hồ",
      sales: 67,
      revenue: "₫53,600,000",
      growth: "+15%",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "SP004",
      name: "Thuốc trị bệnh cho cá",
      sales: 45,
      revenue: "₫8,100,000",
      growth: "+5%",
      image: "/placeholder.svg?height=40&width=40",
    },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      customer: "Nguyễn Văn A",
      total: "₫2,250,000",
      status: "confirmed",
      statusText: "Đã xác nhận",
      time: "10:30 AM",
    },
    {
      id: "ORD002",
      customer: "Trần Thị B",
      total: "₫624,000",
      status: "processing",
      statusText: "Đang xử lý",
      time: "09:45 AM",
    },
    {
      id: "ORD003",
      customer: "Lê Văn C",
      total: "₫1,810,000",
      status: "shipped",
      statusText: "Đã gửi hàng",
      time: "08:20 AM",
    },
    {
      id: "ORD004",
      customer: "Phạm Thị D",
      total: "₫415,000",
      status: "delivered",
      statusText: "Đã giao hàng",
      time: "07:15 AM",
    },
  ];

  const filteredActivities = recentActivities.filter(
    (activity) =>
      activity.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.statusText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="stm-stats-grid">
        <StatCard
          title="Tổng doanh thu"
          value="₫234.5M"
          change="+12% từ tháng trước"
          icon={<DollarSign size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Đơn hàng mới"
          value="156"
          change="+23 từ hôm qua"
          icon={<ShoppingCart size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Sản phẩm bán chạy"
          value="89"
          change="+8% từ tuần trước"
          icon={<TrendingUp size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Khách hàng mới"
          value="45"
          change="+15 người dùng"
          icon={<Users size={24} />}
          changeType="positive"
        />
      </div>

      <div className="stm-stats-grid">
        <StatCard
          title="Sản phẩm trong kho"
          value="1,234"
          change="23 sắp hết hàng"
          icon={<Package size={24} />}
          changeType="negative"
        />
        <StatCard
          title="Đánh giá trung bình"
          value="4.8"
          change="156 đánh giá mới"
          icon={<Star size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Tin nhắn chưa đọc"
          value="12"
          change="Cần phản hồi"
          icon={<MessageSquare size={24} />}
          changeType="negative"
        />
        <StatCard
          title="Cảnh báo hệ thống"
          value="3"
          change="Cần xem xét"
          icon={<AlertTriangle size={24} />}
          changeType="negative"
        />
      </div>

      <div className="stm-dashboard-grid">
        <div className="stm-card stm-card--dashboard">
          <div className="stm-card-header">
            <div className="stm-card-header-content">
              <h3 className="stm-card-title--dashboard">Hoạt động gần đây</h3>
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Tìm hoạt động..."
              />
            </div>
          </div>
          <div className="stm-card-content--dashboard">
            <div className="stm-activity-list">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="stm-activity-item">
                    <div className="stm-activity-time">
                      <Clock size={14} />
                      <span>{activity.time}</span>
                    </div>
                    <div className="stm-activity-content">
                      <div className="stm-activity-main">
                        <h4 className="stm-activity-title">{activity.activity}</h4>
                        <p className="stm-activity-person">bởi {activity.person}</p>
                      </div>
                      <div className="stm-activity-meta">
                        <span className={`stm-status stm-status--${activity.status}`}>
                          {activity.statusText}
                        </span>
                        <span className="stm-activity-amount">
                          {activity.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="stm-no-results">
                  Không tìm thấy hoạt động nào phù hợp
                </div>
              )}
            </div>
            <div className="stm-card-footer--dashboard">
              <button className="stm-btn stm-btn--secondary">
                Xem tất cả hoạt động
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="stm-card stm-card--dashboard">
          <div className="stm-card-header">
            <h3 className="stm-card-title--dashboard">Sản phẩm bán chạy</h3>
          </div>
          <div className="stm-card-content--dashboard">
            <div className="stm-products-list">
              {topProducts.map((product) => (
                <div key={product.id} className="stm-product-item">
                  <div className="stm-product-info">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="stm-product-image"
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
              ))}
            </div>
            <div className="stm-card-footer--dashboard">
              <button className="stm-btn stm-btn--secondary">
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
              {recentOrders.map((order) => (
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
                  <button className="stm-btn stm-btn--icon" title="Xem chi tiết">
                    <Eye size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="stm-card-footer--dashboard">
              <button className="stm-btn stm-btn--secondary">
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
              <button className="stm-quick-action-btn">
                <ShoppingCart size={20} />
                <span>Tạo đơn hàng mới</span>
              </button>
              <button className="stm-quick-action-btn">
                <Package size={20} />
                <span>Thêm sản phẩm</span>
              </button>

              <button className="stm-quick-action-btn">
                <MessageSquare size={20} />
                <span>Gửi tin nhắn</span>
              </button>
              <button className="stm-quick-action-btn">
                <TrendingUp size={20} />
                <span>Xem báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
