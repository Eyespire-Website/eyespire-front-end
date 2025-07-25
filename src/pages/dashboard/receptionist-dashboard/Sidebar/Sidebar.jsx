"use client"
import { useState } from 'react';
import {
    HiOutlineCalendar,
    HiOutlineLogout,
    HiOutlineUser,
    HiOutlineUserAdd,
    HiOutlineUserGroup,
    HiOutlineChat,
    HiOutlineChevronLeft,
    HiOutlineRefresh
} from "react-icons/hi";
import {HiOutlineBars3} from "react-icons/hi2";
import "../../admin-dashboard/Sidebar/sidebar.css";
import logo from "../../../../assets/logo.png";
import authService from "../../../../services/authService";
import {useNavigate} from "react-router-dom";

export default function Sidebar({ activeTab, setActiveTab }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const menuItems = [
        { id: "schedule", label: "Lịch làm việc của bác sĩ", icon: <HiOutlineCalendar size={18} /> },
        { id: "appointments", label: "Lịch hẹn khách hàng", icon: <HiOutlineUserGroup size={18} /> },
        { id: "create", label: "Tạo cuộc hẹn", icon: <HiOutlineUserAdd size={18} /> },
        { id: "refund-management", label: "Quản lý hoàn tiền", icon: <HiOutlineRefresh size={18} /> },
        { id: "messages", label: "Tin nhắn", icon: <HiOutlineChat size={18} /> },
        { id: "profile", label: "Hồ sơ cá nhân", icon: <HiOutlineUser size={18} /> },
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    return (
        <div className={`sidebar-wrapper ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-v2">
                <div className="sidebar-logo-container">
                    <div className="sidebar-logo-content">
                        <img
                            src={logo}
                            alt="Project Logo"
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
                    {menuItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item-v2 ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="icon-v2">{item.icon}</span>
                            <span className="label-v2">{item.label}</span>
                        </li>
                    ))}
                </ul>

                <div className="sidebar-footer-v2">
                    <button className="logout-btn-v2" onClick={handleLogout}>
                        <HiOutlineLogout size={16} className="logout-icon-v2" />
                        <span className="logout-text-v2">Đăng xuất</span>
                    </button>
                    <p className="footer-text-v2">© 2024 Eyespire</p>
                </div>
            </div>
        </div>
    );
}