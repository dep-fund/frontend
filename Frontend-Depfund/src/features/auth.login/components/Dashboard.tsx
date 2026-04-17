import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import logoDepFund from '../img/logo_regency.jpg';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* HEADER / NAVBAR */}
      <header className="dashboard-header">
        <div className="header-brand" onClick={() => navigate('/dashboard')}>
          <img src={logoDepFund} alt="DepFund Logo" className="header-logo" />
          <span className="header-title">Dep<span>Fund</span></span>
        </div>

        <nav className="header-nav">
          <Link to="/ProfileView" className="nav-item">
            <span className="nav-icon"></span>
            Mi Perfil
          </Link>
          <button className="logout-button" onClick={() => navigate('/login')}>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-content">
        <section className="welcome-banner">
          <div className="welcome-text">
            <h1>Bienvenido a tu Panel de Inversión</h1>
            <p>Gestiona tus activos deportivos y sigue el rendimiento de tus fondos en tiempo real.</p>
          </div>
          <div className="quick-actions">
            <Link to="/ProfileView" className="action-card">
              <h3>Ver mi Perfil</h3>
              <p>Revisa y edita tu información personal.</p>
            </Link>
            {/* Aquí podrías agregar más tarjetas como "Ver Inversiones", etc. */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;