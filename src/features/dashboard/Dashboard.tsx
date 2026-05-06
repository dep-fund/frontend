import { Routes, Route, Navigate } from "react-router-dom";
import DashboardHome from "./pages/DashboardHome";
import MyProjects from "./pages/MyProjects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import ExploreProjects from "./pages/ExploreProjects";
import Profile from "./pages/Profile";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      <Route path="projects" element={<MyProjects />} />
      <Route path="projects/new" element={<CreateProject />} />
      <Route path="projects/:id" element={<ProjectDetail />} />
      <Route path="explore" element={<ExploreProjects />} />
      <Route path="profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
