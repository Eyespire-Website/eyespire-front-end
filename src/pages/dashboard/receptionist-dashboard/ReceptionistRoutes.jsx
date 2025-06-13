// receptionist-dashboard/ReceptionistRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";
import ProfilePage from "../receptionist-dashboard/Profile/ProfilePage";
import CustomerAppointments from "../receptionist-dashboard/Appointments/CustomerAppointments";
import AppointmentListByCustomer from "../receptionist-dashboard/Appointments/AppointmentListByCustomer";
import CreateAppointment from "../receptionist-dashboard/CreateAppointment/CreateAppointment";
import AppointmentsPage from "../receptionist-dashboard/CreateAppointment/AppointmentsPage";
export default function ReceptionistRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="appointments" element={<CustomerAppointments />} />
                <Route path="appointments/customer/:customerId" element={<AppointmentListByCustomer />} />
                <Route path="create-appointment" element={<CreateAppointment />} /> {/* Thêm route cho CreateAppointment */}

                {/* Route trang quản lý tất cả cuộc hẹn */}
                <Route path="all-appointments" element={<AppointmentsPage />} />

            </Route>
        </Routes>
    );
}