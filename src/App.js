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
import ReceptionistRoutes from './pages/dashboard/receptionist-dashboard/ReceptionistRoutes';
import DoctorRoutes from './pages/dashboard/doctor-dashboard/DoctorRoutes';
import AdminRoutes from './pages/dashboard/admin-dashboard/AdminRoutes';
import PatientRoutes from './pages/dashboard/patient-dashboard/PatientRoutes';
import EyeServices from "./pages/servicepage/EyeServices";
import AboutPage from "./pages/aboutPage/about";
import ShopPage from "./pages/shoppage";
import ProductDetail from "./pages/ProductPage";


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
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/services" element={<EyeServices />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Sử dụng các route components mới */}
          <Route path="/dashboard/receptionist/*" element={<ReceptionistRoutes />} />
          <Route path="/dashboard/doctor/*" element={<DoctorRoutes />} />
          <Route path="/dashboard/admin/*" element={<AdminRoutes />} />
          <Route path="/dashboard/patient/*" element={<PatientRoutes />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
