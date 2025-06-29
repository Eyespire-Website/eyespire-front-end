// doctor-dashboard/DoctorRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./SidebarLayout/SidebarLayout";
import DoctorDashboard from "./doctor";
import DoctorSchedule from "./doctor-schedule";
import CreateRecords from "./doctor-records";
import DoctorFeedback from "./doctor-feedback";
import DoctorAppointments from "./doctor-appointments";
import DoctorPatients from "./doctor-patient";
import ViewAppointmentPage from "./ViewAppointmentPage";
import ViewRecordPage from "./ViewMedicalRecordPage";
import EditRecordPage from "./EditMedicalRecord";

export default function DoctorRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SidebarLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<DoctorDashboard />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="create-medical-record" element={<CreateRecords />} />
                <Route path="feedback" element={<DoctorFeedback />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="edit-medical-record" element={<EditRecordPage />} />
                <Route path="view-medical-record" element={<ViewRecordPage />} />
                <Route path="patients" element={<DoctorPatients />} />
                <Route path="view-appointment" element={<ViewAppointmentPage />} />
            </Route>
        </Routes>
    );
}