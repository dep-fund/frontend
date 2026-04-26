import "./CTA.css";

interface CTAProps {
  onRegisterClick: () => void;
}

export default function CTA({ onRegisterClick }: CTAProps) {
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <h2 className="cta-title">
          Invertí en complejos deportivos o creá el tuyo desde cero
        </h2>

        <p className="cta-sub">
          Accedé a proyectos verificados, generá ingresos pasivos con dividendos o participación tokenizada.
        </p>
        <button className="cta-btn" onClick={onRegisterClick}>Comenzar Ahora →</button>
      </div>
    </section>
  );
}
