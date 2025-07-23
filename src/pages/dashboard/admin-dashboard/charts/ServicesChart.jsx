import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users } from 'lucide-react';
import dashboardService from '../../../../services/dashboardService';

const ServicesChart = () => {
  const [servicesData, setServicesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        console.log('ServicesChart: Starting to fetch services data...');
        setLoading(true);
        const data = await dashboardService.getPopularServices();
        console.log('ServicesChart: Received data:', data);
        console.log('ServicesChart: Data type:', typeof data);
        console.log('ServicesChart: Data.services:', data?.services);
        console.log('ServicesChart: Data.summary:', data?.summary);
        setServicesData(data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu dịch vụ:', err);
        setError('Không thể tải dữ liệu dịch vụ');
        // Sử dụng dữ liệu fallback
        setServicesData({
          services: [
            { id: 1, name: 'Khám mắt tổng quát', count: 45, percentage: '35.2' },
            { id: 2, name: 'Điều trị cận thị', count: 32, percentage: '25.0' },
            { id: 3, name: 'Khám chuyên sâu', count: 28, percentage: '21.9' },
            { id: 4, name: 'Tư vấn kính áp tròng', count: 15, percentage: '11.7' },
            { id: 5, name: 'Điều trị viêm kết mạc', count: 8, percentage: '6.2' }
          ],
          summary: {
            mostPopular: 'Khám mắt tổng quát',
            totalBookings: 128,
            averagePerService: '25.6'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  if (loading) {
    return (
      <div className="services-chart">
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu dịch vụ...</p>
        </div>
      </div>
    );
  }

  if (!servicesData || !servicesData.services || servicesData.services.length === 0) {
    return (
      <div className="services-chart">
        <div className="chart-error">
          <p>⚠️ Không có dữ liệu dịch vụ</p>
        </div>
      </div>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const maxCount = Math.max(...servicesData.services.map(s => s.count));

  return (
    <div className="services-chart">
      {error && (
        <div className="chart-error">
          <p>{error}</p>
        </div>
      )}
      
      {/* Summary Header */}
      <div className="services-summary">
        <div className="summary-item">
          <Activity size={16} />
          <div className="summary-content">
            <div className="summary-value">{servicesData.summary.totalBookings}</div>
            <div className="summary-label">Tổng đặt lịch</div>
          </div>
        </div>
        <div className="summary-item">
          <TrendingUp size={16} />
          <div className="summary-content">
            <div className="summary-value">{servicesData.summary.mostPopular}</div>
            <div className="summary-label">Phổ biến nhất</div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="services-list">
        {servicesData.services.map((service, index) => (
          <div key={service.id || index} className="service-bar">
            <div className="service-info">
              <span className="service-name">{service.name}</span>
              <div className="service-stats">
                <span className="service-count">{service.count}</span>
                <span className="service-percentage">({service.percentage}%)</span>
              </div>
            </div>
            <div className="service-progress">
              <div
                className="service-fill"
                style={{
                  width: `${(service.count / maxCount) * 100}%`,
                  backgroundColor: colors[index % colors.length],
                  '--final-width': `${(service.count / maxCount) * 100}%`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {servicesData.services.length === 0 && (
        <div className="no-data">
          <Users size={32} />
          <p>Chưa có dữ liệu dịch vụ</p>
        </div>
      )}
    </div>
  )
}

export default ServicesChart
