import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import Login from './pages/authentication/login/login';
import Signup from './pages/authentication/signup/signup';
import VerifyOtpPage from "./pages/authentication/signup/VerifyOtpPage"
import FogotPassword from './pages/authentication/forgot-password/forgot-password';
import GoogleCallback from './pages/authentication/google-callback/google-callback';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<FogotPassword />} />
          <Route path="/signup/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;