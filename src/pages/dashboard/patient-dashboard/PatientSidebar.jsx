// components/PatientSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, FileText, History, User } from 'lucide-react';
import authService from '../../../services/authService';
import './PatientSidebar.css';

export const patientMenuItems = [
    { id: "appointments", label: "Danh sách cuộc hẹn", icon: Calendar, route: "/patient/appointment" },
    { id: "orders", label: "Theo dõi đơn hàng", icon: Package, route: "/patient/orders" },
    { id: "medical", label: "Hồ sơ điều trị", icon: FileText, route: "/patient/medical-records" },
    { id: "history", label: "Lịch sử thanh toán", icon: History, route: "/patient/payment-history" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User, route: "/dashboard/profile" },
];

const PatientSidebar = ({ activeItem }) => {
    const navigate = useNavigate();

    const handleMenuClick = (route) => {
        navigate(route);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleBackHome = () => {
        navigate('/');
    };

    return (
        <div className="patient-sidebar">
            <div className="patient-sidebar-header">
                <div className="patient-logo" onClick={handleBackHome}>
                    <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                        className="patient-logo-image"
                        alt="EyeSpire Logo"
                    />
                    <span className="patient-logo-text">Eyespire</span>
                </div>
            </div>

            <div className="patient-sidebar-menu">
                <ul>
                    {patientMenuItems.map((item) => (
                        <li
                            key={item.id}
                            className={`patient-menu-item ${item.id === activeItem ? 'active' : ''}`}
                            onClick={() => handleMenuClick(item.route)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="patient-menu-icon">
                                <item.icon size={18} />
                            </span>
                            <span className="patient-menu-text">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="patient-sidebar-footer">
                <button className="patient-logout-button" onClick={handleLogout}>
                    <span className="patient-logout-icon">←</span>
                    <span>Đăng xuất</span>
                </button>
                <div className="patient-copyright">© 2025 EyeSpire</div>
            </div>
        </div>
    );
};

export default PatientSidebar;