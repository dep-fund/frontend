import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth.login/components/Login";
import Register from "./features/auth.login/components/Register";
import ForgotPassword from "./features/auth.login/components/ForgotPassword";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Redirige la raíz (/) al login por defecto */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default App;