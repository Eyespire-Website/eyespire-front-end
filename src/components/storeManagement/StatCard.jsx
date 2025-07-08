import React from 'react';
import './stmStyle/STM-StatCard.css';

const StatCard = ({ title, value, change, icon, changeType = 'neutral' }) => {
  return (
    <div className="stm-stat-card">
      <div className="stm-stat-icon">{icon}</div>
      <div className="stm-stat-content">
        <h3 className="stm-stat-title">{title}</h3>
        <div className="stm-stat-value">{value}</div>
        <div className={`stm-stat-change stm-stat-change--${changeType}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatCard;