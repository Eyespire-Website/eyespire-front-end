import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import Login from './pages/authentication/login/login';
import GoogleCallback from './pages/authentication/google-callback/google-callback';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;