import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Homepage from "./pages/homepage";
import Login from "./pages/authentication/login/login";
import Signup from "./pages/authentication/signup/signup";
import VerifyOtpPage from "./pages/authentication/signup/VerifyOtpPage";
import ForgotPassword from "./pages/authentication/forgot-password/forgot-password";
import ResetPassword from "./pages/authentication/reset-password/reset-password";
import GoogleCallback from "./pages/authentication/google-callback/google-callback";

import ProfilePage from "./pages/dashboard/patient-dashboard/pages/profile";
import DoctorDashboard from "./pages/dashboard/doctor-dashboard/doctor";
import DoctorSchedule from "./pages/dashboard/doctor-dashboard/doctor-schedule";
import DoctorRecords from "./pages/dashboard/doctor-dashboard/doctor-records";
import DoctorFeedback from "./pages/dashboard/doctor-dashboard/doctor-feedback";
import DoctorAppointments from "./pages/dashboard/doctor-dashboard/doctor-appointments";
import DoctorCustomers from "./pages/dashboard/doctor-dashboard/doctor-customer";

import ReceptionistRoutes from './pages/dashboard/receptionist-dashboard/ReceptionistRoutes';
import AdminDashboard from './pages/dashboard/admin-dashboard/AdminDashboard';

import EyeServices from "./pages/servicepage/EyeServices";
import AboutPage from "./pages/aboutPage/about";
import ShopPage from "./pages/shoppage";
import ProductDetail from "./pages/ProductPage";

import PaymentHistoryPage from "./pages/dashboard/patient-dashboard/pages/PaymentHistoryPage";
import AppointmentPage from "./pages/dashboard/patient-dashboard/pages/AppointmentsPage";
import MedicalRecordsPage from "./pages/dashboard/patient-dashboard/pages/MedicalRecordsPage";
import MedicalRecordDetailPage from "./pages/dashboard/patient-dashboard/pages/MedicalRecordDetailPage";
import OrderPage from "./pages/dashboard/patient-dashboard/pages/OrdersPage";
import OrderDetailPage from "./pages/dashboard/patient-dashboard/pages/OrderDetailPage";

function App() {
  return (
      <Router>
        <div className="App">
          <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
          />
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/services" element={<EyeServices />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Doctor Dashboard */}
            <Route path="/dashboard/doctor/profile" element={<DoctorDashboard />} />
            <Route path="/dashboard/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/dashboard/doctor/records" element={<DoctorRecords />} />
            <Route path="/dashboard/doctor/feedback" element={<DoctorFeedback />} />
            <Route path="/dashboard/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/dashboard/doctor/customers" element={<DoctorCustomers />} />

            {/* Receptionist & Admin */}
            <Route path="/dashboard/receptionist/*" element={<ReceptionistRoutes />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />

            {/* Patient Dashboard */}
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/patient/payment-history" element={<PaymentHistoryPage />} />
            <Route path="/patient/appointment" element={<AppointmentPage />} />
            <Route path="/patient/medical-records" element={<MedicalRecordsPage />} />
            <Route path="/patient/medical-records/:id" element={<MedicalRecordDetailPage />} />
            <Route path="/patient/orders" element={<OrderPage />} />
            <Route path="/patient/orders/:orderId" element={<OrderDetailPage />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
