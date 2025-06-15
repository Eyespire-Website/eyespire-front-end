// src/layouts/SidebarLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import PatientSidebar from "..//PatientSidebar"; // Cập nhật đúng đường dẫn import của bạn

export default function SidebarLayout() {
    const [activeTab, setActiveTab] = useState("profile");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.split("/").pop();
        const map = {
            "appointments": "appointments",
            "orders": "orders",
            "medical-records": "medical-records",
            "payment-history": "payment-history",
            "profile": "profile"
        };
        if (map[path]) setActiveTab(map[path]);
    }, [location]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        navigate(`/dashboard/patient/${tabId}`);
    };

    return (
        <div className="dashboard" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <PatientSidebar activeTab={activeTab} setActiveTab={handleTabClick} />
            <div className="dashboard-content" style={{ flex: 1, overflow: 'auto' }}>
                <Outlet />
            </div>
        </div>
    );
}
