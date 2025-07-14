import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";

// Pages
import PatientProfile from "./pages/profile";
import AppointmentsPage from "./pages/AppointmentsPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import PaymentDetailPage from "./pages/PaymentDetailPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import MedicalRecordDetailPage from "./pages/MedicalRecordDetailPage";
import MessagesPage from "../storeManagementPage/MessagesPage";
import ProductFeedbackPage from "./pages/ProductFeedbackPage";

export default function PatientRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                <Route path="orders/:orderId/feedback" element={<ProductFeedbackPage />} />
                <Route path="medical-records" element={<MedicalRecordsPage />} />
                <Route path="medical-records/:id" element={<MedicalRecordDetailPage />} />
                <Route path="payment-history" element={<PaymentHistoryPage />} />
                <Route path="payment-history/:id/:type" element={<PaymentDetailPage />} />
                <Route path="messages" element={<MessagesPage />} />
            </Route>
        </Routes>
    );
}