import { useState, useEffect } from "react";
import "./ProjectDetail.css";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import ProjectForm from "../components/ProjectForm";
import { useUser } from "../hooks/useUser";
import { fetchProject, listProjectImages } from "../services/api";

import type { Project } from "../types";
import ProjectAdvances from "./ProjectAdvances";
import ProjectDocuments from "./ProjectDocuments";

const STATE_LABELS: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Activo", className: "pd-badge--active" },
  PENDING: { label: "Pendiente", className: "pd-badge--pending" },
  CANCELED: { label: "Completado", className: "pd-badge--completed" },
};

const getProgress = (id: string) => Math.min(100, (id.charCodeAt(0) + id.charCodeAt(1)) % 60 + 40);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  
  const load = async () => {
    if (!id) return;
    try {
      // Obtenemos los datos del proyecto y las imágenes en paralelo
      const [projectData, projectImages] = await Promise.all([
        fetchProject(id),
        // Usamos catch para que si falla la carga de imágenes, el proyecto se muestre igual
        listProjectImages(id).catch(() => [])
      ]);
      
      setProject(projectData);
      setImages(projectImages || []);

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
  const progress = getProgress(project.id);
  const raised = Math.round(parseFloat(project.total_amount) * progress / 100);
  const investors = Math.floor(progress * 2.5);
  const isOwner = user?.id === project.user_id;

  return (
    <DashboardLayout title="Detalle del Proyecto" user={user}>
      <button className="pd-back" onClick={() => navigate("/dashboard/projects")}>
        <ChevronLeft size={16} /> Volver
      </button>

      <div className="pd-hero">
        {images.length > 0 ? (
          <>
            <div 
              className="pd-carousel-bg-blur"
              style={{ backgroundImage: `url(${typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : images[currentImageIndex].url})` }}
            />
            <img 
              src={typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : images[currentImageIndex].url} 
              alt={`Imagen del proyecto ${currentImageIndex + 1}`} 
              className="pd-carousel-img"
            />
            {/* Gradiente oscuro inferior para asegurar que los puntos de navegación sean visibles */}
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
                      className={`pd-carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
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

      <div className="pd-header">
        <div>
          <h2 className="pd-name">{project.name}</h2>
          <p className="pd-sub">
            {project.categories[0]?.name ?? "Sin categoría"} · {project.ubication}
          </p>
        </div>
        <button className="pd-edit-btn" onClick={() => setEditing(true)}>
          <Pencil size={15} /> Editar Proyecto
        </button>
      </div>

      <div className="pd-stats">
        <div className="pd-stat-card">
          <div className="pd-stat-label">Recaudado</div>
          <div className="pd-stat-value">${(raised / 1000).toFixed(0)}K</div>
          <div className="pd-stat-sub">de ${(parseFloat(project.total_amount) / 1000).toFixed(0)}K</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-label">Inversores</div>
          <div className="pd-stat-value">{investors}</div>
          <div className="pd-stat-sub">participantes</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-label">Progreso</div>
          <div className="pd-stat-value">{progress}%</div>
          <div className="pd-stat-sub">completado</div>
        </div>
      </div>

      <div className="pd-progress-bar">
        <div className="pd-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="pd-body">
        <div className="pd-section">
          <h3>Descripción del Proyecto</h3>
          <p>{project.description}</p>
        </div>

        <div className="pd-info-grid">
          <div className="pd-info-card">
            <h4>Información del Proyecto</h4>
            <div className="pd-info-row">
              <span>Categoría:</span>
              <strong>{project.categories.map((c) => c.name).join(", ") || "—"}</strong>
            </div>
            <div className="pd-info-row">
              <span>Ubicación:</span>
              <strong>{project.ubication}</strong>
            </div>
            <div className="pd-info-row">
              <span>Estado:</span>
              <span className={`pd-badge pd-badge--inline ${stateInfo.className}`}>{stateInfo.label}</span>
            </div>
          </div>
          <div className="pd-info-card">
            <h4>Datos Financieros</h4>
            <div className="pd-info-row">
              <span>Meta de Financiamiento:</span>
              <strong>${(parseFloat(project.total_amount) / 1000).toFixed(0)}K</strong>
            </div>
            <div className="pd-info-row">
              <span>Total Inversores:</span>
              <strong>{investors}</strong>
            </div>
          </div>
        </div>
        <ProjectDocuments 
          projectId={project.id} 
          isOwner={isOwner} 
        />
        <ProjectAdvances
          projectId={project.id}
          isOwner={isOwner}
        />
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
