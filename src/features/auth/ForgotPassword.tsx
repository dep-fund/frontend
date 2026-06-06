import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';
import { API_URL } from '../../constants';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  //const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccessMessage('Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.');
    } catch (err: any) {
      const serverMessage = err.response?.data?.detail || 'Error al procesar la solicitud.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page-container">
      <div className="fp-card">
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
            <Link to="/login" className="fp-signup-link">Volver al inicio de sesión</Link>
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
          <p>¿Recordaste tu contraseña? <Link to="/login" className="fp-signup-link">Inicia sesión</Link></p>
        </footer>
      </div>
    </div>
  );
}