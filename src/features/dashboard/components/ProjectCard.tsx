import "./ProjectCard.css";
import { Eye } from "lucide-react";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { listProjectImages } from "../services/api";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  showActions?: boolean;
}

const STATE_LABELS: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Activo", className: "badge--active" },
  PENDING: { label: "Pendiente", className: "badge--pending" },
  CANCELED: { label: "Completado", className: "badge--completed" },
};



const getProgress = (id: string) => {
  const seed = id.charCodeAt(0) + id.charCodeAt(1);
  return Math.min(100, (seed % 60) + 40);
};

export default function ProjectCard({ project}: ProjectCardProps) {
  const navigate = useNavigate();
  const stateInfo = STATE_LABELS[project.state] ?? { label: project.state, className: "badge--pending" };
  const progress = getProgress(project.id);
  const raised = `$${Math.round(parseFloat(project.total_amount) * progress / 100 / 1000)}K`;
  const investors = Math.floor(progress * 2.5);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    listProjectImages(project.id)
      .then((imgs) => imgs.length > 0 ? setCoverUrl(imgs[0].url) : null)
      .catch(() => null);
  }, [project.id]);

  return (
    <div className="project-card">
      <div className="project-card-header">
        {coverUrl ? (
          <img src={coverUrl} alt={project.name} className="project-card-cover" />
        ) : (
          <div className="project-card-cover project-card-cover--placeholder" />
        )}
        <span className={`project-badge ${stateInfo.className}`}>{stateInfo.label}</span>
      </div>
      
      <div className="project-card-body">
        <h3 className="project-card-name">{project.name}</h3>
        <p className="project-card-category">
          {project.categories.map((c) => c.name).join(", ") || "Sin categoría"}
        </p>
        <p className="project-card-location">{project.ubication}</p>

        <div className="project-card-progress-row">
          <span>Progreso</span>
          <span className="project-card-progress-pct">{progress}%</span>
        </div>
        <div className="project-card-progress-bar">
          <div className="project-card-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="project-card-stats">
          <div>
            <span className="stat-label">Recaudado</span>
            <span className="stat-value">{raised}</span>
          </div>
          <div>
            <span className="stat-label">Inversores</span>
            <span className="stat-value">{investors}</span>
          </div>
        </div>

         
          <div className="project-card-actions">
            <button
              className="btn-detail"
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
            >
              <Eye size={15} />
              Ver Detalle
            </button>
          </div>
        
      </div>
    </div>
  );
}
