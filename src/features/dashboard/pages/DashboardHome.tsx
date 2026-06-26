import "./DashboardHome.css";
import { Building2, TrendingUp, Plus, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useProjects } from "../hooks/useProjects";
import WelcomeGuide from "../components/WelcomeGuide";
import HelpTooltip from "../components/HelpTooltip";

const STATE_LABELS: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Activo", className: "home-badge--active" },
  PENDING: { label: "Pendiente", className: "home-badge--pending" },
  CANCELED: { label: "Completado", className: "home-badge--completed" },
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { projects, total } = useProjects();

  const activeCount = projects.filter((p) => p.state === "APPROVED").length;

  const recentProjects = projects.slice(0, 4);

  return (
    <DashboardLayout title="Dashboard" user={user}>
      <WelcomeGuide userName={user?.name} />

      <div className="home-stats">
        <div className="home-stat-card">
          <Building2 size={28} color="#2C7176" />
          <div>
            <div className="home-stat-value">{total}</div>
            <div className="home-stat-label">Proyectos Totales</div>
          </div>
        </div>
        <div className="home-stat-card">
          <TrendingUp size={28} color="#2C7176" />
          <div>
            <div className="home-stat-value">{activeCount}</div>
            <div className="home-stat-label">Proyectos Activos</div>
          </div>
        </div>
      </div>

      <div className="home-section">
        <div className="home-section-header">
          <h2>Últimos Proyectos</h2>
          <button className="home-link" onClick={() => navigate("/dashboard/projects")}>
            Ver todos
          </button>
        </div>

        <div className="home-projects-grid">
          {recentProjects.length === 0 && (
            <p className="home-empty">No tenés proyectos todavía.</p>
          )}
          {recentProjects.map((p) => {
            const stateInfo = STATE_LABELS[p.state] ?? { label: p.state, className: "home-badge--pending" };
            const raised = `$${Math.round(parseFloat(p.total_amount) * 0.84 / 1000)}K`;
            return (
              <div className="home-project-row" key={p.id}>
                <div className="home-project-info">
                  <div className="home-project-name">{p.name}</div>
                  <div className="home-project-sub">
                    {p.categories[0]?.name ?? "Sin categoría"} · {p.ubication}
                  </div>
                  <div className="home-project-raised">Recaudado: <strong>{raised}</strong></div>
                </div>
                <div className="home-project-right">
                  <span className={`home-badge ${stateInfo.className}`}>{stateInfo.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-actions">
        <button
          className="home-action-card home-action-card--orange"
          onClick={() => navigate("/dashboard/projects/new")}
        >
          <Plus size={28} />
          <div className="home-action-text">
            <div className="home-action-title">
              Crear Nuevo Proyecto
              <span
                className="home-action-help"
                onClick={(e) => e.stopPropagation()}
              >
                <HelpTooltip title="Para desarrolladores" side="top">
                  Publicá tu complejo deportivo para conseguir financiamiento. Un administrador
                  revisa los datos antes de aprobarlo y abrirlo a inversión.
                </HelpTooltip>
              </span>
            </div>
            <div className="home-action-sub">Comenzá un nuevo proyecto de inversión deportiva</div>
          </div>
        </button>
        <button
          className="home-action-card home-action-card--teal"
          onClick={() => navigate("/dashboard/invest")}
        >
          <Compass size={28} />
          <div className="home-action-text">
            <div className="home-action-title">
              Explorar Proyectos
              <span
                className="home-action-help"
                onClick={(e) => e.stopPropagation()}
              >
                <HelpTooltip title="Para inversores" side="top">
                  Mirá los proyectos disponibles para invertir, recibí tokens $DPF y empezá a
                  cobrar dividendos mensuales en USDC.
                </HelpTooltip>
              </span>
            </div>
            <div className="home-action-sub">Descubrí nuevas oportunidades de inversión</div>
          </div>
        </button>
      </div>
    </DashboardLayout>
  );
}