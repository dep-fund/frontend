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
        navigate('/dashboard');
      } else {
        setError('El servidor no devolvió un token de acceso.');
      }

    } catch (err: any) {
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Email o contraseña incorrectos';

      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-login-page-container">
      <div className="login-login-columns">

        {/* VISUAL */}
        <div className="login-visual-side">
          <div className="login-dark-overlay"></div>

          <div className="login-visual-content">
            <img
              src={logoDepFund}
              alt="DepFund Logo"
              className="login-brand-logo-visual"
            />

            <h1 className="login-visual-title">
              Invierte en el futuro del deporte.
            </h1>

            <p className="login-visual-subtitle">
              Únete a la mayor red de inversión deportiva.
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="login-form-side">
          <div className="login-form-wrapper">

            <header className="login-auth-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Introduce tus credenciales para acceder a tu panel.</p>
            </header>

            {error && (
              <div className="login-error-box">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-auth-form">

              <div className="login-input-group">
                <label htmlFor="email">Email</label>

                <div className="login-input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="login-input-highlight"></span>
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="password">Contraseña</label>

                <div className="login-input-wrapper">
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="login-input-highlight"></span>
                </div>

                <Link
                  to="/forgot-password"
                  className="login-forgot-password-link"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="login-login-button"
                disabled={loading}
              >
                {loading ? 'Entrando...' : (
                  <>
                    Iniciar Sesión
                    <span className="login-button-arrow">→</span>
                  </>
                )}
              </button>

            </form>

            <footer className="login-auth-footer">
              <p>
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="login-signup-link">
                  Crea una cuenta
                </Link>
              </p>
            </footer>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;