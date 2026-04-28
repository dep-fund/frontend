import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';
import { API_URL } from '../../constants';
import { complejogym } from '../assets';

interface ResetPasswordPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function ResetPassword({ isOpen, onClose, onLoginClick }: ResetPasswordPanelProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
      await axios.post(`${API_URL}/auth/reset-password`, { token, new_password: newPassword });
      setSuccessMessage('Tu contraseña ha sido restablecida exitosamente.');
    } catch (err: any) {
      const serverMessage = err.response?.data?.detail || 'Error al procesar la solicitud.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`rp-panel-container ${isOpen ? 'open' : ''}`}>
      <div 
        className="rp-backdrop" 
        onClick={onClose}
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${complejogym})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      ></div> {/* Click outside to close */}
      <div className="rp-panel">
        <button className="rp-close-button" onClick={onClose}>×</button> {/* Close button */}

        <header className="rp-auth-header">
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña a continuación.</p>
        </header>

        {error && (
          <div className="rp-error-message">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="rp-success-content">
            <p>{successMessage}</p>
            <Link to="#" onClick={() => { onClose(); onLoginClick(); }} className="rp-signup-link">Ir a Iniciar Sesión</Link>
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
                />
                <span className="rp-input-highlight"></span>
              </div>
            </div>

            <button
              type="submit"
              className="rp-button"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (
                <>
                  Restablecer
                  <span className="rp-button-arrow">→</span>
                </>
              )}
            </button>
          </form>
        )}

        <footer className="rp-auth-footer">
          <p>¿Recordaste tu contraseña? <Link to="#" onClick={() => { onClose(); onLoginClick(); }} className="rp-signup-link">Inicia sesión</Link></p>
        </footer>
      </div>
    </div>
  );
}
