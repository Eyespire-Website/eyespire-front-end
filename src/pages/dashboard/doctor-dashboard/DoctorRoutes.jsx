// doctor-dashboard/DoctorRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";
import DoctorDashboard from "./doctor";
import DoctorSchedule from "./doctor-schedule";
import DoctorRecords from "./doctor-records";
import DoctorFeedback from "./doctor-feedback";
import DoctorAppointments from "./doctor-appointments";
import DoctorCustomers from "./doctor-customer";

export default function DoctorRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<DoctorDashboard />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="records" element={<DoctorRecords />} />
                <Route path="feedback" element={<DoctorFeedback />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="customers" element={<DoctorCustomers />} />
            </Route>
        </Routes>
    );
}
