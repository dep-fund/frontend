import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import { API_URL } from '../../constants';
import './googlebutton.css';

interface RegisterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function Register({ isOpen, onClose, onLoginClick }: RegisterPanelProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isOlderThan18 = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;
    if (cleanValue.startsWith(' ')) cleanValue = cleanValue.trimStart();
    const fieldsWithoutSpaces = ['usuario', 'email', 'password', 'confirmPassword'];
    if (fieldsWithoutSpaces.includes(name)) cleanValue = cleanValue.replace(/\s/g, '');
    setFormData({ ...formData, [name]: cleanValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOlderThan18(formData.fechaNacimiento)) {
      setToast({ message: 'Debes ser mayor de 18 años.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Las contraseñas no coinciden.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/users/register`, {
        username: formData.usuario,
        name: formData.nombre,
        last_name: formData.apellido,
        birthdate: formData.fechaNacimiento || null,
        email: formData.email,
        password: formData.password
      });

      setToast({ message: '¡Cuenta creada! Ahora inicia sesión.', type: 'success' });
      setTimeout(() => {
        setToast(null);
        onClose();
        onLoginClick();
      }, 2000);
    } catch (err: any) {
      let message = 'Error al conectar con el servidor';
      const data = err.response?.data;
      if (data?.detail) {
        if (Array.isArray(data.detail)) message = data.detail[0]?.msg || message;
        else if (typeof data.detail === 'string') message = data.detail;
      } else if (data?.message) {
        message = data.message;
      }
      setToast({ message, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  if (!isOpen) return null;

  return (
    <div className={`register-panel-container ${isOpen ? 'open' : ''}`}>
      <div className="register-backdrop" onClick={onClose}></div>
      <div className="register-panel">
        <button className="register-close-button" onClick={onClose}>×</button>
        <header className="register-auth-header">
          <h2>Crea tu cuenta</h2>
          <p>Únete a DepFund y empieza a invertir.</p>
        </header>

        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}



        <form onSubmit={handleSubmit}>
          <div className="register-input-group">
            <label>Nombre</label>
            <div className="register-input-wrapper">
              <input type="text" name="nombre" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-input-group">
            <label>Apellido</label>
            <div className="register-input-wrapper">
              <input type="text" name="apellido" placeholder="Tu apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-input-group">
            <label>Usuario</label>
            <div className="register-input-wrapper">
              <input type="text" name="usuario" placeholder="Nombre de usuario" value={formData.usuario} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-input-group">
            <label>Fecha de Nacimiento</label>
            <div className="register-input-wrapper">
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-input-group">
            <label>Email</label>
            <div className="register-input-wrapper">
              <input type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-input-group">
            <label>Contraseña</label>
            <div className="register-input-wrapper">
              <input type="password" name="password" placeholder="••••••••••••" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-input-group">
            <label>Repetir Contraseña</label>
            <div className="register-input-wrapper">
              <input type="password" name="confirmPassword" placeholder="••••••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Procesando...' : 'Registrarse'}
          </button>
        </form>

        <footer className="register-auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="#" onClick={() => { onClose(); onLoginClick(); }} className="register-signup-link">
              Inicia sesión
            </Link>
          </p>
        <div className="divider">
          <span>o</span>
        </div>

        <button className="google-button" onClick={handleGoogleRegister} type="button">
          <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>
        </footer>
      </div>
    </div>
  );
}