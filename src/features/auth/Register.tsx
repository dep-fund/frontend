import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import logoDepFund from '../assets/img/logo_regency.jpg';
import { API_URL } from '../../constants';
 
// No longer needed for the panel version
// import logoDepFund from '../assets/img/logo_regency.jpg';

interface RegisterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void; // Para permitir navegar de vuelta al login
}

export default function Register({ isOpen, onClose, onLoginClick }: RegisterPanelProps) {
  const navigate = useNavigate();

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

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (cleanValue.startsWith(' ')) cleanValue = cleanValue.trimStart();

    const fieldsWithoutSpaces = ['usuario', 'email', 'password', 'confirmPassword'];
    if (fieldsWithoutSpaces.includes(name)) {
      cleanValue = cleanValue.replace(/\s/g, '');
    }

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
      const response = await axios.post(`${API_URL}/users/register`, {
        username: formData.usuario,
        name: formData.nombre,
        last_name: formData.apellido,
        birthdate: formData.fechaNacimiento || null,
        email: formData.email,
        password: formData.password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setToast({
        message: '¡Cuenta creada! Ahora inicia sesión.',
        type: 'success'
      });

      setTimeout(() => {
        setToast(null);
        onClose(); // Cierra el panel de registro
        onLoginClick(); // Abre el panel de login
      }, 2000);

} 

catch (err: any) {

  let message = 'Error al conectar con el servidor';

  const data = err.response?.data;

  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      message = data.detail[0]?.msg || message;
    } else if (typeof data.detail === 'string') {
      message = data.detail;
    }
  } else if (data?.message) {
    message = data.message;
  }

  setToast({
    message,
    type: 'error'
  });

  setTimeout(() => setToast(null), 3000);

} finally {
  setLoading(false);
}


};

  if (!isOpen) return null; // No renderizar el panel si no está abierto

  return (
    <div className={`register-panel-container ${isOpen ? 'open' : ''}`}>
      <div className="register-backdrop" onClick={onClose}></div> {/* Click outside to close */}
      <div className="register-panel">
        <button className="register-close-button" onClick={onClose}>×</button> {/* Close button */}
        <header className="register-auth-header">
          <h2>Crea tu cuenta</h2>
          <p>Únete a DepFund y empieza a invertir.</p>
        </header>

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-input-group">
            <label>Nombre</label>
            <div className="register-input-wrapper">
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-input-group">
            <label>Apellido</label>
            <div className="register-input-wrapper">
              <input
                type="text"
                name="apellido"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-input-group">
            <label>Usuario</label>
            <div className="register-input-wrapper">
              <input
                type="text"
                name="usuario"
                placeholder="Nombre de usuario"
                value={formData.usuario}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-input-group">
            <label>Fecha de Nacimiento</label>
            <div className="register-input-wrapper">
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-input-group">
            <label>Email</label>
            <div className="register-input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-input-group">
            <label>Contraseña</label>
            <div className="register-input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-input-group">
            <label>Repetir Contraseña</label>
            <div className="register-input-wrapper">
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
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
        </footer>

      </div>
    </div>
  );
};