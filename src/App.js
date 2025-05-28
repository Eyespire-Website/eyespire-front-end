import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Homepage from './pages/homepage';
import Login from './pages/authentication/login/login';
import Signup from './pages/authentication/signup/signup';
import FogotPassword from './pages/authentication/forgot-password/forgot-password';
import GoogleCallback from './pages/authentication/google-callback/google-callback';
import ProfilePage from './pages/dashboard/patient-dashboard/profile';

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
            <Route path="/forgot" element={<FogotPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;