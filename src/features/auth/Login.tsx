import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/Login.css';
import { API_URL } from '../../constants';

// Asegúrate de que la ruta del logo sea la correcta
import logoDepFund from '../assets/img/logo_regency.jpg';

const Login: React.FC = () => {
  // 1. Estados para el formulario y el feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hook para la navegación
  const navigate = useNavigate();

  // 2. Función de envío al Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');       // Limpiar errores previos
    setLoading(true);    // Activar estado de carga

    try {
      // Petición POST con los datos que FastAPI espera
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier: email,
        password: password
      });

      // 3. Manejo de la respuesta con JWT
      if (response.data.access_token) {
        // Guardamos el JWT en el localStorage
        localStorage.setItem('token', response.data.access_token);
        
        console.log('Login exitoso');
        
        // REDIRECCIÓN AL DASHBOARD
        navigate('/dashboard');
      } else {
        setError('El servidor no devolvió un token de acceso.');
      }

    } catch (err: any) {
      // Capturamos el error de FastAPI (usualmente vienen en detail)
      const serverMessage = err.response?.data?.detail || err.response?.data?.message || 'Email o contraseña incorrectos';
      setError(serverMessage);
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        {/* SECCIÓN VISUAL (IZQUIERDA) */}
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

            {/* MUESTRA ERROR SI EXISTE */}
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

              {/* BOTÓN CON ESTADO DE CARGA */}
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