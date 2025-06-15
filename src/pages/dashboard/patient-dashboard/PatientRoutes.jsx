import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";

// Pages
import PatientProfile from "./pages/profile";
import AppointmentsPage from "./pages/AppointmentsPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import MedicalRecordDetailPage from "./pages/MedicalRecordDetailPage";

export default function PatientRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                <Route path="medical-records" element={<MedicalRecordsPage />} />
                <Route path="medical-records/:id" element={<MedicalRecordDetailPage />} />
                <Route path="payment-history" element={<PaymentHistoryPage />} />
            </Route>
        </Routes>
    );
}
