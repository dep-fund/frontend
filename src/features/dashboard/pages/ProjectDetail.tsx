import { useState, useEffect } from "react";
import "./ProjectDetail.css";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import ProjectForm from "../components/ProjectForm";
import { useUser } from "../hooks/useUser";
import { fetchProject, listProjectImages, fetchProjectInvestmentStats } from "../services/api";
import type { Project, ProjectInvestmentStats } from "../types";

import ProjectAdvances from "./ProjectAdvances";
import ProjectDocuments from "./ProjectDocuments";

const STATE_LABELS: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Activo", className: "pd-badge--active" },
  PENDING: { label: "Pendiente", className: "pd-badge--pending" },
  CANCELED: { label: "Completado", className: "pd-badge--completed" },
};

const RISK_LABELS: Record<string, { label: string; className: string }> = {
  LOW: { label: "Bajo", className: "pd-risk--low" },
  MEDIUM: { label: "Medio", className: "pd-risk--medium" },
  HIGH: { label: "Alto", className: "pd-risk--high" },
};

const formatCurrency = (value?: string | null) => {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return num >= 1000 ? `$${(num / 1000).toFixed(0)}K` : `$${num.toFixed(2)}`;
};

const formatPercent = (value?: string | null) => {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return `${num.toFixed(2)}%`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [stats, setStats] = useState<ProjectInvestmentStats | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      const [projectData, projectImages, statsData] = await Promise.all([
        fetchProject(id),
        listProjectImages(id).catch(() => []),
        fetchProjectInvestmentStats(id).catch(() => null),
      ]);
      setProject(projectData);
      setImages(projectImages || []);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <DashboardLayout title="Detalle del Proyecto" user={user}>
      <p className="pd-loading">Cargando...</p>
    </DashboardLayout>
  );

  if (!project) return (
    <DashboardLayout title="Detalle del Proyecto" user={user}>
      <p className="pd-loading">Proyecto no encontrado.</p>
    </DashboardLayout>
  );

  const stateInfo = STATE_LABELS[project.state] ?? { label: project.state, className: "pd-badge--pending" };
  const riskInfo = project.risk ? (RISK_LABELS[project.risk] ?? { label: project.risk, className: "" }) : null;
  const progress = stats ? Number(stats.progress_pct) : null;
  const raised = stats ? Number(stats.raised_amount) : null;
  const investors = stats ? stats.investors_count : null;
  const isOwner = user?.id === project.user_id;
  const developer = project.developer;

  return (
    <DashboardLayout title="Detalle del Proyecto" user={user}>
      <button className="pd-back" onClick={() => navigate("/dashboard/invest")}>
        <ChevronLeft size={16} /> Volver
      </button>

      {/* ── Hero / Carousel ── */}
      <div className="pd-hero">
        {images.length > 0 ? (
          <>
            <div
              className="pd-carousel-bg-blur"
              style={{ backgroundImage: `url(${typeof images[currentImageIndex] === "string" ? images[currentImageIndex] : images[currentImageIndex].url})` }}
            />
            <img
              src={typeof images[currentImageIndex] === "string" ? images[currentImageIndex] : images[currentImageIndex].url}
              alt={`Imagen del proyecto ${currentImageIndex + 1}`}
              className="pd-carousel-img"
            />
            <div className="pd-carousel-gradient" />

            {images.length > 1 && (
              <>
                <button
                  className="pd-carousel-btn pd-carousel-btn--prev"
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="pd-carousel-btn pd-carousel-btn--next"
                  onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight size={24} />
                </button>
                <div className="pd-carousel-dots">
                  {images.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      className={`pd-carousel-dot ${idx === currentImageIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span className="pd-carousel-empty">Sin imágenes disponibles</span>
        )}
        <span className={`pd-badge pd-carousel-badge ${stateInfo.className}`}>{stateInfo.label}</span>
      </div>

      {/* ── Header ── */}
      <div className="pd-header">
        <div>
          <h2 className="pd-name">
            {project.name}
            {project.suffix && <span className="pd-suffix">{project.suffix}</span>}
          </h2>
          <p className="pd-sub">
            {project.categories[0]?.name ?? "Sin categoría"} · {project.ubication}
          </p>
        </div>
        {isOwner && (
          <button className="pd-edit-btn" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Editar Proyecto
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className={`pd-stats ${project.roi != null ? "pd-stats--4col" : ""}`}>
        <div className="pd-stat-card">
          <div className="pd-stat-label">Recaudado</div>
          <div className="pd-stat-value">
            {raised !== null ? `$${(raised / 1000).toFixed(0)}K` : "—"}
          </div>
          <div className="pd-stat-sub">de {formatCurrency(project.total_amount)}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-label">Inversores</div>
          <div className="pd-stat-value">{investors !== null ? investors : "—"}</div>
          <div className="pd-stat-sub">participantes</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-label">Progreso</div>
          <div className="pd-stat-value">{progress !== null ? `${progress.toFixed(0)}%` : "—"}</div>
          <div className="pd-stat-sub">completado</div>
        </div>
        {project.roi != null && (
          <div className="pd-stat-card">
            <div className="pd-stat-label">ROI</div>
            <div className="pd-stat-value">{formatPercent(project.roi?.toString())}</div>
            <div className="pd-stat-sub">retorno estimado</div>
          </div>
        )}
      </div>

      <div className="pd-progress-bar">
        <div className="pd-progress-fill" style={{ width: `${progress ?? 0}%` }} />
      </div>

      {/* ── Body ── */}
      <div className="pd-body">
        <div className="pd-section">
          <h3>Descripción del Proyecto</h3>
          <p>{project.description}</p>
        </div>

        <div className={`pd-info-grid ${developer ? "pd-info-grid--3col" : ""}`}>
          {/* Información General */}
          <div className="pd-info-card">
            <h4>Información del Proyecto</h4>
            <div className="pd-info-row">
              <span>Total Inversores:</span>
              <strong>{investors !== null ? investors : "—"}</strong>
            </div>
            <div className="pd-info-row">
              <span>Ubicación:</span>
              <strong>{project.ubication}</strong>
            </div>
            <div className="pd-info-row">
              <span>Estado:</span>
              <span className={`pd-badge pd-badge--inline ${stateInfo.className}`}>{stateInfo.label}</span>
            </div>
            {riskInfo && (
              <div className="pd-info-row">
                <span>Nivel de Riesgo:</span>
                <span className={`pd-risk-badge ${riskInfo.className}`}>{riskInfo.label}</span>
              </div>
            )}
            <div className="pd-info-row">
              <span>Creado:</span>
              <strong>{formatDate(project.created_at)}</strong>
            </div>
            <div className="pd-info-row">
              <span>Actualizado:</span>
              <strong>{formatDate(project.updated_at)}</strong>
            </div>
          </div>

          {/* Datos Financieros */}
          <div className="pd-info-card">
            <h4>Datos Financieros</h4>
            <div className="pd-info-row">
              <span>Meta de Financiamiento:</span>
              <strong>{formatCurrency(project.total_amount)}</strong>
            </div>
            {project.min_amount != null && (
              <div className="pd-info-row">
                <span>Inversión Mínima:</span>
                <strong>{formatCurrency(project.min_amount?.toString())}</strong>
              </div>
            )}
            <div className="pd-info-row">
              <span>Total Inversores:</span>
              <strong>{investors}</strong>
            </div>
            {project.annual_expenses != null && (
              <div className="pd-info-row">
                <span>Gastos Anuales:</span>
                <strong>{formatCurrency(project.annual_expenses?.toString())}</strong>
              </div>
            )}
            {project.annual_gross_profit != null && (
              <div className="pd-info-row">
                <span>Ganancia Bruta Anual:</span>
                <strong>{formatCurrency(project.annual_gross_profit?.toString())}</strong>
              </div>
            )}
            {project.annual_benefits != null && (
              <div className="pd-info-row">
                <span>Beneficios Anuales:</span>
                <strong>{formatCurrency(project.annual_benefits?.toString())}</strong>
              </div>
            )}
            {project.roi != null && (
              <div className="pd-info-row">
                <span>ROI:</span>
                <strong>{formatPercent(project.roi?.toString())}</strong>
              </div>
            )}
          </div>

          {/* Información del Desarrollador */}
          {developer && (
            <div className="pd-info-card pd-developer-card">
              <h4>Información del Desarrollador</h4>

              <div className="pd-developer-profile">
                {developer.image ? (
                  <img
                    src={developer.image}
                    alt={developer.username}
                    className="pd-developer-avatar"
                  />
                ) : (
                  <div className="pd-developer-avatar pd-developer-avatar--placeholder">
                    {developer.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div>
                  <p className="pd-developer-name">
                    {developer.name} {developer.last_name}
                  </p>
                  <p className="pd-developer-username">@{developer.username}</p>
                </div>
              </div>

              <div className="pd-info-row">
                <span>Email:</span>
                <strong>{developer.email}</strong>
              </div>
              <div className="pd-info-row">
                <span>Fecha de nacimiento:</span>
                <strong>{formatDate(developer.birthdate)}</strong>
              </div>

              {developer.projects.length > 0 && (
                <div className="pd-developer-related">
                  <p className="pd-developer-related-title">Otros proyectos aprobados</p>
                  <div className="pd-developer-related-list">
                    {developer.projects.map((p) => (
                      <button
                        key={p.id}
                        className="pd-developer-related-item"
                        onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                      >
                        {p.name}
                        {p.suffix && <span className="pd-suffix">{p.suffix}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ProjectDocuments projectId={project.id} isOwner={isOwner} />
        <ProjectAdvances projectId={project.id} isOwner={isOwner} />
      </div>

      {editing && (
        <ProjectForm
          project={project}
          onClose={() => setEditing(false)}
          onSuccess={load}
        />
      )}
    </DashboardLayout>
  );
}