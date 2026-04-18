import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 
import logoDepFund from '../img/logo_regency.jpg';
import { API_URL } from '../../../constants';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // 1. Estados
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
  const [loading, setLoading] = useState(false);

  // 2. Validación de mayoría de edad
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

  // 3. Manejador de cambios (Inputs)
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

  // 4. Lógica de conexión con el Backend (JWT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones locales antes de pegarle a la API
    if (!isOlderThan18(formData.fechaNacimiento)) {
      setError('Debes ser mayor de 18 años para registrarte.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // Petición POST al endpoint de registro
      const response = await axios.post(`${API_URL}/users/register`, {
        username: formData.usuario,
        name: formData.nombre,
        last_name: formData.apellido,
        birthdate: formData.fechaNacimiento || null,
        email: formData.email,
        password: formData.password
      });

      // Si el backend responde con JWT inmediatamente tras el registro:
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Opcional: axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      console.log('Registro exitoso:', response.data);
      alert('¡Cuenta creada correctamente!');
      navigate('/login');

    } catch (err: any) {
      // Captura el error del backend (ej: "El email ya existe")
      const serverMessage = err.response?.data?.message || 'Error al conectar con el servidor';
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
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Comienza tu viaje deportivo hoy.</h1>
            <p className="visual-subtitle">Sé parte de la nueva era de inversión.</p>
          </div>
        </div>

        <div className="form-side">
          <div className="form-wrapper">
            <header className="auth-header">
              <h2>Crea tu cuenta</h2>
              <p>Únete a DepFund y empieza a invertir.</p>
            </header>

            {error && (
              <div className="error-box" style={{ 
                backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', 
                borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', 
                fontWeight: 'bold', borderLeft: '4px solid #c53030' 
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Nombre</label>
                <div className="input-input-wrapper">
                  <input type="text" name="nombre" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Apellido</label>
                <div className="input-input-wrapper">
                  <input type="text" name="apellido" placeholder="Tu apellido" value={formData.apellido} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Usuario</label>
                <div className="input-input-wrapper">
                  <input type="text" name="usuario" placeholder="Nombre de usuario" value={formData.usuario} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Fecha de Nacimiento</label>
                <div className="input-input-wrapper">
                  <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Email</label>
                <div className="input-input-wrapper">
                  <input type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-input-wrapper">
                  <input type="password" name="password" placeholder="••••••••••••" value={formData.password} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Repetir Contraseña</label>
                <div className="input-input-wrapper">
                  <input type="password" name="confirmPassword" placeholder="••••••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Procesando...' : 'Registrarse'}
                {!loading && <span className="button-arrow">→</span>}
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