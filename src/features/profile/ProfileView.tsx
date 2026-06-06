import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileView.css'; 
import logoDepFund from '../assets/img/logo_regency.jpg';
import { API_URL } from '../../constants';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: '',
    last_name: '',
    username: '',
    birthdate: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login');
      }, 2500);

    } catch (error: any) {
      setDeleteError(error.response?.data?.detail || 'Intente más tarde');
    }
  };

  if (loading) return <div className="loading-screen">Cargando perfil...</div>;

  return (
    <div className="profile-page-container">

      {showConfirmModal && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal">
            <div className="pv-modal-icon pv-modal-icon--warning">⚠</div>
            <h3 className="pv-modal-title">¿Dar de baja tu cuenta?</h3>
            <p className="pv-modal-text">Esta acción es <strong>permanente</strong> y no se puede deshacer. Perderás todos tus datos.</p>
            {deleteError && <p className="pv-modal-error">{deleteError}</p>}
            <div className="pv-modal-buttons">
              <button className="pv-btn-cancel" onClick={() => { setShowConfirmModal(false); setDeleteError(''); }}>
                Cancelar
              </button>
              <button className="pv-btn-confirm" onClick={handleDeleteAccount}>
                Sí, dar de baja
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal">
            <div className="pv-modal-icon pv-modal-icon--success">✓</div>
            <h3 className="pv-modal-title">Cuenta eliminada</h3>
            <p className="pv-modal-text">Tu cuenta fue dada de baja correctamente. Redirigiendo...</p>
          </div>
        </div>
      )}

      <div className="profile-columns">
        
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
              </div>

              <div className="danger-zone full-width">
                <button
                  type="button"
                  className="delete-account-button"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Dar de baja cuenta
                </button>
              </div>

              <div className="back-home full-width">
                <Link to="/dashboard" className="btn-link-muted">
                  Volver al Inicio
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;