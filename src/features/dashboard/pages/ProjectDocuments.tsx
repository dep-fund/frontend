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
  listDocuments,
  addDocument,
  deleteDocument,
} from "../services/api";

import type { ProjectDocument } from "../services/api";

const isImage = (url: string) =>
  /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

interface Props {
  projectId: string;
  isOwner: boolean;
}

export default function ProjectDocuments({
  projectId,
  isOwner,
}: Props) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
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
      const data = await listDocuments(projectId);

      setDocuments(data);
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
      Math.min(documents.length - 1, c + 1)
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
      await addDocument(
        projectId,
        file,
        description
      );

      setDescription("");
      setFile(null);
      setShowForm(false);

      await load();

      setCurrent(documents.length);
    } catch {
      setError(
        "Error al subir el documento. Intentá de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (
    number: number
  ) => {
    if (!confirm("¿Eliminar este documento?"))
      return;

    await deleteDocument(projectId, number);

    setCurrent((c) => Math.max(0, c - 1));

    await load();
  };

  const handleDrop = (
    e: React.DragEvent
  ) => {
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
          Documentos del Proyecto
        </h3>

        {isOwner && (
          <button
            className="adv-upload-btn"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm ? (
              <X size={15} />
            ) : (
              <Upload size={15} />
            )}

            {showForm
              ? "Cancelar"
              : "Subir Documento"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="adv-form">
          <div className="adv-form-group">
            <label>Descripción</label>

            <textarea
              rows={2}
              placeholder="Describí el documento..."
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
              PDF, DOCX, XLSX, PPTX, TXT ·
              máx. 12 MB
            </span>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              style={{ display: "none" }}
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ??
                    null
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
                : "Confirmar Documento"}
            </button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="adv-empty">
          <FileText
            size={28}
            color="#d1d5db"
          />

          <p>
            Todavía no hay documentos
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
            {documents.map((doc, i) => (
              <div
                key={doc.number}
                className={`adv-card ${
                  i === current
                    ? "adv-card--active"
                    : ""
                }`}
              >
                <div className="adv-media">
                  {doc.url ? (
                    <a
                      href={doc.url}
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
                      Sin documento
                    </div>
                  )}
                </div>

                <div className="adv-card-body">
                  <span className="adv-number">
                    Documento #
                    {doc.number}
                  </span>

                  <p className="adv-desc">
                    {doc.name ??
                      "Documento subido"}
                  </p>

                  {isOwner && (
                    <button
                      className="adv-delete-btn"
                      onClick={() =>
                        handleDelete(
                          doc.number
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
              documents.length - 1
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {documents.length > 1 && (
        <div className="adv-dots">
          {documents.map((_, i) => (
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

