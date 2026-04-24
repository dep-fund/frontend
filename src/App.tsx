import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";
import EditProfile from "./features/profile/EditProfile";
import ProfileView from "./features/profile/ProfileView";
import Dashboard from "./features/dashboard/Dashboard";
import LandingPage from "./features/landing/LandingPage";
// import RolesManager from "./features/auth.login/components/RolesManager";
// import RoleEdit from "./features/auth.login/components/RoleEdit";
// import PermiseManager from "./features/auth.login/components/PermiseManager";
// import PermiseEdit from "./features/auth.login/components/PermiseEdit";
// import Users from "./features/auth.login/components/Users";
// import UserRolEdit from "./features/auth.login/components/UserRolEdit";


const App: React.FC = () => {
  return (
    <Routes>
      {/* Redirige la raíz (/) al login por defecto */}
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/ProfileView" element={<ProfileView />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* <Route path="/RolesManager" element={<RolesManager />} />
      <Route path="/roles" element={<RolesManager />} />
      <Route path="/roles/edit/:id" element={<RoleEdit />} />
      <Route path="/permisos" element={<PermiseManager />} />
      <Route path="/permisos/edit/:id" element={<PermiseEdit />} />
      <Route path="/users" element={<Users />} />
<Route path="/users/edit-role/:id" element={<UserRolEdit />} /> */}
    </Routes>
  );
};

export default App;