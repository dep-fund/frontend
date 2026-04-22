import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import logoDepFund from '../assets/img/logo_regency.jpg';
import { API_URL } from '../../constants';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario
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

  // 👉 TOAST
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Validación edad
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

  // Manejo inputs
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

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
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

      // Guardar token si viene
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // 👉 Toast success
      setToast({
        message: '¡Cuenta creada correctamente!',
        type: 'success'
      });

      setTimeout(() => {
        setToast(null);
        navigate('/login');
      }, 2000);

} 

catch (err: any) {
  console.log("ERROR COMPLETO:", err.response);
  console.log("DATA:", err.response?.data);

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

  return (
    <div className="register-page-container">

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="register-columns">
        
        {/* LADO VISUAL */}
        <div className="register-visual-side">
          <div className="register-dark-overlay"></div>
          <div className="register-visual-content">
            <img 
              src={logoDepFund} 
              alt="DepFund Logo" 
              className="register-brand-logo" 
            />
            <h1 className="register-visual-title">
              Comienza tu viaje deportivo hoy.
            </h1>
            <p className="register-visual-subtitle">
              Sé parte de la nueva era de inversión.
            </p>
          </div>
        </div>
  
        {/* FORMULARIO */}
        <div className="register-form-side">
          <div className="register-form-wrapper">
            
            <header className="register-auth-header">
              <h2>Crea tu cuenta</h2>
              <p>Únete a DepFund y empieza a invertir.</p>
            </header>
  
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
                <Link to="/login" className="register-signup-link">
                  Inicia sesión
                </Link>
              </p>
            </footer>
  
          </div>
        </div>
  
      </div>
    </div>
  );
};

export default Register;