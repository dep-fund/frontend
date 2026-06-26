import { useState, type ReactNode } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import "./GuideBanner.css";

interface GuideBannerProps {
  title: string;
  children: ReactNode;
  /** Si es true, arranca expandido. Default: false (colapsado). */
  defaultOpen?: boolean;
}

/**
 * Banner colapsable para explicar el flujo general de una sección
 * (ej: "¿Cómo funciona crear un proyecto?"). No es invasivo: arranca
 * cerrado y el usuario decide si quiere leerlo.
 */
export default function GuideBanner({ title, children, defaultOpen = false }: GuideBannerProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`gb-wrap ${open ? "gb-wrap--open" : ""}`}>
      <button
        type="button"
        className="gb-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="gb-header-left">
          <HelpCircle size={16} className="gb-header-icon" />
          {title}
        </span>
        <ChevronDown size={16} className="gb-chevron" />
      </button>

      {open && <div className="gb-body">{children}</div>}
    </div>
  );
}
