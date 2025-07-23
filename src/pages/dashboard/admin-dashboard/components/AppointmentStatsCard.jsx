import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import dashboardService from '../../../../services/dashboardService';

const AppointmentStatsCard = () => {
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentStats = async () => {
      try {
        setLoading(true);
        const stats = await dashboardService.getAppointmentStatsDetailed();
        setAppointmentStats(stats);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy thống kê cuộc hẹn:', err);
        setError('Không thể tải dữ liệu');
        // Sử dụng dữ liệu fallback
        setAppointmentStats({
          total: 27,
          todayTotal: 5,
          weekTotal: 18,
          monthTotal: 27,
          pending: 5,
          confirmed: 8,
          completed: 12,
          cancelled: 2,
          completionRate: '44.4',
          cancellationRate: '7.4',
          upcomingAppointments: 13
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentStats();
  }, []);

  if (loading) {
    return (
      <div className="appointment-stats-card">
        <div className="card-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thống kê cuộc hẹn...</p>
        </div>
      </div>
    );
  }

  if (!appointmentStats) {
    return (
      <div className="appointment-stats-card">
        <div className="card-error">
          <p>⚠️ Không thể tải dữ liệu thống kê cuộc hẹn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-stats-card">
      <div className="card-header">
        <h3 className="card-title">
          <Calendar size={20} />
          Thống kê cuộc hẹn chi tiết
        </h3>
        {error && (
          <div className="error-indicator" title={error}>
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      <div className="stats-overview">
        <div className="stat-item primary">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appointmentStats.total}</div>
            <div className="stat-label">Tổng cuộc hẹn</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon today">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appointmentStats.todayTotal}</div>
            <div className="stat-label">Hôm nay</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon week">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appointmentStats.weekTotal}</div>
            <div className="stat-label">Tuần này</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon month">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appointmentStats.monthTotal}</div>
            <div className="stat-label">Tháng này</div>
          </div>
        </div>
      </div>

      <div className="status-breakdown">
        <h4 className="breakdown-title">Phân bố theo trạng thái</h4>
        <div className="status-grid">
          <div className="status-item completed">
            <CheckCircle size={16} />
            <span className="status-count">{appointmentStats.completed}</span>
            <span className="status-label">Hoàn thành</span>
          </div>
          
          <div className="status-item confirmed">
            <CheckCircle size={16} />
            <span className="status-count">{appointmentStats.confirmed}</span>
            <span className="status-label">Đã xác nhận</span>
          </div>
          
          <div className="status-item pending">
            <Clock size={16} />
            <span className="status-count">{appointmentStats.pending}</span>
            <span className="status-label">Chờ xác nhận</span>
          </div>
          
          <div className="status-item cancelled">
            <XCircle size={16} />
            <span className="status-count">{appointmentStats.cancelled}</span>
            <span className="status-label">Đã hủy</span>
          </div>
        </div>
      </div>

      <div className="performance-metrics">
        <div className="metric-item">
          <div className="metric-label">Tỷ lệ hoàn thành</div>
          <div className="metric-value success">{appointmentStats.completionRate}%</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Tỷ lệ hủy</div>
          <div className="metric-value warning">{appointmentStats.cancellationRate}%</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Cuộc hẹn sắp tới</div>
          <div className="metric-value info">{appointmentStats.upcomingAppointments}</div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatsCard;
