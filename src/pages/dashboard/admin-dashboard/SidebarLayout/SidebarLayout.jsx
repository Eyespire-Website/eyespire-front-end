import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

export default function SidebarLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.split("/").pop();
        const map = {
            "dashboard": "dashboard",
            "appointments": "appointments",
            "schedule": "schedule",
            "users": "users",
            "staff": "staff",
            "services": "services",
            "refund-management": "refund-management",
            "inventory": "inventory",
            "profile": "profile"
        };
        if (map[path]) setActiveTab(map[path]);
    }, [location]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        navigate(`/dashboard/admin/${tabId}`);
    };

    return (
        <div className="dashboard">
            <Sidebar activeTab={activeTab} setActiveTab={handleTabClick} />
            <div className="dashboard-content">
                <Outlet />
            </div>
        </div>
    );
}
