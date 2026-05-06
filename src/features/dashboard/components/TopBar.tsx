import "./TopBar.css";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";

interface TopBarProps {
  title: string;
  user: User | null;
}

export default function TopBar({ title, user }: TopBarProps) {
  const navigate = useNavigate();

  const initials = user
    ? `${user.name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-user" onClick={() => navigate("/dashboard/profile")}>
        <div className="topbar-user-info">
          <span className="topbar-user-name">
            {user ? `${user.name} ${user.last_name}` : "Cargando..."}
          </span>
          <span className="topbar-user-email">{user?.email ?? ""}</span>
        </div>
        <div className="topbar-avatar">{initials}</div>
      </div>
    </header>
  );
}