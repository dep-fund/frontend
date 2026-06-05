import { useState } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  PlusCircle, 
  Search, 
  User,
  ShoppingBag,
  Menu, 
  X, 
  LogOut,
  Wallet,
  DollarSign,
  TrendingUp,
  Tag
} from "lucide-react";
import DashboardHome from "./pages/DashboardHome";
import MyProjects from "./pages/MyProjects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import ExploreProjects from "./pages/ExploreProjects";
import Marketplace from "./components/Marketplace";
import Profile from "./pages/Profile";
import InvestProjects from "./pages/InvestProjects";
import MyInvestments from "./pages/MyInvestments";
import InvestCheckout from "./pages/InvestCheckout";
import "./Dashboard.css";
import "./ResponsiveDashboard.css";
import logoDepFund from "../assets/img/logo_regency.jpg";
import { WalletPage } from "../wallet";
import MyListings from "./pages/MyListings";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const menuItems = [
    { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { path: "/dashboard/explore", label: "Explorar", icon: Search },
    { path: "/dashboard/invest", label: "Invertir", icon: DollarSign },
    { path: "/dashboard/investments", label: "Mis Inversiones", icon: TrendingUp },
    { path: "/dashboard/projects", label: "Mis Proyectos", icon: Briefcase },
    { path: "/dashboard/projects/new", label: "Crear Proyecto", icon: PlusCircle },
    { path: "/dashboard/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/dashboard/my-listings", label: "Mis Publicaciones", icon: Tag },
    { path: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { path: "/dashboard/profile", label: "Mi Perfil", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Header para móviles */}
      <header className="mobile-nav-header">
        <button onClick={toggleSidebar} className="menu-toggle-btn">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-brand">
          <img src={logoDepFund} alt="DepFund Logo" className="brand-logo" />
          <span className="brand-text">
            <span className="brand-dep">Dep</span><span className="brand-fund">Fund</span>
          </span>
        </div>
      </header>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`dashboard-sidebar ${isSidebarOpen ? "show" : ""}`}>
        <div className="sidebar-brand">
          <img src={logoDepFund} alt="DepFund Logo" className="brand-logo" />
          <span className="brand-text">
            <span className="brand-dep">Dep</span><span className="brand-fund">Fund</span>
          </span>
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="projects" element={<MyProjects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="explore" element={<ExploreProjects />} />
          <Route path="invest" element={<InvestProjects />} />
          <Route path="invest/:id" element={<InvestCheckout />} />
          <Route path="investments" element={<MyInvestments />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="my-listings" element={<MyListings />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
