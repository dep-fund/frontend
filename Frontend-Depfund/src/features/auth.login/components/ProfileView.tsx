import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 
import './ProfileView.css'; 
import logoDepFund from '../img/logo_regency.jpg';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();

  // Estado con los datos del usuario (Lectura)
  const [userData] = useState({
    nombre: 'Juan',
    apellido: 'Pérez',
    usuario: 'juanp88',
    fechaNacimiento: '1995-05-20',
    email: 'juan@ejemplo.com',
  });

  // Función para manejar la baja de cuenta con confirmación
  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas dar de baja tu cuenta? Esta acción es permanente y perderás todo tu historial en DepFund."
    );

    if (confirmed) {
      // Aquí iría la lógica para borrar la cuenta en el backend
      console.log("Eliminando cuenta para:", userData.usuario);
      
      // Redirigir al login después de borrar
      alert("Cuenta eliminada correctamente.");
      navigate('/login');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        {/* SECCIÓN VISUAL IZQUIERDA */}
        <div className="visual-side">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Mi Perfil</h1>
            <p className="visual-subtitle">Tus datos están protegidos por estándares de alta seguridad.</p>
          </div>
        </div>

        {/* SECCIÓN FORMULARIO (MODO LECTURA) */}
        <div className="form-side">
          <div className="form-wrapper profile-wrapper-wide">
            <header className="auth-header">
              <h2>Información de Cuenta</h2>
              <p>Esta es la información actual de tu perfil de inversor.</p>
            </header>

            <form className="auth-form profile-grid">
              <div className="input-group">
                <label>Nombre</label>
                <div className="input-input-wrapper">
                  <input 
                    type="text" 
                    value={userData.nombre} 
                    readOnly 
                    className="read-only-input" 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Apellido</label>
                <div className="input-input-wrapper">
                  <input 
                    type="text" 
                    value={userData.apellido} 
                    readOnly 
                    className="read-only-input" 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Usuario</label>
                <div className="input-input-wrapper">
                  <input 
                    type="text" 
                    value={`@${userData.usuario}`} 
                    readOnly 
                    className="read-only-input highlight-user" 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Fecha de Nacimiento</label>
                <div className="input-input-wrapper">
                  <input 
                    type="date" 
                    value={userData.fechaNacimiento} 
                    readOnly 
                    className="read-only-input" 
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Email</label>
                <div className="input-input-wrapper">
                  <input 
                    type="email" 
                    value={userData.email} 
                    readOnly 
                    className="read-only-input" 
                  />
                </div>
              </div>

              {/* GRUPO DE BOTONES PRINCIPALES */}
              <div className="button-group full-width">
                <Link to="/edit-profile" className="login-button">
                  Editar Información
                  <span className="button-arrow">→</span>
                </Link>
                <Link to="/dashboard" className="btn-link-muted">
                  Volver al Inicio
                </Link>
              </div>

              {/* ZONA DE PELIGRO: DAR DE BAJA */}
              <div className="danger-zone full-width">
                <div className="divider"></div>
                <button 
                  type="button" 
                  className="delete-account-button"
                  onClick={handleDeleteAccount}
                >
                  Dar de baja cuenta ❌
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;