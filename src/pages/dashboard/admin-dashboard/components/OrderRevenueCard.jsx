import React from 'react';
import { ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';

const OrderRevenueCard = ({ data }) => {
  const isPositive = data?.change?.includes('+') || false;
  
  return (
    <div className="revenue-info-card order-revenue">
      <div className="revenue-card-header">
        <div className="revenue-icon-wrapper order-icon">
          <ShoppingCart size={24} />
        </div>
        <div className="revenue-trend">
          {isPositive ? (
            <TrendingUp size={16} className="trend-icon positive" />
          ) : (
            <TrendingDown size={16} className="trend-icon negative" />
          )}
        </div>
      </div>
      
      <div className="revenue-content">
        <h3 className="revenue-title">Doanh thu đơn hàng</h3>
        <div className="revenue-amount">{data?.total || '₫0'}</div>
        <div className={`revenue-change ${isPositive ? 'positive' : 'negative'}`}>
          {data?.change || '0% từ tháng trước'}
        </div>
      </div>
      
      <div className="revenue-details">
        <div className="detail-item">
          <span className="detail-label">Tháng này</span>
          <span className="detail-value">{data?.total || '₫0'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Trung bình/ngày</span>
          <span className="detail-value">
            {data?.total ? `₫${(parseFloat(data.total.replace(/[₫M]/g, '')) / 30).toFixed(1)}M` : '₫0'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderRevenueCard;
