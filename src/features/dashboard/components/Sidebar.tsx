import "./Sidebar.css";
import { LayoutDashboard, Briefcase, Search, PlusCircle, ShoppingBag, User, LogOut, Wallet, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoDepFund from "/src/features/assets/img/logo_regency.jpg";

const navItems = [
  { label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Explorar", icon: Search, path: "/dashboard/explore" },
  // { label: "Invertir", icon: DollarSign, path: "/dashboard/invest" },
  // { label: "Mis Inversiones", icon: TrendingUp, path: "/dashboard/investments" },
  { label: "Mis Proyectos", icon: Briefcase, path: "/dashboard/projects" },
  { label: "Crear Proyecto", icon: PlusCircle, path: "/dashboard/projects/new" },
  { label: "Marketplace", icon: ShoppingBag, path: "/dashboard/marketplace" },
  { label: "Wallet", icon: Wallet, path: "/dashboard/wallet" },
  { label: "Mi Perfil", icon: User, path: "/dashboard/profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate("/dashboard")}>
        <img src={logoDepFund} alt="DepFund Logo" className="sidebar-logo" />
        <span className="sidebar-brand-name">
          <span className="sidebar-brand-dep">Dep</span><span className="sidebar-brand-fund">Fund</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar-item ${active ? "sidebar-item--active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}