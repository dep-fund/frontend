import React from "react";
import "./Login.css";

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">Bienvenido de nuevo</h2>
        <p className="subtitle">
          Introduce tus credenciales para acceder a tu cuenta.
        </p>

        <form className="form">
          <label>Email</label>
          <input
            type="email"
            placeholder="ejemplo@depfund.com"
            className="input"
          />

          <div className="password-row">
            <label>Contraseña</label>
            <a href="#" className="forgot">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <input
            type="password"
            placeholder="••••••••"
            className="input"
          />

          <button type="submit" className="button">
            Iniciar Sesión →
          </button>
        </form>

        <p className="signup">
          ¿Aún no eres miembro? <a href="#">Crea una cuenta</a>
        </p>
      </div>
    </div>
  );
};
export default Login;