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
        if (!token) {
          navigate('/login');
          return;
        }

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

  if (loading) return <div className="pw-loading-screen">Cargando perfil...</div>;

  return (
    <div className="pw-profile-page-container">

      {/* MODAL CONFIRMACIÓN */}
      {showConfirmModal && (
        <div className="pw-modal-backdrop">
          <div className="pw-modal">
            <div className="pw-modal-icon pw-modal-icon--warning">⚠</div>
            <h3 className="pw-modal-title">¿Dar de baja tu cuenta?</h3>
            <p className="pw-modal-text">
              Esta acción es <strong>permanente</strong> y no se puede deshacer. Perderás todos tus datos.
            </p>

            {deleteError && <p className="pw-modal-error">{deleteError}</p>}

            <div className="pw-modal-buttons">
              <button
                className="pw-btn-cancel"
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteError('');
                }}
              >
                Cancelar
              </button>

              <button className="pw-btn-confirm" onClick={handleDeleteAccount}>
                Sí, dar de baja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO */}
      {showSuccessModal && (
        <div className="pw-modal-backdrop">
          <div className="pw-modal">
            <div className="pw-modal-icon pw-modal-icon--success">✓</div>
            <h3 className="pw-modal-title">Cuenta eliminada</h3>
            <p className="pw-modal-text">
              Tu cuenta fue dada de baja correctamente. Redirigiendo...
            </p>
          </div>
        </div>
      )}

      <div className="pw-profile-columns">

        {/* IZQUIERDA */}
        <div className="pw-visual-side">
          <div className="pw-dark-overlay"></div>

          <div className="pw-visual-content">
            <img
              src={logoDepFund}
              alt="DepFund Logo"
              className="pw-brand-logo-visual"
            />
            <h1 className="pw-visual-title">Mi Perfil</h1>
            <p className="pw-visual-subtitle">
              Tus datos están protegidos por estándares de alta seguridad.
            </p>
          </div>
        </div>

        {/* DERECHA */}
        <div className="pw-form-side">
          <div className="pw-form-wrapper pw-profile-wrapper-wide">

            <header className="pw-auth-header">
              <h2>Información de Cuenta</h2>
              <p>Esta es la información actual de tu perfil de inversor.</p>
            </header>

            <form className="pw-auth-form pw-profile-grid">

              <div className="pw-input-group">
                <label>Nombre</label>
                <div className="pw-input-input-wrapper">
                  <input
                    type="text"
                    value={userData.name}
                    readOnly
                    className="pw-read-only-input"
                  />
                </div>
              </div>

              <div className="pw-input-group">
                <label>Apellido</label>
                <div className="pw-input-input-wrapper">
                  <input
                    type="text"
                    value={userData.last_name}
                    readOnly
                    className="pw-read-only-input"
                  />
                </div>
              </div>

              <div className="pw-input-group">
                <label>Usuario</label>
                <div className="pw-input-input-wrapper">
                  <input
                    type="text"
                    value={`@${userData.username}`}
                    readOnly
                    className="pw-read-only-input pw-highlight-user"
                  />
                </div>
              </div>

              <div className="pw-input-group">
                <label>Fecha de Nacimiento</label>
                <div className="pw-input-input-wrapper">
                  <input
                    type="date"
                    value={userData.birthdate}
                    readOnly
                    className="pw-read-only-input"
                  />
                </div>
              </div>

              <div className="pw-input-group pw-full-width">
                <label>Email</label>
                <div className="pw-input-input-wrapper">
                  <input
                    type="email"
                    value={userData.email}
                    readOnly
                    className="pw-read-only-input"
                  />
                </div>
              </div>

              <div className="pw-button-group pw-full-width">
                <Link to="/edit-profile" className="pw-login-button">
                  Editar Información <span className="pw-button-arrow">→</span>
                </Link>
              </div>

              <div className="pw-danger-zone pw-full-width">
                <button
                  type="button"
                  className="pw-delete-account-button"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Dar de baja cuenta
                </button>
              </div>

              <div className="pw-back-home pw-full-width">
                <Link to="/dashboard" className="pw-btn-link-muted">
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