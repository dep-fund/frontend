import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";
import EditProfile from "./features/profile/EditProfile";
import ProfileView from "./features/profile/ProfileView";
import Dashboard from "./features/dashboard/Dashboard";
import LandingPage from "./features/landing/LandingPage";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Login
        isOpen={true}
        onClose={() => navigate('/')}
        onRegisterClick={() => setShowRegister(true)}
        onForgotPasswordClick={() => setShowForgot(true)}
      />
      <Register
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onLoginClick={() => setShowRegister(false)}
      />
      <ForgotPassword
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        onLoginClick={() => setShowForgot(false)}
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

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ForgotPassword
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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/ProfileView" element={<ProfileView />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default App;