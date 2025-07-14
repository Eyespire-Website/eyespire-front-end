"use client"
import { useState } from 'react';
import {
    Home,
    Users,
    Calendar,
    Package,
    UserCircle,
    LogOut,
    Clock,
    Stethoscope,
    Activity,
    RefreshCw,
} from "lucide-react";
import { HiOutlineBars3 } from "react-icons/hi2";
import "./sidebar.css";
import authService from "../../../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ activeTab, setActiveTab }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    // Menu items được chia thành các nhóm
    const mainMenuItems = [
        { id: "dashboard", label: "Tổng quan", icon: <Home size={18} /> },
        { id: "appointments", label: "Cuộc hẹn", icon: <Calendar size={18} /> },
        { id: "schedule", label: "Lịch làm việc", icon: <Clock size={18} /> },
    ];

    const managementItems = [
        { id: "users", label: "Người dùng", icon: <Users size={18} /> },
        { id: "staff", label: "Nhân viên", icon: <UserCircle size={18} /> },
        { id: "services", label: "Dịch vụ", icon: <Stethoscope size={18} /> },
        { id: "specialties", label: "Chuyên khoa", icon: <Activity size={18} /> },
        { id: "refund-management", label: "Hoàn tiền", icon: <RefreshCw size={18} /> },
        { id: "inventory", label: "Kho hàng", icon: <Package size={18} /> },
    ];

    const accountItems = [
        { id: "profile", label: "Hồ sơ cá nhân", icon: <UserCircle size={18} /> },
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar-wrapper ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-v2">
                <div className="sidebar-logo-container">
                    <div className="sidebar-logo-content">
                        <img
                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                            alt="Eyespire Logo"
                            className="sidebar-logo-image"
                        />
                        <span className="logo-text-v2">Eyespire</span>
                    </div>

                    <div className="toggle-container-below">
                        <button onClick={toggleSidebar} className="toggle-btn">
                            <HiOutlineBars3 className="toggle-icon" />
                        </button>
                    </div>
                </div>

                <ul className="menu-list-v2">
                    {/* Main Navigation */}
                    <li className="menu-category">Chính</li>
                    {mainMenuItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item-v2 ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="icon-v2">{item.icon}</span>
                            <span className="label-v2">{item.label}</span>
                        </li>
                    ))}

                    {/* Management */}
                    <li className="menu-category">Quản lý</li>
                    {managementItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item-v2 ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="icon-v2">{item.icon}</span>
                            <span className="label-v2">{item.label}</span>
                        </li>
                    ))}

                    {/* Account */}
                    <li className="menu-category">Tài khoản</li>
                    {accountItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item-v2 ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="icon-v2">{item.icon}</span>
                            <span className="label-v2">{item.label}</span>
                        </li>
                    ))}
                    <li
                        className="menu-item-v2 logout-item"
                        onClick={() => {
                            authService.logout();
                            navigate("/");
                        }}
                    >
                        <span className="icon-v2"><LogOut size={18} /></span>
                        <span className="label-v2">Đăng xuất</span>
                    </li>
                </ul>

                <div className="sidebar-footer-v2">
                    <span className="footer-text-v2">2024 Eyespire</span>
                </div>
            </div>
        </div>
    );
}