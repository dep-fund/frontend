import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { logo } from "../../assets";

export default function Navbar() {
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
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Explorar</a></li>
        <li><a href="#">Cómo funciona</a></li>
      </ul>
      <div className="navbar-actions">
        <button className="btn-outline btn-cyan" onClick={() => navigate("/login")}>Acceder</button>
        <button className="btn-primary" onClick={() => navigate("/register")}>Comenzar</button>
      </div>
    </nav>
  );
}