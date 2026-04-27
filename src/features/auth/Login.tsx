import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { API_URL } from '../../constants';


interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

const Login: React.FC<LoginPanelProps> = ({ isOpen, onClose, onRegisterClick, onForgotPasswordClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');    
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier: email,
        password: password
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        console.log('Login exitoso');
        
        navigate('/dashboard');
        onClose();
      } else { 
        setError('El servidor no devolvió un token de acceso.');
      }

    } catch (err: any) {
      const serverMessage = err.response?.data?.detail || err.response?.data?.message || 'Email o contraseña incorrectos';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`login-panel-container ${isOpen ? 'open' : ''}`}>
      <div className="login-backdrop" onClick={onClose}></div> {/* Click outside to close */}
      <div className="login-panel">
        <button className="login-close-button" onClick={onClose}>×</button> {/* Close button */}
            <header className="auth-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Introduce tus credenciales para acceder a tu panel.</p>
            </header>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-input-wrapper">
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-input-wrapper">
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
                <Link to="#" onClick={() => { onClose(); onForgotPasswordClick(); }} className="forgot-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : (
                  <>
                    Iniciar Sesión
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <footer className="auth-footer">
              <p>¿No tienes cuenta? <Link to="#" onClick={() => { onClose(); onRegisterClick(); }} className="signup-link">Crea una cuenta</Link></p>
            </footer>
        </div>
      </div>

  );
};

export default Login;