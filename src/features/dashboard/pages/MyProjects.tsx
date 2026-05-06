import { useState } from "react";
import "./MyProjects.css";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import { useUser } from "../hooks/useUser";
import { useProjects } from "../hooks/useProjects";
import type { Project } from "../types";

export default function MyProjects() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { projects, total, loading, reload } = useProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  return (
    <DashboardLayout title="Mis Proyectos" user={user}>
      <div className="myprojects-header">
        <span className="myprojects-count">{total} proyecto{total !== 1 ? "s" : ""}</span>
        <button className="btn-create" onClick={() => navigate("/dashboard/projects/new")}>
          <Plus size={16} />
          Crear Proyecto
        </button>
      </div>

      {loading && <div className="myprojects-loading">Cargando proyectos...</div>}

      {!loading && projects.length === 0 && (
        <div className="myprojects-empty">
          <p>Todavía no tenés proyectos.</p>
          <button className="btn-create" onClick={() => navigate("/dashboard/projects/new")}>
            <Plus size={16} /> Crear tu primer proyecto
          </button>
        </div>
      )}

      <div className="myprojects-grid">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onEdit={(proj) => setEditingProject(proj)}
          />
        ))}
      </div>

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={reload}
        />
      )}
    </DashboardLayout>
  );
}
