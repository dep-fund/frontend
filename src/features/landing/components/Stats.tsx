import "./Stats.css";
import { BarChart2, Users, Building2, ShieldCheck } from "lucide-react";

const CYAN = "#2C7176";

const stats = [
  { icon: <BarChart2 size={24} color={CYAN} />, value: "$2.4M+", label: "Capital Desplegado" },
  { icon: <Users size={24} color={CYAN} />, value: "1,200+", label: "Usuarios Activos" },
  { icon: <Building2 size={24} color={CYAN} />, value: "18", label: "Proyectos Financiados" },
  { icon: <ShieldCheck size={24} color={CYAN} />, value: "99.9%", label: "Tiempo Activo" },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="stats-inner">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}