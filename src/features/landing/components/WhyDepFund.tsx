import "./WhyDepFund.css";
//import { TrendingUp, ShoppingBag, Vote, RefreshCw, BarChart2, Star } from "lucide-react";
import { TrendingUp, ShoppingBag, Star } from "lucide-react";

const CYAN = "#2C7176";

const features = [
  {
    icon: <TrendingUp size={22} color={CYAN} />,
    title: "Dividendos",
    desc: "Generá ingresos reales automáticamente desde los ingresos del proyecto.",
  },
  {
    icon: <ShoppingBag size={22} color={CYAN} />,
    title: "Marketplace",
    desc: "Comprá y vendé tus tokens en cualquier momento con liquidez real.",
  },
  {
    icon: <Star size={22} color={CYAN} />,
    title: "Reputación de Desarrolladores",
    desc: "Puntuación transparente basada en el feedback de los inversores.",
  }
];

{/*
  {
    icon: <Vote size={22} color={CYAN} />,
    title: "Gobernanza",
    desc: "Votá en decisiones clave. No sos solo un inversor, sos co-dueño con voto.",
  },
  {
    icon: <RefreshCw size={22} color={CYAN} />,
    title: "Reestructuración",
    desc: "Tus tokens pueden reasignarse a nuevos proyectos, para quedar respaldada por un activo que genere ingresos.",
  },
  {
    icon: <BarChart2 size={22} color={CYAN} />,
    title: "Niveles de Inversor",
    desc: "Desbloqueá beneficios a medida que crecés: Seed → Growth → Gold → Whale.",
  }
  */}
  

export default function WhyDepFund() {
  return (
    <section className="why-section">
      <div className="why-inner">
        <h2 className="why-title">Por qué DepFund</h2>
        <div className="why-grid">
          {features.map((f) => (
            <div className="why-card" key={f.title}>
              <span className="why-icon">{f.icon}</span>
              <h3 className="why-card-title">{f.title}</h3>
              <p className="why-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}