import React, { useState, useEffect } from 'react';
import { Medal, Trophy, Award } from "lucide-react"
import dashboardService from '../../../../services/dashboardService';

const CustomerRankingChart = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerRanking = async () => {
      try {
        console.log('CustomerRankingChart: Starting to fetch customer ranking data...');
        setLoading(true);
        const data = await dashboardService.getCustomerRanking();
        console.log('CustomerRankingChart: Received customer ranking data:', data);
        setCustomerData(data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu xếp hạng khách hàng:', err);
        console.error('Error details:', err.message);
        console.error('Stack trace:', err.stack);
        setError(`Lỗi API: ${err.message}`);
        setCustomerData(null); // Không sử dụng fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerRanking();
  }, []);

  const getTierIcon = (tier, rank) => {
    switch (tier) {
      case "Vàng":
        return <Trophy size={16} className="tier-icon gold" style={{ color: '#fbbf24' }} />
      case "Bạc":
        return <Medal size={16} className="tier-icon silver" style={{ color: '#9ca3af' }} />
      case "Đồng":
        return <Award size={16} className="tier-icon bronze" style={{ color: '#cd7c2f' }} />
      default:
        return <Medal size={16} className="tier-icon" style={{ color: '#6b7280' }} />
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case "Vàng":
        return "#fbbf24"
      case "Bạc":
        return "#9ca3af"
      case "Đồng":
        return "#cd7c2f"
      default:
        return "#6b7280"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div className="vip-customers-chart">
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu xếp hạng khách hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vip-customers-chart">
        <div className="chart-error">
          <p>❌ {error}</p>
          <p>Kiểm tra console để xem chi tiết lỗi</p>
        </div>
      </div>
    );
  }

  if (!customerData || !customerData.customers || customerData.customers.length === 0) {
    return (
      <div className="vip-customers-chart">
        <div className="chart-error">
          <p>⚠️ Không có dữ liệu khách hàng</p>
        </div>
      </div>
    );
  }

  // Lấy dữ liệu từ customerData
  const { customers, summary } = customerData;
  const {
    totalCustomers,
    totalAppointments,
    totalOrders,
    totalAppointmentSpending,
    totalOrderSpending,
    totalSpending
  } = summary;

  return (
    <div className="vip-customers-chart">
      <div className="vip-stats">
        <div className="vip-stat-item">
          <div className="stat-number">{totalCustomers}</div>
          <div className="stat-label">Tổng khách hàng</div>
        </div>
        <div className="vip-stat-item">
          <div className="stat-number">{totalAppointments}</div>
          <div className="stat-label">Tổng cuộc hẹn</div>
        </div>
        <div className="vip-stat-item">
          <div className="stat-number">{formatCurrency(totalAppointmentSpending)}</div>
          <div className="stat-label">Chi tiêu dịch vụ (DV)</div>
        </div>
        <div className="vip-stat-item">
          <div className="stat-number">{totalOrders}</div>
          <div className="stat-label">Tổng đơn hàng</div>
        </div>
        <div className="vip-stat-item">
          <div className="stat-number">{formatCurrency(totalOrderSpending)}</div>
          <div className="stat-label">Chi tiêu sản phẩm (SP)</div>
        </div>
        <div className="vip-stat-item total-stat">
          <div className="stat-number">{formatCurrency(totalSpending)}</div>
          <div className="stat-label">Tổng chi tiêu</div>
        </div>
      </div>

      <div className="vip-customers-list">
        {customers.slice(0, 10).map((customer, index) => (
          <div key={customer.patientId} className="vip-customer-item">
            <div className="customer-rank">#{customer.rank || (index + 1)}</div>
            <div className="customer-avatar">
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.patientName} />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(customer.patientName)}
                </div>
              )}
            </div>
            <div className="customer-info">
              <div className="customer-name">
                {customer.patientName}
                {getTierIcon(customer.tier, customer.rank)}
              </div>
              <div className="customer-email">ID: {customer.patientId}</div>
            </div>
            <div className="customer-stats">
              <div className="stat-item">
                <span className="stat-value">{customer.appointmentCount || 0}</span>
                <span className="stat-label">Cuộc hẹn</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(customer.appointmentSpending || 0)}</span>
                <span className="stat-label">DV</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{customer.orderCount || 0}</span>
                <span className="stat-label">Đơn hàng</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(customer.orderSpending || 0)}</span>
                <span className="stat-label">SP</span>
              </div>
              <div className="stat-item total-spent">
                <span className="stat-value">{formatCurrency(customer.totalSpending || 0)}</span>
                <span className="stat-label">Tổng</span>
              </div>
            </div>
            <div className="customer-tier" style={{ color: customer.tierColor || getTierColor(customer.tier) }}>
              {customer.tier}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerRankingChart
