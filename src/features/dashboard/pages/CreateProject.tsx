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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [minCost, setMinCost] = useState("");
  const [annualCosts, setAnnualCosts] = useState("");
  const [suffix, setSuffix] = useState("");
  const [grossProfit, setGrossProfit] = useState("");
  const [ubication, setUbication] = useState("");
  const [categoryIds, setCategoryIds] = useState<any[]>([]);

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (id: any) => {
    setCategoryIds((prev) =>
      prev.some((item) => String(item) === String(id))
        ? prev.filter((c) => String(c) !== String(id))
        : [...prev, id]
    );
  };

  const validateAmount = (value: string): string => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return "Debe ser un número positivo.";
    return "";
  };

  const validateSuffix = (value: string): string => {
    if (!value) return "";
    if (value.length < 3) return "Mínimo 3 caracteres.";
    if (value.length > 30) return "Máximo 30 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) return "Solo se permiten letras.";
    return "";
  };
  
  const handleSuffixChange = (val: string) => {
    setSuffix(val);
    setFieldErrors((prev) => ({ ...prev, suffix: validateSuffix(val) }));
  };

  const handleAmountChange = (
    val: string,
    setter: (v: string) => void,
    field: string
  ) => {
    setter(val);
    setFieldErrors((prev) => ({ ...prev, [field]: validateAmount(val) }));
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

    const errors: Record<string, string> = {};
    const suffixErr = validateSuffix(suffix);
    if (suffixErr) errors.suffix = suffixErr;
    const totalErr = validateAmount(totalAmount);
    if (totalErr) errors.totalAmount = totalErr;
    const minCostErr = validateAmount(minCost);
    if (minCostErr) errors.minCost = minCostErr;
    const annualCostsErr = validateAmount(annualCosts);
    if (annualCostsErr) errors.annualCosts = annualCostsErr;
    const grossErr = validateAmount(grossProfit);
    if (grossErr) errors.grossProfit = grossErr;

    if (Object.values(errors).some((e) => e)) {
      setFieldErrors(errors);
      return;
    }

    setError("");



    if (parseFloat(totalAmount) <= parseFloat(minCost))
     {
      setError("La Meta Mínima debe ser menor a la Meta de Financiamiento");
     return;
      }
    if (categoryIds.length === 0) {
     setError("Debes seleccionar al menos una categoría");
      return;
    }


    setLoading(true);
    try {
      const project = await createProject({
        name,
        description,
        total_amount: parseFloat(totalAmount),
        min_amount: minCost !== "" ? parseFloat(minCost) : null,
        annual_expenses: annualCosts !== "" ? parseFloat(annualCosts) : null,
        suffix: suffix !== "" ? suffix : null,
        annual_gross_profit: grossProfit !== "" ? parseFloat(grossProfit) : null,
        ubication,
        category_ids: categoryIds,
      });

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
        <div className="cp-header">
          <h2 className="cp-title">Crear Nuevo Proyecto</h2>
          <p className="cp-subtitle">Completá los datos para publicar tu proyecto de inversión</p>
        </div>

        {error && (
          <div className="cp-error">
            <span className="cp-error-icon">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-section">
            <div className="cp-section-label">Información General</div>

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
                <label>Sufijo</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => handleSuffixChange(e.target.value)}
                  placeholder="Ej: Norte, Premium, ARG"
                  maxLength={50}
                  required
                  className={fieldErrors.suffix ? "cp-input--error" : ""}
                />
                {fieldErrors.suffix && (
                  <span className="cp-field-error">{fieldErrors.suffix}</span>
                )}
                <span className="cp-field-hint">{suffix.length}/50 caracteres · mínimo 3</span>
              </div>
            </div>

            <div className="cp-group">
              <label>Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu proyecto en detalle: objetivos, alcance, impacto esperado..."
                rows={5}
                required
              />
            </div>
          </div>

          <div className="cp-section">
            <div className="cp-section-label">Datos Financieros</div>

            <div className="cp-row">
              <div className="cp-group">
                <label>Meta Mínima</label>
                <div className="cp-input-wrapper">
                  <span className="cp-input-prefix">USD</span>
                  <input
                    type="number"
                    value={minCost}
                    onChange={(e) => handleAmountChange(e.target.value, setMinCost, "minCost")}
                    placeholder="10,000"
                    required
                    min="0"
                    step="any"
                    className={fieldErrors.minCost ? "cp-input--error" : ""}
                  />
                </div>
                {fieldErrors.minCost && (
                  <span className="cp-field-error">{fieldErrors.minCost}</span>
                )}
              </div>

              <div className="cp-group">
                <label>Meta de Financiamiento</label>
                <div className="cp-input-wrapper">
                  <span className="cp-input-prefix">USD</span>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => handleAmountChange(e.target.value, setTotalAmount, "totalAmount")}
                    placeholder="500,000"
                    required
                    min="0"
                    step="any"
                    className={fieldErrors.totalAmount ? "cp-input--error" : ""}
                  />
                </div>
                {fieldErrors.totalAmount && (
                  <span className="cp-field-error">{fieldErrors.totalAmount}</span>
                )}
              </div>
            </div>

            <div className="cp-row">
              <div className="cp-group">
                <label>Costos Anuales</label>
                <div className="cp-input-wrapper">
                  <span className="cp-input-prefix">USD</span>
                  <input
                    type="number"
                    value={annualCosts}
                    onChange={(e) => handleAmountChange(e.target.value, setAnnualCosts, "annualCosts")}
                    placeholder="Ej: 25,000"
                    required
                    min="0"
                    step="any"
                    className={fieldErrors.annualCosts ? "cp-input--error" : ""}
                  />
                </div>
                {fieldErrors.annualCosts && (
                  <span className="cp-field-error">{fieldErrors.annualCosts}</span>
                )}
              </div>

              <div className="cp-group">
                <label>Ganancias Brutas Anuales</label>
                <div className="cp-input-wrapper">
                  <span className="cp-input-prefix">USD</span>
                  <input
                    type="number"
                    value={grossProfit}
                    onChange={(e) => handleAmountChange(e.target.value, setGrossProfit, "grossProfit")}
                    placeholder="120,000"
                    required
                    min="0"
                    step="any"
                    className={fieldErrors.grossProfit ? "cp-input--error" : ""}
                  />
                </div>
                {fieldErrors.grossProfit && (
                  <span className="cp-field-error">{fieldErrors.grossProfit}</span>
                )}
              </div>
            </div>
          </div>

          <div className="cp-section">
            <div className="cp-section-label">Categorías</div>
            <div className="cp-categories">
              {categories.map((cat) => {
                const isSelected = categoryIds.some((id) => String(id) === String(cat.id));
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`cp-cat-tag ${isSelected ? "cp-cat-tag--selected" : ""}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cp-section">
            <div className="cp-section-label">Imágenes del Proyecto</div>

            <div
              className={`cp-dropzone ${isDragging ? "cp-dropzone--active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="cp-dropzone-icon-wrap">
                <Upload size={22} />
              </div>
              <p className="cp-dropzone-text">
                Arrastrá imágenes acá o <span>seleccioná archivos</span>
              </p>
              <p className="cp-dropzone-hint">PNG · JPG · WEBP &nbsp;·&nbsp; máx. 10 imágenes</p>
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
              <>
                <div className="cp-image-grid">
                  {images.map((img, i) => (
                    <div key={i} className="cp-image-thumb">
                      <img src={img.previewUrl} alt={`preview-${i}`} />
                      <button
                        type="button"
                        className="cp-image-remove"
                        onClick={() => removeImage(i)}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="cp-image-count">
                  {images.length} {images.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"} · se subirán al crear el proyecto
                </p>
              </>
            )}
          </div>

          <div className="cp-actions">
            <button type="submit" className="cp-btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="cp-spinner" /> Creando...
                </>
              ) : (
                "Crear Proyecto"
              )}
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