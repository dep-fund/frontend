import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 
import './ProfileView.css'; 
import logoDepFund from '../img/logo_regency.jpg';
import { API_URL } from '../../../constants';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();

  // 1. Estado para los datos que vienen del servidor
  const [userData, setUserData] = useState({
    name: '',
    last_name: '',
    username: '',
    birthdate: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}` // Enviamos el JWT
          }
        });

        setUserData(response.data);
      } catch (error) {
        console.error("Error cargando perfil", error);
        // Si el token expiró o es inválido, mandamos al login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // 3. Función para dar de baja en el Backend
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas dar de baja tu cuenta? Esta acción es permanente."
    );

    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert("Cuenta eliminada correctamente.");
        localStorage.removeItem('token'); // Limpiamos el token
        navigate('/login');
      } catch (error: any) {
        alert("Error al intentar eliminar la cuenta: " + (error.response?.data?.detail || "Intente más tarde"));
      }
    }
  };

  if (loading) {
    return <div className="loading-screen">Cargando perfil...</div>;
  }

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        <div className="visual-side">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Mi Perfil</h1>
            <p className="visual-subtitle">Tus datos están protegidos por estándares de alta seguridad.</p>
          </div>
        </div>

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
                  <input type="text" value={userData.name} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Apellido</label>
                <div className="input-input-wrapper">
                  <input type="text" value={userData.last_name} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Usuario</label>
                <div className="input-input-wrapper">
                  <input type="text" value={`@${userData.username}`} readOnly className="read-only-input highlight-user" />
                </div>
              </div>

              <div className="input-group">
                <label>Fecha de Nacimiento</label>
                <div className="input-input-wrapper">
                  <input type="date" value={userData.birthdate} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Email</label>
                <div className="input-input-wrapper">
                  <input type="email" value={userData.email} readOnly className="read-only-input" />
                </div>
              </div>

              <div className="button-group full-width">
                <Link to="/edit-profile" className="login-button">
                  Editar Información <span className="button-arrow">→</span>
                </Link>
                <Link to="/dashboard" className="btn-link-muted">Volver al Inicio</Link>
              </div>

              <div className="danger-zone full-width">
                <div className="divider"></div>
                <button type="button" className="delete-account-button" onClick={handleDeleteAccount}>
                  Dar de baja cuenta
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