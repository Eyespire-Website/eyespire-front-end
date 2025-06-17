"use client";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Package,
    FileText,
    History,
    User,
    LogOut,
} from "lucide-react";
import { HiOutlineBars3 } from "react-icons/hi2";
import authService from '../../../services/authService';
import './PatientSidebar.css';

const patientMenuItems = [
    { id: "appointments", label: "Danh sách cuộc hẹn", icon: <Calendar size={18} />, route: "/dashboard/patient/appointments" },
    { id: "orders", label: "Theo dõi đơn hàng", icon: <Package size={18} />, route: "/dashboard/patient/orders" },
    { id: "medical-records", label: "Hồ sơ điều trị", icon: <FileText size={18} />, route: "/dashboard/patient/medical-records" },
    { id: "payment-history", label: "Lịch sử thanh toán", icon: <History size={18} />, route: "/dashboard/patient/payment-history" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: <User size={18} />, route: "/dashboard/patient/profile" },
];

export default function PatientSidebar({ activeTab, setActiveTab }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleMenuClick = (item) => {
        setActiveTab(item.id);
        navigate(item.route);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar-wrapper ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-v2">
                <div className="sidebar-logo-container">
                    <div className="sidebar-logo-content" onClick={() => navigate('/')}>
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
                    <li className="menu-category"></li>
                    {patientMenuItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item-v2 ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => handleMenuClick(item)}
                        >
                            <span className="icon-v2">{item.icon}</span>
                            <span className="label-v2">{item.label}</span>
                        </li>
                    ))}
                </ul>
                <div className="sidebar-footer-v2">
                    <button className="logout-btn-v2" onClick={handleLogout}>
                        <LogOut size={16} className="logout-icon-v2" />
                        <span className="logout-text-v2">Đăng xuất</span>
                    </button>
                    <p className="footer-text-v2">© 2025 Eyespire</p>
                </div>
            </div>
        </div>
    );
}