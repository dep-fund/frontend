import { useState, useRef } from "react";
import "./CreateProject.css";
import { ChevronLeft, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useCategories } from "../hooks/useCategories";
import { createProject, uploadProjectImage } from "../services/api";
import HelpTooltip from "../components/HelpTooltip";
import GuideBanner from "../components/GuideBanner"

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

    if (parseFloat(totalAmount) <= parseFloat(minCost)) {
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

        <GuideBanner title="¿Cómo funciona publicar un proyecto?">
          <div className="gb-steps">
            <div className="gb-step">
              <span className="gb-step-num">1</span>
              <span className="gb-step-text">
                Completás los datos del proyecto y lo enviás (primero debe enviar el proyecto con esta sección, posteriormente debe ir a la sección "Mis Proyectos", seleccionar el proyecto y cargar la documentación). Un <b>administrador</b> revisa la
                documentación y costos antes de aprobarlo.
              </span>
            </div>
            <div className="gb-step">
              <span className="gb-step-num">2</span>
              <span className="gb-step-text">
                Una vez aprobado, se abre a inversión. Los inversores compran tokens <b>$DPF</b>{" "}
                de tu proyecto; el precio sube a medida que se acerca a la meta.
              </span>
            </div>
            <div className="gb-step">
              <span className="gb-step-num">3</span>
              <span className="gb-step-text">
                Si se alcanza la <b>Meta Mínima</b> antes de la fecha límite, podés retirar los
                fondos (se descuenta una comisión de plataforma). Si no se alcanza, los
                inversores son reembolsados automáticamente.
              </span>
            </div>
          </div>
          <p style={{ marginTop: 12 }}>
            Importante: una vez publicado el proyecto, estos datos quedan asociados a un
            contrato en blockchain y <strong>no se pueden modificar</strong>. Revisá los montos
            con cuidado antes de confirmar.
          </p>
        </GuideBanner>

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
                <label>
                  Sufijo
                  <HelpTooltip title="Sufijo del token">
                    Va a formar el nombre de tu token en la plataforma, con el formato{" "}
                    <strong>DPF-SUFIJO</strong>. Por ejemplo, si el sufijo es "Norte", el token se
                    va a llamar <strong>DPF-NORTE</strong>. No se puede cambiar después de crear
                    el proyecto.
                  </HelpTooltip>
                </label>
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
            <div className="cp-section-label">
              Datos Financieros
              <HelpTooltip title="Datos Financieros" side="bottom">
                Estos números definen cómo se calcula el precio del token y cuánto vas a poder
                retirar. Te recomendamos completarlos con datos reales: van a estar visibles para
                los inversores y respaldan tu reputación como desarrollador.
              </HelpTooltip>
            </div>

            <div className="cp-row">
              <div className="cp-group">
                <label>
                  Meta Mínima
                  <HelpTooltip title="Meta Mínima (Soft Cap)">
                    Es el monto mínimo que necesitás recaudar para que el proyecto sea viable. Si
                    no se alcanza antes de la fecha límite, <strong>todos los inversores son
                    reembolsados automáticamente</strong> y el proyecto no avanza.
                  </HelpTooltip>
                </label>
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
                <label>
                  Meta de Financiamiento
                  <HelpTooltip title="Meta de Financiamiento (Hard Cap)">
                    Es el techo máximo que tu proyecto puede recaudar. El precio del token
                    empieza más bajo y va subiendo a medida que se acerca a este monto, así que
                    los primeros inversores entran a mejor precio.
                  </HelpTooltip>
                </label>
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
                <label>
                  Costos Anuales
                  <HelpTooltip title="Costos Anuales">
                    Gastos operativos estimados del complejo por año (mantenimiento, personal,
                    servicios, etc.). Ayuda a los inversores a entender la rentabilidad neta real
                    del proyecto.
                  </HelpTooltip>
                </label>
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
                <label>
                  Ganancias Brutas Anuales
                  <HelpTooltip title="Ganancias Brutas Anuales">
                    Facturación estimada del complejo por año, antes de descontar costos. Junto
                    con los Costos Anuales, le permite a los inversores estimar el dividendo
                    mensual que podrían recibir.
                  </HelpTooltip>
                </label>
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