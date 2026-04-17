import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 
import './RolesManager.css';
import logoDepFund from '../img/logo_regency.jpg';

// Definimos la interfaz para usarla en ambos componentes
export interface Role {
  id: number;
  nombre: string;
  permisos: string[];
}

const RolesManager: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, nombre: 'Administrador', permisos: ['Todos', 'Usuarios', 'Inversiones'] },
    { id: 2, nombre: 'Inversor', permisos: ['Ver Inversiones', 'Editar Perfil'] },
    { id: 3, nombre: 'Editor', permisos: ['Ver Usuarios', 'Publicar Noticias'] }
  ]);

  const [newRoleName, setNewRoleName] = useState('');

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRole: Role = {
      id: Date.now(),
      nombre: newRoleName,
      permisos: ['Lectura']
    };
    setRoles([...roles, newRole]);
    setNewRoleName('');
  };

  const handleDeleteRole = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas dar de baja el rol: ${nombre}?`)) {
      setRoles(roles.filter(role => role.id !== id));
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side side-narrow">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Gestión de Roles</h1>
            <p className="visual-subtitle">Controla los niveles de acceso al sistema.</p>
          </div>
        </div>

        <div className="form-side side-wide">
          <div className="form-wrapper manager-wrapper">
            <header className="auth-header">
              <h2>Administración de Roles</h2>
              <p>Visualiza, crea o gestiona los permisos de la plataforma.</p>
            </header>

            <div className="roles-table-container">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>Nombre del Rol</th>
                    <th>Permisos Asociados</th>
                    <th className="text-center">Editar</th>
                    <th className="text-center">Baja</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id}>
                      <td className="role-name-cell">{role.nombre}</td>
                      <td>
                        <div className="permissions-tags">
                          {role.permisos.map((p, idx) => (
                            <span key={idx} className="tag">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn-edit-small"
                          onClick={() => navigate(`/roles/edit/${role.id}`, { state: { role } })}
                        >
                          Editar ✏️
                        </button>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn-delete-small"
                          onClick={() => handleDeleteRole(role.id, role.nombre)}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="add-role-section">
              <div className="divider"></div>
              <h3>Dar de Alta Nuevo Rol</h3>
              <form onSubmit={handleAddRole} className="add-role-form">
                <div className="input-group">
                  <div className="input-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Nombre del nuevo rol..." 
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      required
                    />
                    <span className="input-highlight"></span>
                  </div>
                </div>
                <button type="submit" className="login-button add-btn">Dar de Alta</button>
              </form>
            </div>
            <Link to="/dashboard" className="btn-link-muted mt-20">Volver al Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesManager;