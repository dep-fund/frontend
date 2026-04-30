import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";
import EditProfile from "./features/profile/EditProfile";
import ProfileView from "./features/profile/ProfileView";
import Dashboard from "./features/dashboard/Dashboard";
import LandingPage from "./features/landing/LandingPage";
import GoogleCallback from './features/oauth/Googlecallback';
import ResetPassword from "./features/auth/ResetPassword";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Login
        isOpen={true}
        onClose={() => navigate('/')}
        onRegisterClick={() => setShowRegister(true)}
        onForgotPasswordClick={() => navigate('/forgot-password')}
      />
      <Register
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onLoginClick={() => setShowRegister(false)}
      />
    </>
  );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Register
      isOpen={true}
      onClose={() => navigate('/')}
      onLoginClick={() => navigate('/login')}
    />
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/ProfileView" element={<ProfileView />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />
    </Routes>
  );
};

export default App;