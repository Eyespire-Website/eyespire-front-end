import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  Star, 
  User, 
  LogOut, 
  Home,
  Menu
} from 'lucide-react';
import logo from '../../assets/logo.png';
import './stmStyle/STM-Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: <Home size={20} /> },
    { id: "orders", label: "Quản lý đơn hàng", icon: <ShoppingCart size={20} /> },
    { id: "inventory", label: "Quản lý kho hàng", icon: <Package size={20} /> },
    { id: "products", label: "Đánh giá sản phẩm", icon: <Star size={20} /> },
    { id: "messages", label: "Tin nhắn", icon: <MessageSquare size={20} /> },
    { id: "profile", label: "Hồ sơ cá nhân", icon: <User size={20} /> },
  ];

  return (
    <aside className="stm-sidebar">
      <div className="stm-sidebar-header">
        <div className="stm-logo">
          <img
            src={logo}
            alt="Eyespire Logo"
            className="stm-logo-img"
          />
          <span className="stm-logo-text">Eyespire</span>
        </div>
        <div className="stm-dashboard-title">Store Manager</div>
      </div>

      <nav className="stm-nav">
        <ul className="stm-nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="stm-nav-item">
              <button
                className={`stm-nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="stm-sidebar-footer">
        <button className="stm-logout-btn">
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;