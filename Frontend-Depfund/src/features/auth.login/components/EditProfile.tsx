import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 
import './EditProfile.css'; 
import logoDepFund from '../img/logo_regency.jpg';
import { API_URL } from '../../../constants';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado para datos generales
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    birthdate: '',
    email: '',
  });

  // Estado para el cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 1. CARGAR DATOS ACTUALES
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFormData({
          name: response.data.name,
          last_name: response.data.last_name,
          birthdate: response.data.birthdate,
          email: response.data.email,
        });
      } catch (err: any) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  // 2. MANEJAR CAMBIOS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si el campo pertenece a la contraseña, actualizar passwordData
    if (name.includes('password')) {
      setPasswordData({ ...passwordData, [name]: value.replace(/\s/g, '') });
    } else {
      setFormData({ ...formData, [name]: value.startsWith(' ') ? value.trimStart() : value });
    }
  };

  // 3. GUARDAR CAMBIOS DE PERFIL Y CONTRASEÑA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // A. Actualizar datos básicos
      await axios.patch(`${API_URL}/users/me`, formData, { headers });

      // B. Actualizar contraseña (solo si completó los campos)
      if (passwordData.old_password || passwordData.new_password) {
        if (passwordData.new_password !== passwordData.confirm_new_password) {
          throw new Error("Las nuevas contraseñas no coinciden");
        }
        
        await axios.post(`${API_URL}/users/me/change-password`, {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        }, { headers });
      }

      setSuccess('¡Perfil y contraseña actualizados!');
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-screen">Cargando datos...</div>;

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side" style={{ flex: '0.4' }}>
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h2 className="visual-title" style={{ fontSize: '2rem' }}>Ajustes</h2>
          </div>
        </div>

        <div className="form-side" style={{ flex: '0.6' }}>
          <div className="form-wrapper" style={{ maxWidth: '600px' }}>
            <header className="auth-header">
              <h2>Editar Información</h2>
            </header>

            {error && <div className="error-box-mini" style={{color: '#c53030', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{error}</div>}
            {success && <div className="success-box-mini" style={{color: '#2d5b63', backgroundColor: '#e6fffa', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* Datos Básicos */}
              <div className="input-group">
                <label>Nombre</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Apellido</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              {/* SECCIÓN CONTRASEÑA */}
              <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Seguridad</h3>
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Contraseña Actual</label>
                <input type="password" name="old_password" placeholder="Tu contraseña actual" value={passwordData.old_password} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Nueva Contraseña</label>
                <input type="password" name="new_password" placeholder="Mín. 6 caracteres" value={passwordData.new_password} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Repetir Nueva</label>
                <input type="password" name="confirm_new_password" placeholder="Repetir nueva" value={passwordData.confirm_new_password} onChange={handleChange} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="login-button" style={{ flex: 1 }} disabled={updating}>
                  {updating ? 'Procesando...' : 'Guardar Cambios'}
                </button>
                <Link to="/profile" className="login-button" style={{ flex: 1, backgroundColor: '#718096', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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