import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  FileText,
  X,
} from "lucide-react";

import "./ProjectAdvances.css";
import {
  listAdvances,
  addAdvance,
  deleteAdvance,
} from "../services/api";

import type { ProjectAdvance } from "../services/api";

const isImage = (url: string) =>
  /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

interface Props {
  projectId: string;
  isOwner: boolean;
}

export default function ProjectAdvances({
  projectId,
  isOwner,
}: Props) {
  const [advances, setAdvances] = useState<ProjectAdvance[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await listAdvances(projectId);
      setAdvances(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const prev = () =>
    setCurrent((c) => Math.max(0, c - 1));

  const next = () =>
    setCurrent((c) =>
      Math.min(advances.length - 1, c + 1)
    );

  const handleUpload = async () => {
    if (!file || !description.trim()) {
      setError(
        "Completá la descripción y seleccioná un archivo."
      );
      return;
    }

    setError("");
    setUploading(true);

    try {
      await addAdvance(projectId, file, description);

      setDescription("");
      setFile(null);
      setShowForm(false);

      await load();

      setCurrent(advances.length);
    } catch {
      setError(
        "Error al subir el avance. Intentá de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (number: number) => {
    if (!confirm("¿Eliminar este avance?")) return;

    await deleteAdvance(projectId, number);

    setCurrent((c) => Math.max(0, c - 1));

    await load();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const dropped = e.dataTransfer.files[0];

    if (dropped) {
      setFile(dropped);
    }
  };

  if (loading) return null;

  return (
    <div className="adv-wrapper">
      <div className="adv-header">
        <h3 className="adv-title">
          Avances del Proyecto
        </h3>

        {isOwner && (
          <button
            className="adv-upload-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <X size={15} />
            ) : (
              <Upload size={15} />
            )}

            {showForm
              ? "Cancelar"
              : "Subir Avance"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="adv-form">
          <div className="adv-form-group">
            <label>Descripción</label>

            <textarea
              rows={2}
              placeholder="Describí el avance..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <div
            className="adv-dropzone"
            onClick={() =>
              fileRef.current?.click()
            }
            onDrop={handleDrop}
            onDragOver={(e) =>
              e.preventDefault()
            }
          >
            <FileText
              size={22}
              color="#EC8F41"
            />

            {file ? (
              <span className="adv-filename">
                {file.name}
              </span>
            ) : (
              <span>
                Arrastrá o{" "}
                <strong>
                  hacé click
                </strong>{" "}
                para seleccionar
              </span>
            )}

            <span className="adv-hint">
              JPG, PNG, WEBP o PDF · máx.
              12 MB
            </span>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: "none" }}
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ?? null
                )
              }
            />
          </div>

          {error && (
            <p className="adv-error">
              {error}
            </p>
          )}

          <div className="adv-form-actions">
            <button
              className="adv-submit-btn"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading
                ? "Subiendo..."
                : "Confirmar Avance"}
            </button>
          </div>
        </div>
      )}

      {advances.length === 0 ? (
        <div className="adv-empty">
          <FileText
            size={28}
            color="#d1d5db"
          />

          <p>
            Todavía no hay avances
            publicados.
          </p>
        </div>
      ) : (
        <div className="adv-carousel">
          <button
            className="adv-arrow"
            onClick={prev}
            disabled={current === 0}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="adv-cards-track">
            {advances.map((adv, i) => (
              <div
                key={adv.number}
                className={`adv-card ${
                  i === current
                    ? "adv-card--active"
                    : ""
                }`}
              >
                <div className="adv-media">
                  {adv.url &&
                  isImage(adv.url) ? (
                    <a
                      href={adv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="adv-image-link"
                    >
                      <img
                        src={adv.url}
                        alt={`Avance ${adv.number}`}
                      />
                    </a>
                  ) : adv.url ? (
                    <a
                      href={adv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="adv-pdf-preview"
                    >
                      <FileText
                        size={32}
                        color="#EC8F41"
                      />

                      <span>
                        Ver documento
                      </span>
                    </a>
                  ) : (
                    <div className="adv-no-media">
                      Sin archivo
                    </div>
                  )}
                </div>

                <div className="adv-card-body">
                  <span className="adv-number">
                    Avance #{adv.number}
                  </span>

                  <p className="adv-desc">
                    {adv.description}
                  </p>

                  {isOwner && (
                    <button
                      className="adv-delete-btn"
                      onClick={() =>
                        handleDelete(
                          adv.number
                        )
                      }
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className="adv-arrow"
            onClick={next}
            disabled={
              current ===
              advances.length - 1
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {advances.length > 1 && (
        <div className="adv-dots">
          {advances.map((_, i) => (
            <button
              key={i}
              className={`adv-dot ${
                i === current
                  ? "adv-dot--active"
                  : ""
              }`}
              onClick={() =>
                setCurrent(i)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}