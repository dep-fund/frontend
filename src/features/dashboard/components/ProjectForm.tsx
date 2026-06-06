import { useState } from "react";
import "./ProjectForm.css";
import { X } from "lucide-react";
import type { Project } from "../types";
import { createProject, updateProject } from "../services/api";
import { useCategories } from "../hooks/useCategories";

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectForm({ project, onClose, onSuccess }: ProjectFormProps) {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [totalAmount, setTotalAmount] = useState(project?.total_amount ?? "");
  const [ubication, setUbication] = useState(project?.ubication ?? "");
  const [state] = useState(project?.state ?? "PENDING");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    project?.categories.map((c) => c.id) ?? []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        total_amount: parseFloat(totalAmount as string),
        ubication,
        category_ids: categoryIds,
      };
      if (project) {
        await updateProject(project.id, { ...payload, state });
      } else {
        await createProject(payload as any);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Error al guardar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-modal-header">
          <h2>{project ? "Editar Proyecto" : "Crear Nuevo Proyecto"}</h2>
          <button className="form-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-group">
            <label>Nombre del Proyecto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Arena Deportiva Centro"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ubicación</label>
              <input
                type="text"
                value={ubication}
                onChange={(e) => setUbication(e.target.value)}
                placeholder="Ej: Buenos Aires, ARG"
                required
              />
            </div>
            <div className="form-group">
              <label>Meta de Financiamiento (USD)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="500000"
                required
                disabled={!!project}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu proyecto en detalle..."
              rows={4}
              required
            />
          </div>

          {project && (
            <div className="form-group">
              <label>Estado</label>
              <p className="form-state-display">{
                state === "APPROVED" ? "Activo" :
                state === "PENDING" ? "Pendiente" :
                "Completado"
              }</p>
            </div>
          )}

          <div className="form-group">
            <label>Categorías</label>
            <div className="form-categories">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`form-cat-tag ${categoryIds.includes(cat.id) ? "form-cat-tag--selected" : ""}`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Guardando..." : project ? "Guardar Cambios" : "Crear Proyecto"}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
