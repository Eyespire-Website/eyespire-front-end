import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendar, FaClock, FaUsers, FaBox, FaCog, FaSignOutAlt, FaUserCircle, FaBars } from 'react-icons/fa';
import logo from '../../../../assets/logo.png';
import './Sidebar-admin.css';

export const SidebarProvider = ({ children }) => (
    <div className="sidebar-provider">{children}</div>
);

export const SidebarHeader = ({ children }) => (
    <div className="sidebar-header">{children}</div>
);

export const SidebarContent = ({ children }) => (
    <div className="sidebar-content">{children}</div>
);

export const SidebarGroup = ({ children }) => (
    <div className="sidebar-group">{children}</div>
);

export const SidebarGroupLabel = ({ children }) => (
    <div className="sidebar-group-label">{children}</div>
);

export const SidebarGroupContent = ({ children }) => (
    <div className="sidebar-group-content">{children}</div>
);

export const SidebarMenu = ({ children }) => (
    <ul className="sidebar-menu">{children}</ul>
);

export const SidebarMenuItem = ({ children }) => (
    <li className="sidebar-menu-item">{children}</li>
);

export const SidebarMenuButton = ({ children, onClick, isActive }) => (
    <button
        className={`sidebar-menu-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
      {children}
    </button>
);

export const SidebarRail = () => (
    <div className="sidebar-rail" />
);

export const SidebarInset = ({ children }) => (
    <main className="sidebar-inset">{children}</main>
);

export const SidebarTrigger = ({ onClick }) => (
    <button className="sidebar-trigger" onClick={onClick}>
      <FaBars />
    </button>
);

export const Sidebar = ({ children, className = '' }) => (
  <aside className={`sidebar ${className}`}>{children}</aside>
);

const SidebarAdmin = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [isOpen, setIsOpen] = useState(true);

  return (
      <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="branding" >
            <img src={logo} alt="Eyespire" className="sidebar-logo" />
            <span className="sidebar-title">Eyespire</span>
          </div>
          <div className="dashboard-name">Admin Dashboard</div>
          <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
            <FaBars />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-menu-item">
            <button
                className={`sidebar-menu-button ${activeItem === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveItem('overview')}
            >
              <FaUser /> <span>Tổng quan</span>
            </button>
          </li>
          <li className="sidebar-menu-item">
            <button
                className={`sidebar-menu-button ${activeItem === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveItem('appointments')}
            >
              <FaCalendar /> <span>Cuộc hẹn</span>
            </button>
          </li>
          <li className="sidebar-menu-item">
            <button
                className={`sidebar-menu-button ${activeItem === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveItem('schedule')}
            >
              <FaClock /> <span>Lịch làm việc</span>
            </button>
          </li>
        </ul>

        <div className="sidebar-group">
          <div className="sidebar-group-label">QUẢN LÝ</div>
          <ul className="sidebar-menu">
            <li className="sidebar-menu-item">
              <button
                  className={`sidebar-menu-button ${activeItem === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveItem('users')}
              >
                <FaUsers /> <span>Người dùng</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                  className={`sidebar-menu-button ${activeItem === 'staff' ? 'active' : ''}`}
                  onClick={() => setActiveItem('staff')}
              >
                <FaUsers /> <span>Nhân viên</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                  className={`sidebar-menu-button ${activeItem === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveItem('services')}
              >
                <FaCog /> <span>Dịch vụ</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                  className={`sidebar-menu-button ${activeItem === 'inventory' ? 'active' : ''}`}
                  onClick={() => setActiveItem('inventory')}
              >
                <FaBox /> <span>Kho hàng</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                  className={`sidebar-menu-button ${activeItem === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveItem('profile')}
              >
                <FaUserCircle /> <span>Hồ sơ cá nhân</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                  className={`sidebar-menu-button ${activeItem === 'logout' ? 'active' : ''}`}
                  onClick={() => setActiveItem('logout')}
              >
                <FaSignOutAlt /> <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="sidebar-footer">
          <span className="sidebar-copyright">© 2025 Eyespire</span>
        </div>
      </aside>
  );
};

export default SidebarAdmin;