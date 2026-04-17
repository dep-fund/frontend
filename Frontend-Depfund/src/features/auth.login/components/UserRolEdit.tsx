import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Login.css';
import './RoleEdit.css';
import logoDepFund from '../img/logo_regency.jpg';

const UserRolEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.user;

  // Roles disponibles para el selector
  const [rolesExistentes] = useState(['Administrador', 'Inversor', 'Editor', 'Auditor']);
  const [selectedRol, setSelectedRol] = useState(userData?.rol || '');

  if (!userData) return <div className="login-page-container">Error: Usuario no encontrado.</div>;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Rol de ${userData.usuario} actualizado a: ${selectedRol}`);
    navigate('/users');
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side side-narrow">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Asignar Rol</h1>
            <p className="visual-subtitle">Modifica los privilegios de @{userData.usuario}.</p>
          </div>
        </div>

        <div className="form-side side-wide">
          <div className="form-wrapper manager-wrapper">
            <header className="auth-header">
              <h2>Cambiar Rol de Usuario</h2>
              <p>Los datos personales no son modificables desde esta vista.</p>
            </header>

            <form onSubmit={handleUpdate} className="auth-form profile-grid">
              <div className="input-group">
                <label>Usuario</label>
                <div className="input-input-wrapper">
                  <input type="text" value={`@${userData.usuario}`} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Nombre</label>
                <div className="input-input-wrapper">
                  <input type="text" value={userData.nombre} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Apellido</label>
                <div className="input-input-wrapper">
                  <input type="text" value={userData.apellido} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Email</label>
                <div className="input-input-wrapper">
                  <input type="text" value={userData.email} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group full-width">
                <label style={{ color: 'var(--primary-orange)', fontWeight: '800' }}>Seleccionar Nuevo Rol</label>
                <div className="input-input-wrapper">
                  <select 
                    className="custom-select"
                    value={selectedRol}
                    onChange={(e) => setSelectedRol(e.target.value)}
                    required
                  >
                    {rolesExistentes.map((rol, idx) => (
                      <option key={idx} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="button-group-row full-width">
                <button type="submit" className="login-button">
                  Guardar Nuevo Rol
                </button>
                <Link to="/users" className="btn-link-muted">Cancelar</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRolEdit;