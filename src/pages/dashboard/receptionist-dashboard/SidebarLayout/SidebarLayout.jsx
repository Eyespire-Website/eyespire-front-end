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
            "schedule": "schedule",
            "appointments": "appointments",
            "all-appointments": "create",
            "messages": "messages",
            "profile": "profile",
        };
        if (map[path]) setActiveTab(map[path]);
    }, [location]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        const tabToPath = {
            schedule: "schedule",
            appointments: "appointments",
            create: "all-appointments",
            messages: "messages",
            profile: "profile",
        };
        navigate(`/dashboard/receptionist/${tabToPath[tabId]}`);
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
