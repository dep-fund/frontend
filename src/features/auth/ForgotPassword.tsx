import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';
import { API_URL } from '../../constants';

interface ForgotPasswordPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void; // Para permitir navegar de vuelta al login
}

export default function ForgotPassword({ isOpen, onClose, onLoginClick }: ForgotPasswordPanelProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // This is a placeholder for the actual API call
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccessMessage('Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.');
    } catch (err: any) {
      // For security, don't reveal if the email exists or not.
      // setError('Ocurrió un error. Por favor, intenta de nuevo.');
      // For development, it's okay to show the real error.
      const serverMessage = err.response?.data?.detail || 'Error al procesar la solicitud.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // No renderizar el panel si no está abierto

  return (
    <div className={`fp-panel-container ${isOpen ? 'open' : ''}`}>
      <div className="fp-backdrop" onClick={onClose}></div> {/* Click outside to close */}
      <div className="fp-panel">
        <button className="fp-close-button" onClick={onClose}>×</button> {/* Close button */}
        <header className="fp-auth-header">
          <h2>Recuperar Contraseña</h2>
          <p>Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
        </header>

        {error && (
          <div className="fp-error-message">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="fp-success-content">
            <p>{successMessage}</p>
            <Link to="#" onClick={() => { onClose(); onLoginClick(); }} className="fp-signup-link">Volver al inicio de sesión</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="fp-input-group">
              <label htmlFor="email">Email</label>
              <div className="fp-input-wrapper">
                <input
                  type="email"
                  id="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="fp-input-highlight"></span>
              </div>
            </div>

            <button
              type="submit"
              className="fp-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : (
                <>
                  Enviar Enlace
                  <span className="fp-button-arrow">→</span>
                </>
              )}
            </button>
          </form>
        )}

        <footer className="fp-auth-footer">
          <p>¿Recordaste tu contraseña? <Link to="#" onClick={() => { onClose(); onLoginClick(); }} className="fp-signup-link">Inicia sesión</Link></p>
        </footer>
      </div>
    </div>
  );
}