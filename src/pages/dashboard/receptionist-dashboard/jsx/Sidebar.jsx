import React from "react";
import { HiOutlineCalendar, HiOutlineUserGroup, HiOutlineUserAdd, HiOutlineUser, HiOutlineLogout } from "react-icons/hi";
import "../css/sidebar.css";

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: "schedule", label: "Lịch làm việc của bác sĩ", icon: <HiOutlineCalendar size={18} /> },
        { id: "appointments", label: "Cuộc hẹn khách hàng", icon: <HiOutlineUserGroup size={18} /> },
        { id: "create", label: "Tạo cuộc hẹn", icon: <HiOutlineUserAdd size={18} /> },
        { id: "profile", label: "Hồ sơ cá nhân", icon: <HiOutlineUser size={18} /> },
    ];

    return (
        <div className="sidebar-wrapper">
            <div className="sidebar-v2">
                {/* Avatar logo project */}
                <div className="sidebar-logo-avatar">
                    <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                        alt="Project Logo"
                        className="sidebar-logo-image"
                    />
                </div>

                <div className="sidebar-header-v2">
                    <span className="logo-text-v2">Eyespire</span>
                </div>

                <ul className="menu-list-v2">
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
                    <button className="logout-btn-v2">
                        <HiOutlineLogout size={16} />
                        <span>Đăng xuất</span>
                    </button>
                    <p className="footer-text-v2">© 2024 Eyespire</p>
                </div>
            </div>
        </div>
    );
}
