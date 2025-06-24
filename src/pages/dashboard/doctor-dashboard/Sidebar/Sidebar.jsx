"use client"
import { useState } from "react"
import {
    HiOutlineCalendar,
    HiOutlineLogout,
    HiOutlineUser,
    HiOutlineClipboardCheck,
    HiOutlineChat,
    HiOutlineUserGroup,
} from "react-icons/hi"
import { HiOutlineBars3 } from "react-icons/hi2"
import "../../admin-dashboard/Sidebar/sidebar.css";
import authService from "../../../../services/authService";
import {useNavigate} from "react-router-dom";

// Re-export icons to fix ESLint issues
const {
    HiOutlineCalendar: Calendar,
    HiOutlineLogout: Logout,
    HiOutlineUser: User,
    HiOutlineClipboardCheck: ClipboardCheck,
    HiOutlineChat: Chat,
    HiOutlineUserGroup: UserGroup,
} = {
    HiOutlineCalendar,
    HiOutlineLogout,
    HiOutlineUser,
    HiOutlineClipboardCheck,
    HiOutlineChat,
    HiOutlineUserGroup,
};

export default function Sidebar({ activeTab, setActiveTab }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const navigate = useNavigate();

    const menuItems = [
        { id: "profile", label: "Hồ sơ cá nhân", icon: <User size={18} /> },
        { id: "schedule", label: "Lịch làm việc", icon: <Calendar size={18} /> },
        { id: "appointments", label: "Cuộc hẹn", icon: <Calendar size={18} /> },
        { id: "records", label: "Hồ sơ bệnh án", icon: <ClipboardCheck size={18} /> },
        { id: "feedback", label: "Phản hồi", icon: <Chat size={18} /> },
        { id: "customers", label: "Khách hàng", icon: <UserGroup size={18} /> },
    ]

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }
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
                        <Logout size={16} className="logout-icon-v2" />
                        <span className="logout-text-v2">Đăng xuất</span>
                    </button>
                    <p className="footer-text-v2">© 2024 Eyespire</p>
                </div>
            </div>
        </div>
    )
}
