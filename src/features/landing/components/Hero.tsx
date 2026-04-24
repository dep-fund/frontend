import "./Hero.css";

import { imagenROI } from "../../assets";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Invertí en el futuro<br />del deporte
        </h1>

        <p className="hero-subtitle">
          Invertí en proyectos deportivos reales o creá tu propio complejo
          para recibir financiamiento. Generá ingresos a través de dividendos
          y valorización de tokens.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary hero-btn-main">
            Comenzar ahora →
          </button>
          <button className="btn-hero-secondary">
            Ver proyectos
          </button>
        </div>
      </div>

      <div className="hero-image-wrapper">
        <div className="hero-image-container">
          <img
            src={imagenROI}
            alt="Complejo deportivo en crecimiento"
            className="hero-img"
          />
        </div>

        <div className="hero-roi-badge">
          <span className="hero-roi-arrow">↗</span>
          <div>
            <div className="hero-roi-value">12.4%</div>
            <div className="hero-roi-label">ROI Promedio</div>
          </div>
        </div>
      </div>
    </section>
  );
}