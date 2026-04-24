import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'; 
import logoDepFund from '../assets/img/logo_regency.jpg';

const ForgotPassword: React.FC = () => {
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

    if (cleanValue.startsWith(' ')) cleanValue = cleanValue.trimStart();
    cleanValue = cleanValue.replace(/\s/g, '');

    setFormData({ ...formData, [name]: cleanValue });
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Enviando código a:', formData.email);
    setStep(2);
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
  };

  return (
    <div className="fp-page-container">
      <div className="fp-columns">
        
        <div className="fp-visual-side">
          <div className="fp-dark-overlay"></div>
          <div className="fp-visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="fp-brand-logo-visual" />
            <h1 className="fp-visual-title">Recupera tu acceso.</h1>
            <p className="fp-visual-subtitle">Protegemos tu inversión y tu seguridad.</p>
          </div>
        </div>

        <div className="fp-form-side">
          <div className="fp-form-wrapper">
            <header className="fp-auth-header">
              <h2>{step === 1 ? '¿Olvidaste tu contraseña?' : 'Restablecer contraseña'}</h2>
            </header>

            {error && <div className="fp-error-message">{error}</div>}
            
            {success ? (
              <div className="fp-success-content">
                <p>¡Contraseña actualizada con éxito!</p>
                <Link to="/login" className="fp-button">
                  Volver al Login
                </Link>
              </div>
            ) : (
              <form onSubmit={step === 1 ? handleSendCode : handleResetPassword} className="fp-auth-form">
                
                {step === 1 ? (
                  <div className="fp-input-group">
                    <label htmlFor="email">Email</label>
                    <div className="fp-input-wrapper">
                      <input 
                        type="email" id="email" name="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                      <span className="fp-input-highlight"></span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="fp-input-group">
                      <label htmlFor="code">Código de Verificación</label>
                      <div className="fp-input-wrapper">
                        <input 
                          type="text" id="code" name="code"
                          placeholder="Ingresa el código"
                          value={formData.code}
                          onChange={handleChange}
                          required 
                        />
                        <span className="fp-input-highlight"></span>
                      </div>
                    </div>

                    <div className="fp-input-group">
                      <label htmlFor="newPassword">Nueva Contraseña</label>
                      <div className="fp-input-wrapper">
                        <input 
                          type="password" id="newPassword" name="newPassword"
                          placeholder="••••••••••••"
                          value={formData.newPassword}
                          onChange={handleChange}
                          required 
                        />
                        <span className="fp-input-highlight"></span>
                      </div>
                    </div>

                    <div className="fp-input-group">
                      <label htmlFor="confirmPassword">Repetir Nueva Contraseña</label>
                      <div className="fp-input-wrapper">
                        <input 
                          type="password" id="confirmPassword" name="confirmPassword"
                          placeholder="••••••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required 
                        />
                        <span className="fp-input-highlight"></span>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="fp-button">
                  {step === 1 ? 'Enviar Código' : 'Restablecer Contraseña'}
                  <span className="fp-button-arrow">→</span>
                </button>
              </form>
            )}

            <footer className="fp-auth-footer">
              <p>¿Recordaste tu contraseña? <Link to="/login" className="fp-signup-link">Inicia sesión</Link></p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;