import { useState, useRef } from "react";
import "./CreateProject.css";
import { ChevronLeft, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useCategories } from "../hooks/useCategories";
import { createProject, uploadProjectImage } from "../services/api";

const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (!detail) return "Error al crear el proyecto.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(" ");
  return JSON.stringify(detail);
};

interface ImagePreview {
  file: File;
  previewUrl: string;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [ubication, setUbication] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const newImages: ImagePreview[] = [];
    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) return;
      if (images.length + newImages.length >= 10) return;
      newImages.push({ file, previewUrl: URL.createObjectURL(file) });
    });
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const project = await createProject({
        name,
        description,
        total_amount: parseFloat(totalAmount),
        ubication,
        category_ids: categoryIds,
      });

      // Subir imágenes secuencialmente
      for (const img of images) {
        await uploadProjectImage(project.id, img.file);
      }

      navigate("/dashboard/projects");
    } catch (err: any) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Crear Proyecto" user={user}>
      <button className="cp-back" onClick={() => navigate("/dashboard/projects")}>
        <ChevronLeft size={16} /> Volver
      </button>

      <div className="cp-card">
        <h2 className="cp-title">Crear Nuevo Proyecto</h2>

        {error && <div className="cp-error">{error}</div>}

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-group">
            <label>Nombre del Proyecto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Arena Deportiva Centro"
              required
            />
          </div>

          <div className="cp-row">
            <div className="cp-group">
              <label>Ubicación</label>
              <input
                type="text"
                value={ubication}
                onChange={(e) => setUbication(e.target.value)}
                placeholder="Ej: Buenos Aires, ARG"
                required
              />
            </div>
            <div className="cp-group">
              <label>Meta de Financiamiento (USDT)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="500000"
                required
              />
            </div>
          </div>

          <div className="cp-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu proyecto en detalle..."
              rows={5}
              required
            />
          </div>

          <div className="cp-group">
            <label>Categorías</label>
            <div className="cp-categories">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`cp-cat-tag ${categoryIds.includes(cat.id) ? "cp-cat-tag--selected" : ""}`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Imágenes ── */}
          <div className="cp-group">
            <label>Imágenes del Proyecto</label>

            <div
              className={`cp-dropzone ${isDragging ? "cp-dropzone--active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="cp-dropzone-icon" />
              <p className="cp-dropzone-text">
                Arrastrá imágenes acá o <span>seleccioná archivos</span>
              </p>
              <p className="cp-dropzone-hint">PNG, JPG, WEBP · máx. 10 imágenes</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {images.length > 0 && (
              <div className="cp-image-grid">
                {images.map((img, i) => (
                  <div key={i} className="cp-image-thumb">
                    <img src={img.previewUrl} alt={`preview-${i}`} />
                    <button
                      type="button"
                      className="cp-image-remove"
                      onClick={() => removeImage(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <p className="cp-image-count">
                {images.length} {images.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"} · se subirán al crear el proyecto
              </p>
            )}
          </div>

          <div className="cp-actions">
            <button type="submit" className="cp-btn-submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Proyecto"}
            </button>
            <button
              type="button"
              className="cp-btn-cancel"
              onClick={() => navigate("/dashboard/projects")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}