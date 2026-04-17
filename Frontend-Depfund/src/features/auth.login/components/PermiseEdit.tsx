    import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Login.css';
import './RoleEdit.css';
import logoDepFund from '../img/logo_regency.jpg';

const PermiseEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.permiso;

  const [accion, setAccion] = useState(data?.accion || '');

  if (!data) return <div className="login-page-container">Error: Permiso no encontrado.</div>;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Acción actualizada para ${data.usuario}: ${accion}`);
    navigate('/permisos');
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side side-narrow">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Editar Permiso</h1>
          </div>
        </div>

        <div className="form-side side-wide">
          <div className="form-wrapper manager-wrapper">
            <header className="auth-header">
              <h2>Editar Permisos</h2>
            </header>

            <form onSubmit={handleUpdate} className="auth-form">

              <div className="input-group">
                <div className="input-input-wrapper">
                  <input 
                    type="text" 
                    value={accion} 
                    onChange={(e) => setAccion(e.target.value)}
                    required
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="button-group-row">
                <button type="submit" className="login-button">Actualizar Permiso</button>
                <Link to="/permisos" className="btn-link-muted">Cancelar</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermiseEdit;