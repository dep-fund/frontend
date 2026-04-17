import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EditProfile.css'; 
import logoDepFund from '../img/logo_regency.jpg';

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    fechaNacimiento: '',
    email: '',
    password: '', // Para confirmar cambios o cambiarla
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Simulamos la carga de datos actuales del usuario
  useEffect(() => {
    setFormData({
      nombre: 'Juan',
      apellido: 'Pérez',
      usuario: 'juanp88',
      fechaNacimiento: '1995-05-20',
      email: 'juan@ejemplo.com',
      password: ''
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (cleanValue.startsWith(' ')) cleanValue = cleanValue.trimStart();
    
    // Usuario y Email sin espacios
    if (['usuario', 'email', 'password'].includes(name)) {
      cleanValue = cleanValue.replace(/\s/g, '');
    }

    setFormData({ ...formData, [name]: cleanValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Aquí podrías validar nuevamente la edad si cambian la fecha
    console.log('Datos actualizados:', formData);
    setSuccess('¡Perfil actualizado con éxito!');
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        
        {/* Mantenemos una versión reducida de la sección visual para consistencia */}
        <div className="visual-side" style={{ flex: '0.4' }}>
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h2 className="visual-title" style={{ fontSize: '2rem' }}>Mi Perfil</h2>
            <p className="visual-subtitle">Mantén tu información actualizada.</p>
          </div>
        </div>

        <div className="form-side" style={{ flex: '0.6' }}>
          <div className="form-wrapper" style={{ maxWidth: '600px' }}>
            <header className="auth-header">
              <h2>Editar Información</h2>
              <p>Modifica los campos que desees actualizar.</p>
            </header>

            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            {success && <div className="success-message" style={{color: '#2D5B63', fontWeight: 'bold', marginBottom: '10px'}}>{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              <div className="input-group">
                <label>Nombre</label>
                <div className="input-input-wrapper">
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Apellido</label>
                <div className="input-input-wrapper">
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group">
                <label>Usuario</label>
                <div className="input-input-wrapper">
                  <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} required />
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

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Email</label>
                <div className="input-input-wrapper">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Contraseña</label>
                <div className="input-input-wrapper">
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                  <span className="input-highlight"></span>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                <button type="submit" className="login-button" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
                <Link to="/dashboard" className="login-button" style={{ flex: 1, backgroundColor: '#718096', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;