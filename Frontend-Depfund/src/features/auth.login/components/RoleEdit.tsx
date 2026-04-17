import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './RoleEdit.css'; // ESTE NUEVO ARCHIVO
import logoDepFund from '../img/logo_regency.jpg';

const RoleEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roleData = location.state?.role;

  // Lista maestra de permisos disponibles en el sistema
  const [allAvailablePermisos] = useState(['Usuarios', 'Inversiones', 'Reportes', 'Noticias', 'Configuración', 'Auditoría', 'Lectura', 'Escritura']);
  
  const [role, setRole] = useState(roleData || { nombre: 'Desconocido', permisos: [] });
  const [selectedPermiso, setSelectedPermiso] = useState('');

  const removePermiso = (permisoToRemove: string) => {
    setRole({
      ...role,
      permisos: role.permisos.filter((p: string) => p !== permisoToRemove)
    });
  };

  const addPermiso = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermiso && !role.permisos.includes(selectedPermiso)) {
      setRole({
        ...role,
        permisos: [...role.permisos, selectedPermiso]
      });
      setSelectedPermiso('');
    }
  };

  if (!roleData) return <div className="login-page-container">Error: Rol no encontrado.</div>;

  return (
    <div className="login-page-container">
      <div className="login-columns">
        <div className="visual-side side-narrow">
          <div className="dark-overlay"></div>
          <div className="visual-content">
            <img src={logoDepFund} alt="DepFund Logo" className="brand-logo-visual" />
            <h1 className="visual-title">Editar Rol</h1>
            <p className="visual-subtitle">Ajusta los privilegios de {role.nombre}.</p>
          </div>
        </div>

        <div className="form-side side-wide">
          <div className="form-wrapper manager-wrapper">
            <header className="auth-header">
              <h2>Gestionar Permisos: {role.nombre}</h2>
              <p>Haz clic en la "X" de cada permiso para removerlo del rol.</p>
            </header>

            <div className="current-permissions-box">
              <h3>Permisos Actuales</h3>
              <div className="permissions-grid-edit">
                {role.permisos.map((p: string, idx: number) => (
                  <div key={idx} className="tag-edit">
                    {p}
                    <button type="button" onClick={() => removePermiso(p)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="add-permission-section">
              <div className="divider"></div>
              <h3>Asignar Nuevo Permiso</h3>
              <form onSubmit={addPermiso} className="add-role-form">
                <div className="input-group">
                   <select 
                    className="custom-select"
                    value={selectedPermiso} 
                    onChange={(e) => setSelectedPermiso(e.target.value)}
                    required
                  >
                    <option value="">Selecciona un permiso...</option>
                    {allAvailablePermisos.map((p, idx) => (
                      <option key={idx} value={p} disabled={role.permisos.includes(p)}>
                        {p} {role.permisos.includes(p) ? '(Ya asignado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="login-button add-btn">Agregar</button>
              </form>
            </div>

            <div className="button-group-row">
                <button onClick={() => { alert('Cambios guardados'); navigate('/roles'); }} className="login-button">
                    Guardar Cambios
                </button>
                <Link to="/roles" className="btn-link-muted">Cancelar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleEdit;