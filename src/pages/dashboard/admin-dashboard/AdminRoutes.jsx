// admin-dashboard/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";
import DashboardContent from "./pages/DashboardContent";
import InventoryContent from "./pages/InventoryContent";
import ProfileContent from "./pages/ProfileContent";
import StaffContent from "./pages/StaffContent";
import ServicesContent from "./pages/ServicesContent";
import ScheduleContent from "./pages/ScheduleContent";
import AppointmentsContent from "./pages/AppointmentsContent";
import UsersContent from "./pages/UsersContent";
import AdminDashboard from "./AdminDashboard";


export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardContent />} />
                <Route path="admin-overview" element={<AdminDashboard />} />
                <Route path="appointments" element={<AppointmentsContent />} />
                <Route path="schedule" element={<ScheduleContent />} />
                <Route path="users" element={<UsersContent />} />
                <Route path="staff" element={<StaffContent />} />
                <Route path="services" element={<ServicesContent />} />
                <Route path="inventory" element={<InventoryContent />} />
                <Route path="profile" element={<ProfileContent />} />
            </Route>
        </Routes>
    );
}
