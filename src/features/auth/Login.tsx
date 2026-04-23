import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { API_URL } from '../../constants';

import logoDepFund from '../assets/img/logo_regency.jpg';

const Login: React.FC = () => {
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

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        <div className="visual-side">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img 
              src={logoDepFund} 
              alt="DepFund Logo" 
              className="brand-logo-visual" 
            />
            <h1 className="visual-title">Invierte en el futuro del deporte.</h1>
            <p className="visual-subtitle">
              Únete a la mayor red de inversión deportiva.
            </p>
          </div>
        </div>

        <div className="form-side">
          <div className="form-wrapper">
            <header className="auth-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Introduce tus credenciales para acceder a tu panel.</p>
            </header>

            {error && (
              <div style={{ 
                backgroundColor: '#fff5f5', 
                color: '#c53030', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                borderLeft: '4px solid #c53030'
              }}>
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
                <Link to="/forgot-password" style={{fontSize: '0.85rem', color: 'var(--primary-orange)', textDecoration: 'none', marginTop: '5px', display: 'block'}}>
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
              <p>¿No tienes cuenta? <Link to="/register" className="signup-link">Crea una cuenta</Link></p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;