import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'; 
import logoDepFund from '../img/logo_regency.jpg';

const ForgotPassword: React.FC = () => {
  // Estado para controlar en qué paso estamos (1: Pedir Mail, 2: Resetear)
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    // No permitir espacios en ninguno de estos campos
    if (cleanValue.startsWith(' ')) cleanValue = cleanValue.trimStart();
    cleanValue = cleanValue.replace(/\s/g, '');

    setFormData({ ...formData, [name]: cleanValue });
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Enviando código a:', formData.email);
    // Aquí iría la llamada al backend para enviar el mail
    setStep(2); // Pasamos al siguiente paso
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    console.log('Restableciendo con código:', formData.code);
    setSuccess(true);
    // Aquí iría la llamada final al backend
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        <div className="visual-side">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Recupera tu acceso.</h1>
            <p className="visual-subtitle">Protegemos tu inversión y tu seguridad.</p>
          </div>
        </div>

        <div className="form-side">
          <div className="form-wrapper">
            <header className="auth-header">
              <h2>{step === 1 ? '¿Olvidaste tu contraseña?' : 'Restablecer contraseña'}</h2>
              {/* <p>
                {step === 1 
                  ? 'Ingresa tu correo para recibir un código de verificación.' 
                  : 'Ingresa el código que enviamos a tu mail y tu nueva clave.'}
              </p> */}
            </header>

            {error && <div className="error-message" style={{color: 'red', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}
            
            {success ? (
              <div className="success-content">
                <p style={{color: '#2D5B63', fontWeight: 'bold'}}>¡Contraseña actualizada con éxito!</p>
                <Link to="/login" className="login-button" style={{textDecoration: 'none', display: 'block', textAlign: 'center'}}>
                  Volver al Login
                </Link>
              </div>
            ) : (
              <form onSubmit={step === 1 ? handleSendCode : handleResetPassword} className="auth-form">
                
                {step === 1 ? (
                  /* PASO 1: MAIL */
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
                ) : (
                  /* PASO 2: CÓDIGO Y PASSWORDS */
                  <>
                    <div className="input-group">
                      <label htmlFor="code">Código de Verificación</label>
                      <div className="input-input-wrapper">
                        <input 
                          type="text" id="code" name="code"
                          placeholder="Ingresa el código"
                          value={formData.code}
                          onChange={handleChange}
                          required 
                        />
                        <span className="input-highlight"></span>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="newPassword">Nueva Contraseña</label>
                      <div className="input-input-wrapper">
                        <input 
                          type="password" id="newPassword" name="newPassword"
                          placeholder="••••••••••••"
                          value={formData.newPassword}
                          onChange={handleChange}
                          required 
                        />
                        <span className="input-highlight"></span>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="confirmPassword">Repetir Nueva Contraseña</label>
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
                  </>
                )}

                <button type="submit" className="login-button">
                  {step === 1 ? 'Enviar Código' : 'Restablecer Contraseña'}
                  <span className="button-arrow">→</span>
                </button>
              </form>
            )}

            <footer className="auth-footer">
              <p>¿Recordaste tu contraseña? <Link to="/login" className="signup-link">Inicia sesión</Link></p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;