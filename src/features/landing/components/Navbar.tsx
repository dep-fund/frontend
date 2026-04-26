import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { logo } from "../../assets";

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void; // Nuevo prop
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <img src={logo} alt="DepFund" />
        </div>
        <span className="navbar-name">
          <span className="brand-dep">Dep</span><span className="brand-fund">Fund</span>
        </span>
      </div>
      <ul className="navbar-links">
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#explorar">Explorar</a></li>
        <li><a href="#como-funciona">Cómo funciona</a></li>
      </ul>
      <div className="navbar-actions">
        <button className="btn-outline btn-cyan" onClick={onLoginClick}>Acceder</button>
        <button className="btn-primary" onClick={onRegisterClick}>Comenzar</button>
      </div>
    </nav>
  );
}