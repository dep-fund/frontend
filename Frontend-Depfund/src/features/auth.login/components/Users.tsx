import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import './RolesManager.css'; 
import logoDepFund from '../img/logo_regency.jpg';

interface User {
  id: number;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([
    { id: 1, usuario: 'juanp88', nombre: 'Juan', apellido: 'Pérez', email: 'juan@depfund.com', rol: 'Inversor' },
    { id: 2, usuario: 'admin_master', nombre: 'Lucas', apellido: 'Gómez', email: 'lucas@depfund.com', rol: 'Administrador' },
    { id: 3, usuario: 'm_garcia', nombre: 'Marta', apellido: 'García', email: 'marta@depfund.com', rol: 'Editor' }
  ]);

  // Función corregida: Solo limpia el campo rol del usuario
  const handleRemoveRole = (id: number, usuario: string) => {
    if (window.confirm(`¿Estás seguro de quitarle el rol al usuario @${usuario}? El usuario permanecerá en el sistema sin permisos.`)) {
      const updatedUsers = users.map(u => {
        if (u.id === id) {
          return { ...u, rol: 'Sin Rol' }; // O dejarlo como string vacío ""
        }
        return u;
      });
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side side-narrow">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Usuarios</h1>
            <p className="visual-subtitle">Gestión de privilegios y accesos de miembros.</p>
          </div>
        </div>

        <div className="form-side side-wide">
          <div className="form-wrapper manager-wrapper" style={{ maxWidth: '1000px' }}>
            <header className="auth-header">
              <h2>Gestión de Roles de Usuario</h2>
              <p>Asigna o remueve roles de los usuarios registrados.</p>
            </header>

            <div className="roles-table-container">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre y Apellido</th>
                    <th>Email</th>
                    <th>Rol Actual</th>
                    <th className="text-center">Acciones sobre Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="role-name-cell">@{u.usuario}</td>
                      <td>{u.nombre} {u.apellido}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`tag ${u.rol === 'Sin Rol' ? 'tag-empty' : ''}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button 
                            className="btn-edit-small"
                            onClick={() => navigate(`/users/edit-role/${u.id}`, { state: { user: u } })}
                          >
                            Editar Rol 🔑
                          </button>
                          
                          {/* Botón corregido: Solo quita el rol */}
                          <button 
                            className="btn-delete-small"
                            onClick={() => handleRemoveRole(u.id, u.usuario)}
                            disabled={u.rol === 'Sin Rol'}
                            style={u.rol === 'Sin Rol' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            Quitar Rol 🚫
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Link to="/dashboard" className="btn-link-muted mt-20">Volver al Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;