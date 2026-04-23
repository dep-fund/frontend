import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProfile.css';
import logoDepFund from '../assets/img/logo_regency.jpg';
import { API_URL } from '../../constants';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    birthdate: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFormData(response.data);

      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes('password')) {
      setPasswordData({
        ...passwordData,
        [name]: value.replace(/\s/g, '')
      });
    } else {
      setFormData({
        ...formData,
        [name]: value.trimStart()
      });
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`
      };

      await axios.patch(`${API_URL}/users/me`, formData, { headers });

      if (passwordData.old_password || passwordData.new_password) {
        if (passwordData.new_password !== passwordData.confirm_new_password) {
          throw new Error('Las nuevas contraseñas no coinciden');
        }

        await axios.post(
          `${API_URL}/users/me/change-password`,
          {
            old_password: passwordData.old_password,
            new_password: passwordData.new_password
          },
          { headers }
        );
      }

      showToast('Perfil actualizado correctamente', 'success');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      showToast(
        err.response?.data?.detail ||
        err.message ||
        'Error al actualizar',
        'error'
      );

    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="ep-loading-screen">Cargando datos...</div>;
  }

  return (
    <>
      {toast && (
        <div className={`ep-toast ep-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="ep-page-container">
        <div className="ep-columns">

          {/* LEFT */}
          <div className="ep-visual-side">
            <div className="ep-overlay"></div>

            <div className="ep-visual-content">
              <img src={logoDepFund} className="ep-logo" alt="DepFund" />
              <h2>Ajustes</h2>
            </div>
          </div>

          {/* RIGHT */}
          <div className="ep-form-side">
            <div className="ep-wrapper">

              <header className="ep-header">
                <h2>Editar Información</h2>
              </header>

              <form onSubmit={handleSubmit} className="ep-form">

                <div className="ep-group">
                  <label>Nombre</label>
                  <input name="name" value={formData.name} onChange={handleChange} />
                </div>

                <div className="ep-group">
                  <label>Apellido</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} />
                </div>

                <div className="ep-group ep-full">
                  <label>Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="ep-section ep-full">Seguridad</div>

                <div className="ep-group ep-full">
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-group">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-group">
                  <label>Repetir</label>
                  <input
                    type="password"
                    name="confirm_new_password"
                    value={passwordData.confirm_new_password}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-buttons">

                  <button className="ep-primary-button" disabled={updating}>
                    {updating ? 'Guardando...' : 'Guardar cambios'}
                  </button>

                  <Link to="/ProfileView" className="ep-secondary-button">
                    Cancelar
                  </Link>

                </div>

              </form>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default EditProfile;