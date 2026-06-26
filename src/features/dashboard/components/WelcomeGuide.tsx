import { useState } from "react";
import { X, Wallet, Search, Banknote } from "lucide-react";
import "./WelcomeGuide.css";

const DISMISS_KEY = "depfund_welcome_dismissed";

interface WelcomeGuideProps {
  userName?: string | null;
}

/**
 * Guía breve de bienvenida para el Dashboard Home. Se muestra una sola vez
 * (o hasta que el usuario la cierre); queda guardado en localStorage.
 */
export default function WelcomeGuide({ userName }: WelcomeGuideProps) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "true"
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const firstName = userName?.split(" ")[0];

  return (
    <div className="wg-wrap">
      <button className="wg-close" onClick={handleDismiss} aria-label="Cerrar guía">
        <X size={16} />
      </button>

      <h2 className="wg-title">
        {firstName ? `Hola, ${firstName}!` : "¡Bienvenido a DepFund!"}
      </h2>
      <p className="wg-subtitle">
      </p>

      <div className="wg-steps">
        <div className="wg-step">
          <div className="wg-step-icon wg-step-icon--orange">
            <Search size={18} />
          </div>
          <div>
            <div className="wg-step-title">Explorá o creá un proyecto</div>
            <div className="wg-step-text">
              Invertí en complejos deportivos publicados por otros desarrolladores, o publicá
              el tuyo para conseguir financiamiento.
            </div>
          </div>
        </div>

        <div className="wg-step">
          <div className="wg-step-icon wg-step-icon--teal">
            <Wallet size={18} />
          </div>
          <div>
            <div className="wg-step-title">Recibí tokens $DPF</div>
            <div className="wg-step-text">
              Al invertir, recibís tokens que representan tu participación real en el proyecto.
              Podés venderlos cuando quieras en el Marketplace.
            </div>
          </div>
        </div>

        <div className="wg-step">
          <div className="wg-step-icon wg-step-icon--orange">
            <Banknote size={18} />
          </div>
          <div>
            <div className="wg-step-title">Cobrá dividendos en USDC</div>
            <div className="wg-step-text">
              Conectá tu wallet y cada mes vas a recibir automáticamente tu parte de las
              ganancias del complejo, directo en USDC.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}