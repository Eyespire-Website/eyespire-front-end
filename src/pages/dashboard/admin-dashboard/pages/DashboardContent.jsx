"use client"

import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Package, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import OrderRevenueCard from '../components/OrderRevenueCard';
import AppointmentRevenueCard from '../components/AppointmentRevenueCard';
import AppointmentStatsCard from '../components/AppointmentStatsCard';
import ServicesChart from '../charts/ServicesChart';
import VipCustomersChart from '../charts/VipCustomersChart';
import TopProductsChart from '../charts/TopProductsChart';
import dashboardService from '../../../../services/dashboardService';
import '../styles/dashboard.css';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    staff: { total: 0, change: '' },
    appointments: { total: 0, change: '' },
    revenue: { total: '', change: '' },
    products: { total: 0, change: '' }
  })
  
  const [revenueCardsData, setRevenueCardsData] = useState({
    orderRevenue: { total: '', change: '' },
    appointmentRevenue: { total: '', change: '' }
  });
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load dữ liệu dashboard khi component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [dashboardData, orderRevenueData, appointmentRevenueData] = await Promise.all([
          dashboardService.getAllDashboardData(),
          dashboardService.getOrderRevenueCard(),
          dashboardService.getAppointmentRevenueCard()
        ]);
        
        setDashboardData(dashboardData)
        setRevenueCardsData({
          orderRevenue: orderRevenueData,
          appointmentRevenue: appointmentRevenueData
        });
        setError(null)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err)
        setError('Không thể tải dữ liệu dashboard')
        // Sử dụng dữ liệu fallback nếu có lỗi
        setDashboardData({
          staff: { total: 24, change: '+2 từ tháng trước' },
          appointments: { total: 18, change: '+5 từ hôm qua' },
          revenue: { total: '₫45.2M', change: '+12% từ tháng trước' },
          products: { total: 156, change: '-8 từ tuần trước' }
        })
        setRevenueCardsData({
          orderRevenue: { total: '₫20.2M', change: '+8% từ tháng trước' },
          appointmentRevenue: { total: '₫25.0M', change: '+15% từ tháng trước' }
        });
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    )
  }

  return (
      <div>
        {error && (
          <div className="error-banner">
            <p>⚠️ {error} - Hiển thị dữ liệu mẫu</p>
          </div>
        )}
        
        <div className="admin-stats-grid">
          <StatCard
            title="Tổng nhân viên"
            value={dashboardData.staff.total.toString()}
            change={dashboardData.staff.change}
            icon={<Users size={24} />}
            changeType={dashboardData.staff.change.includes('+') ? 'positive' : 'negative'}
          />
          <StatCard
            title="Cuộc hẹn hôm nay"
            value={dashboardData.appointments.total.toString()}
            change={dashboardData.appointments.change}
            icon={<Calendar size={24} />}
            changeType={dashboardData.appointments.change.includes('+') ? 'positive' : 'negative'}
          />
          <StatCard
            title="Doanh thu tháng"
            value={dashboardData.revenue.total}
            change={dashboardData.revenue.change}
            icon={<DollarSign size={24} />}
            changeType={dashboardData.revenue.change.includes('+') ? 'positive' : 'negative'}
          />
          <StatCard
            title="Sản phẩm trong kho"
            value={dashboardData.products.total.toLocaleString('vi-VN')}
            change={dashboardData.products.change}
            icon={<Package size={24} />}
            changeType={dashboardData.products.change.includes('+') ? 'positive' : dashboardData.products.total <= 50 ? 'negative' : 'neutral'}
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Top Row: Revenue Cards + Services Chart */}
          <div className="top-row-container">
            <div className="revenue-cards-container">
              <OrderRevenueCard data={revenueCardsData.orderRevenue} />
              <AppointmentRevenueCard data={revenueCardsData.appointmentRevenue} />
            </div>
            
            {/* Services Chart */}
            <div className="chart-card services-chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Dịch vụ phổ biến</h3>
              </div>
              <div className="chart-content">
                <ServicesChart />
              </div>
            </div>
          </div>

          {/* Appointment Stats Card - Full Width */}
          <div className="chart-card full-width">
            <AppointmentStatsCard />
          </div>
          
          {/* Customer Ranking Row */}
          <div className="customer-ranking-row">
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3 className="chart-title">Xếp hạng khách hàng</h3>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#FFD700" }}></div>
                    <span>Vàng</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#C0C0C0" }}></div>
                    <span>Bạc</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#CD7F32" }}></div>
                    <span>Đồng</span>
                  </div>
                </div>
              </div>
              <div className="chart-content">
                <VipCustomersChart />
              </div>
            </div>
          </div>
          
          {/* Top Products Row */}
          <div className="top-products-row">
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3 className="chart-title">Top sản phẩm bán chạy</h3>
                <div className="chart-controls">
                  <select className="chart-select">
                    <option value="30days">30 ngày qua</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="90days">90 ngày qua</option>
                  </select>
                </div>
              </div>
              <div className="chart-content">
                <TopProductsChart />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default DashboardContent