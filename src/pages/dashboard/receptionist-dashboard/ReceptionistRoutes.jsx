// receptionist-dashboard/ReceptionistRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";
import ProfilePage from "../receptionist-dashboard/Profile/ProfilePage";
import CustomerAppointments from "../receptionist-dashboard/Appointments/CustomerAppointments";
import AppointmentListByCustomer from "../receptionist-dashboard/Appointments/AppointmentListByCustomer";
import CreateAppointment from "../receptionist-dashboard/CreateAppointment/CreateAppointment";
import AppointmentsPage from "../receptionist-dashboard/CreateAppointment/AppointmentsPage";
import PaymentManagement from "../receptionist-dashboard/payment-management";
import ScheduleContent from "../admin-dashboard/pages/ScheduleContent";
import RefundManagement from "./RefundManagement";
import MessagesPage from "../storeManagementPage/MessagesPage";

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

                {/* Route trang quản lý thanh toán */}
                <Route path="payment-management" element={<PaymentManagement />} />

                {/* Route trang quản lý hoàn tiền */}
                <Route path="refund-management" element={<RefundManagement />} />

                <Route path="schedule" element={<ScheduleContent />} />

                {/* Route trang tin nhắn */}
                <Route path="messages" element={<MessagesPage />} />

            </Route>
        </Routes>
    );
}