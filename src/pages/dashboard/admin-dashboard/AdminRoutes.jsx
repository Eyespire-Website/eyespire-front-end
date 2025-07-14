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
import CustomerAppointments from "./pages/Appointments/CustomerAppointments";
import UsersContent from "./pages/UsersContent";
import SpecialtiesContent from "./pages/SpecialtiesContent";
import AdminDashboard from "./AdminDashboard";
import AppointmentListByCustomer from "./pages/Appointments/AppointmentListByCustomer";
import RefundManagement from "./RefundManagement";


export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardContent />} />
                <Route path="admin-overview" element={<AdminDashboard />} />
                <Route path="appointments" element={<CustomerAppointments />} />
                <Route path="appointments/customer/:customerId" element={<AppointmentListByCustomer />} />
                <Route path="refund-management" element={<RefundManagement />} />
                <Route path="schedule" element={<ScheduleContent />} />
                <Route path="users" element={<UsersContent />} />
                <Route path="staff" element={<StaffContent />} />
                <Route path="services" element={<ServicesContent />} />
                <Route path="specialties" element={<SpecialtiesContent />} />
                <Route path="inventory" element={<InventoryContent />} />
                <Route path="profile" element={<ProfileContent />} />
            </Route>
        </Routes>
    );
}
