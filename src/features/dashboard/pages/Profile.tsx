import { useState, useEffect } from "react";
import "./Profile.css";
import { Lock, Trash2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { updateMe, updateAvatar, changePassword, deleteMe } from "../services/api";
import { useNavigate } from "react-router-dom";

const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (!detail) return "Ocurrió un error inesperado.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(" ");
  }
  return JSON.stringify(detail);
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLastName(user.last_name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg("");
    setSaveError("");
    try {
      const updated = await updateMe({ name, last_name: lastName, email });
      setUser(updated);
      setSaveMsg("Cambios guardados correctamente.");
    } catch (err: any) {
      setSaveError(parseApiError(err));
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaveError("");
    try {
      const updated = await updateAvatar(file);
      setUser(updated);
    } catch (err: any) {
      setSaveError(parseApiError(err));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      setPasswordMsg("Contraseña actualizada correctamente.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(parseApiError(err));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMe();
      localStorage.removeItem("token");
      navigate("/");
    } catch (err: any) {
      setSaveError(parseApiError(err));
    }
  };

  return (
    <DashboardLayout title="Mi Perfil" user={user}>
      <div className="profile-layout">
        <div className="profile-main">
          <div className="profile-card">
            <h2 className="profile-card-title">Información Personal</h2>

            <div className="profile-avatar-row">
              <div className="profile-avatar">
                {user?.image
                  ? <img src={user.image} alt="avatar" className="profile-avatar-img" />
                  : `${user?.name.charAt(0)}${user?.last_name.charAt(0)}`.toUpperCase()
                }
              </div>
              <div>
                <div className="profile-avatar-name">
                  {user ? `${user.name} ${user.last_name}` : ""}
                </div>
                <div className="profile-avatar-email">{user?.email}</div>
                <label className="profile-change-photo">
                  Cambiar foto de perfil
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {saveMsg && <div className="profile-success">{saveMsg}</div>}
            {saveError && <div className="profile-error">{saveError}</div>}

            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-row">
                <div className="profile-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="profile-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="profile-save-btn">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>

        <div className="profile-side">
          <div className="profile-card">
            <div className="profile-security-header">
              <Lock size={16} />
              <h3>Seguridad</h3>
            </div>

            <button
              className="profile-password-toggle"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Cambiar Contraseña
            </button>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="profile-password-form">
                {passwordError && <div className="profile-error">{passwordError}</div>}
                {passwordMsg && <div className="profile-success">{passwordMsg}</div>}
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="profile-password-actions">
                  <button type="submit" className="profile-save-btn">Guardar</button>
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="profile-card profile-danger-card">
            <div className="profile-security-header profile-danger-header">
              <Trash2 size={16} color="#ef4444" />
              <h3>Zona Peligrosa</h3>
            </div>
            <p className="profile-danger-text">
              Eliminar tu cuenta es permanente y no se puede deshacer.
            </p>
            {!showDeleteConfirm ? (
              <button
                className="profile-delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar Cuenta
              </button>
            ) : (
              <div className="profile-delete-confirm">
                <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
                <button className="profile-delete-btn" onClick={handleDeleteAccount}>
                  Sí, eliminar mi cuenta
                </button>
                <button
                  className="profile-cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}