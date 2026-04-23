import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import logoDepFund from '../assets/img/logo_regency.jpg';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-dashboard-container">

      {/* HEADER */}
      <header className="dashboard-header">

        <div
          className="dashboard-header-brand"
          onClick={() => navigate('/dashboard')}
        >
          <img
            src={logoDepFund}
            alt="DepFund Logo"
            className="dashboard-header-logo"
          />

          <span className="dashboard-header-title">
            Dep<span>Fund</span>
          </span>
        </div>

        <nav className="dashboard-header-nav">

          <Link to="/ProfileView" className="dashboard-nav-item">
            <span className="dashboard-nav-icon"></span>
            Mi Perfil
          </Link>

          <button
            className="dashboard-logout-button"
            onClick={() => navigate('/login')}
          >
            Cerrar Sesión
          </button>

        </nav>
      </header>

      {/* CONTENIDO */}
      <main className="dashboard-content">

        <section className="dashboard-welcome-banner">

          <div className="dashboard-welcome-text">
            <h1>Bienvenido a tu Panel de Inversión</h1>
            <p>
              Gestiona tus activos deportivos y sigue el rendimiento de tus fondos en tiempo real.
            </p>
          </div>

          <div className="dashboard-quick-actions">

            <Link to="/ProfileView" className="dashboard-action-card">
              <h3>Ver mi Perfil</h3>
              <p>Revisa y edita tu información personal.</p>
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Dashboard;