import React from 'react';
import '../styles/statcard.css';

const StatCard = ({ title, value, change, icon, changeType = 'neutral' }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-content">
        <h3 className="admin-stat-title">{title}</h3>
        <div className="admin-stat-value">{value}</div>
        {change && (
          <div className={`admin-stat-change admin-stat-change--${changeType}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
