import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

export default function SidebarLayout() {
    const [activeTab, setActiveTab] = useState("profile");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.split("/").pop();
        const map = {
            "profile": "profile",
            "schedule": "schedule",
            "records": "records",
            "feedback": "feedback",
            "appointments": "appointments",
            "customers": "customers"
        };
        if (map[path]) setActiveTab(map[path]);
    }, [location]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        navigate(`/dashboard/doctor/${tabId}`);
    };

    return (
        <div className="dashboard" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar activeTab={activeTab} setActiveTab={handleTabClick} />
            <div className="dashboard-content" style={{ flex: 1, overflow: 'auto' }}>
                <Outlet />
            </div>
        </div>
    );
}
