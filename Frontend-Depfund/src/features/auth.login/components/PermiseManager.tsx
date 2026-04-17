import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import './RolesManager.css'; // Reutilizamos la estructura de tablas
import logoDepFund from '../img/logo_regency.jpg';

interface Permiso {
  id: number;
  usuario: string;
  accion: string;
}

const PermiseManager: React.FC = () => {
  const navigate = useNavigate();
  
  // Datos de prueba
  const [usuariosExistentes] = useState(['Juan Pérez', 'admin_depfund', 'm_garcia']);
  const [permisos, setPermisos] = useState<Permiso[]>([
    { id: 1, usuario: 'Juan Pérez', accion: 'Cargar Inversión' },
    { id: 2, usuario: 'admin_depfund', accion: 'Eliminar Usuarios' },
    { id: 3, usuario: 'm_garcia', accion: 'Ver Reportes' }
  ]);

  const [newPermiso, setNewPermiso] = useState({ usuario: '', accion: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermiso.usuario || !newPermiso.accion) return;

    const newItem: Permiso = {
      id: Date.now(),
      usuario: newPermiso.usuario,
      accion: newPermiso.accion
    };

    setPermisos([...permisos, newItem]);
    setNewPermiso({ usuario: '', accion: '' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Dar de baja este permiso?")) {
      setPermisos(permisos.filter(p => p.id !== id));
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side side-narrow">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Gestión de Permisos</h1>
            <p className="visual-subtitle">Asigna acciones específicas a cada usuario.</p>
          </div>
        </div>

        <div className="form-side side-wide">
          <div className="form-wrapper manager-wrapper">
            <header className="auth-header">
              <h2>Listado de Permisos</h2>
              <p>Control de acciones por usuario del sistema.</p>
            </header>

            <div className="roles-table-container">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th className="text-center">Editar</th>
                    <th className="text-center">Baja</th>
                  </tr>
                </thead>
                <tbody>
                  {permisos.map(p => (
                    <tr key={p.id}>
                      <td><span className="tag">{p.accion}</span></td>
                      <td className="text-center">
                        <button className="btn-edit-small" onClick={() => navigate(`/permisos/edit/${p.id}`, { state: { permiso: p } })}>
                          Editar ✏️
                        </button>
                      </td>
                      <td className="text-center">
                        <button className="btn-delete-small" onClick={() => handleDelete(p.id)}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="add-role-section">
              <div className="divider"></div>
              <h3>Dar de Alta Nuevo Permiso</h3>
              <form onSubmit={handleAdd} className="add-role-form">

                <div className="input-group">
                  <div className="input-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Acción (ej: Editar_Saldos)" 
                      value={newPermiso.accion}
                      onChange={(e) => setNewPermiso({...newPermiso, accion: e.target.value})}
                      required
                    />
                    <span className="input-highlight"></span>
                  </div>
                </div>
                <button type="submit" className="login-button add-btn">Alta</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermiseManager;