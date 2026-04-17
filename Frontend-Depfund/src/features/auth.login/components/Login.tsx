import React, { useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';

// Importa el logo circular DepFund. Asegúrate de que el nombre del archivo coincida.
import logoDepFund from '../img/logo_regency.jpg';
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticación aquí
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        {/* SECCIÓN VISUAL (IZQUIERDA) - Imagen de Cancha de Basket */}
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

        {/* SECCIÓN FORMULARIO (DERECHA) */}
        <div className="form-side">
          <div className="form-wrapper">
            <header className="auth-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Introduce tus credenciales para acceder a tu panel.</p>
            </header>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-input-wrapper">
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  {/* Barra de sombreado inferior */}
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="password">Contraseña</label>
                </div>
                <div className="input-input-wrapper">
                  <input 
                    type="password" 
                    id="password" 
                    name="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  {/* Barra de sombreado inferior */}
                  <span className="input-highlight"></span>
                   <Link to="/forgot-password" className="signup-link">¿Olvidaste tu contraseña?</Link>
                </div>
              </div>

              <button type="submit" className="login-button">
                Iniciar Sesión
                <span className="button-arrow">→</span>
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