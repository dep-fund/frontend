import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';
import { API_URL } from '../../constants';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  //const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!token) {
      setError('Token de recuperación no válido o faltante.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password/`, {
        token,
        new_password: newPassword
      });
      setSuccessMessage('Tu contraseña ha sido restablecida exitosamente.');
    } catch (err: any) {
      const serverMessage = err.response?.data?.detail || 'Error al procesar la solicitud.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page-container">
      <div className="rp-card">
        <header className="rp-auth-header">
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña a continuación para asegurar tu cuenta.</p>
        </header>

        {error && (
          <div className="rp-error-message">
            {error}
          </div>
        )}

        {!token && !successMessage && (
          <div className="rp-error-message">
            El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.
          </div>
        )}

        {successMessage ? (
          <div className="rp-success-content">
            <p>{successMessage}</p>
            <Link to="/login" className="rp-signup-link">Ir a Iniciar Sesión</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rp-input-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <div className="rp-input-wrapper">
                <input
                  type="password"
                  id="newPassword"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={!token}
                />
                <span className="rp-input-highlight"></span>
              </div>
            </div>

            <div className="rp-input-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="rp-input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!token}
                />
                <span className="rp-input-highlight"></span>
              </div>
            </div>

            <button
              type="submit"
              className="rp-button"
              disabled={loading || !token}
            >
              {loading ? 'Guardando...' : (
                <>
                  Restablecer Contraseña
                  <span className="rp-button-arrow">→</span>
                </>
              )}
            </button>
          </form>
        )}

        <footer className="rp-auth-footer">
          <p>¿Recordaste tu contraseña? <Link to="/login" className="rp-signup-link">Inicia sesión</Link></p>
        </footer>
      </div>
    </div>
  );
}
