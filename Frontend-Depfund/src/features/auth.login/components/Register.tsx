import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; 
import logoDepFund from '../img/logo_regency.jpg';

const Register: React.FC = () => {
  // 1. Estado con todos los campos independientes
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  // 2. Función para validar mayoría de edad (18+)
  const isOlderThan18 = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  // 3. Manejador de cambios con limpieza de espacios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    // Evitar espacios al inicio en cualquier campo
    if (cleanValue.startsWith(' ')) {
      cleanValue = cleanValue.trimStart();
    }

    // Prohibir espacios TOTALMENTE en campos técnicos
    const fieldsWithoutSpaces = ['usuario', 'email', 'password', 'confirmPassword'];
    if (fieldsWithoutSpaces.includes(name)) {
      cleanValue = cleanValue.replace(/\s/g, '');
    }

    setFormData({
      ...formData,
      [name]: cleanValue
    });
  };

  // 4. Manejador del envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isOlderThan18(formData.fechaNacimiento)) {
      setError('Debes ser mayor de 18 años para registrarte.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    console.log('Datos listos para enviar:', formData);
    // Aquí conectarías con tu servicio de Backend
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        {/* LADO IZQUIERDO: VISUAL */}
        <div className="visual-side">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Comienza tu viaje deportivo hoy.</h1>
            <p className="visual-subtitle">Sé parte de la nueva era de inversión.</p>
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="form-side">
          <div className="form-wrapper">
            <header className="auth-header">
              <h2>Crea tu cuenta</h2>
              <p>Únete a DepFund y empieza a invertir.</p>
            </header>

            {/* Mostrar error si existe */}
            {error && (
              <div style={{ 
                backgroundColor: '#fff5f5', 
                color: '#c53030', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                borderLeft: '4px solid #c53030'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              
              <div className="input-group">
                <label htmlFor="nombre">Nombre</label>
                <div className="input-input-wrapper">
                  <input 
                    type="text" id="nombre" name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="apellido">Apellido</label>
                <div className="input-input-wrapper">
                  <input 
                    type="text" id="apellido" name="apellido"
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="usuario">Usuario</label>
                <div className="input-input-wrapper">
                  <input 
                    type="text" id="usuario" name="usuario"
                    placeholder="Nombre de usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                <div className="input-input-wrapper">
                  <input 
                    type="date" id="fechaNacimiento" name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-input-wrapper">
                  <input 
                    type="email" id="email" name="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-input-wrapper">
                  <input 
                    type="password" id="password" name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Repetir Contraseña</label>
                <div className="input-input-wrapper">
                  <input 
                    type="password" id="confirmPassword" name="confirmPassword"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                  />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <button type="submit" className="login-button">
                Registrarse
                <span className="button-arrow">→</span>
              </button>
            </form>

            <footer className="auth-footer">
              <p>¿Ya tienes cuenta? <Link to="/login" className="signup-link">Inicia sesión</Link></p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;