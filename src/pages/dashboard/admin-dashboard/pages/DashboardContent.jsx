"use client"

import { useState } from "react"
import { Users, Calendar, DollarSign, Package, Search } from "lucide-react"
import RevenueChart from "../charts/RevenueChart"
import AppointmentStatusChart from "../charts/AppointmentStatusChart"
import ServicesChart from "../charts/ServicesChart"
import CustomerGrowthChart from "../charts/CustomerGrowthChart"

const DashboardContent = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const activities = [
    {
      id: 1,
      time: "10:30 AM",
      activity: "Thêm sản phẩm mới vào kho",
      person: "Nguyễn Văn A",
      status: "active",
      statusText: "Hoàn thành",
    },
    {
      id: 2,
      time: "09:15 AM",
      activity: "Cập nhật thông tin khách hàng",
      person: "Trần Thị B",
      status: "active",
      statusText: "Hoàn thành",
    },
    {
      id: 3,
      time: "08:45 AM",
      activity: "Xuất kho 50 sản phẩm",
      person: "Lê Văn C",
      status: "pending",
      statusText: "Đang xử lý",
    },
    {
      id: 4,
      time: "08:30 AM",
      activity: "Nhập kho thiết bị mới",
      person: "Phạm Thị D",
      status: "active",
      statusText: "Hoàn thành",
    },
    {
      id: 5,
      time: "08:00 AM",
      activity: "Kiểm tra chất lượng sản phẩm",
      person: "Hoàng Văn E",
      status: "active",
      statusText: "Hoàn thành",
    },
  ]

  const filteredActivities = activities.filter(
      (activity) =>
          activity.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.statusText.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
      <div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Tổng nhân viên</span>
              <Users size={24} className="stat-icon" />
            </div>
            <div className="stat-value">24</div>
            <div className="stat-change positive">+2 từ tháng trước</div>
          </div>

          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Cuộc hẹn hôm nay</span>
              <Calendar size={24} className="stat-icon" />
            </div>
            <div className="stat-value">18</div>
            <div className="stat-change positive">+5 từ hôm qua</div>
          </div>

          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Doanh thu tháng</span>
              <DollarSign size={24} className="stat-icon" />
            </div>
            <div className="stat-value">₫45.2M</div>
            <div className="stat-change positive">+12% từ tháng trước</div>
          </div>

          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Sản phẩm trong kho</span>
              <Package size={24} className="stat-icon" />
            </div>
            <div className="stat-value">156</div>
            <div className="stat-change negative">-8 từ tuần trước</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Revenue Chart */}
          <div className="chart-card large">
            <div className="chart-header">
              <h3 className="chart-title">Doanh thu theo tháng</h3>
              <div className="chart-controls">
                <select className="chart-select">
                  <option value="6months">6 tháng qua</option>
                  <option value="12months">12 tháng qua</option>
                  <option value="year">Năm nay</option>
                </select>
              </div>
            </div>
            <div className="chart-content">
              <RevenueChart />
            </div>
          </div>

          {/* Appointments Chart */}
          <div className="chart-card medium">
            <div className="chart-header">
              <h3 className="chart-title">Cuộc hẹn theo trạng thái</h3>
            </div>
            <div className="chart-content">
              <AppointmentStatusChart />
            </div>
          </div>

          {/* Services Chart */}
          <div className="chart-card medium">
            <div className="chart-header">
              <h3 className="chart-title">Dịch vụ phổ biến</h3>
            </div>
            <div className="chart-content">
              <ServicesChart />
            </div>
          </div>

          {/* Customer Growth Chart */}
          <div className="chart-card large">
            <div className="chart-header">
              <h3 className="chart-title">Tăng trưởng khách hàng</h3>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#3b82f6" }}></div>
                  <span>Khách hàng mới</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#10b981" }}></div>
                  <span>Khách hàng quay lại</span>
                </div>
              </div>
            </div>
            <div className="chart-content">
              <CustomerGrowthChart />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-hdr-content">
              <h3 className="card-title">Hoạt động gần đây</h3>
              <div className="search-box">
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="search-icon" />
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="tbl-container">
              <table className="tbl">
                <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Hoạt động</th>
                  <th>Người thực hiện</th>
                  <th>Trạng thái</th>
                </tr>
                </thead>
                <tbody>
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td>{activity.time}</td>
                          <td>{activity.activity}</td>
                          <td>{activity.person}</td>
                          <td>
                            <span className={`status ${activity.status}`}>{activity.statusText}</span>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="4" className="no-results">
                        Không tìm thấy hoạt động nào phù hợp
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  )
}

export default DashboardContent
