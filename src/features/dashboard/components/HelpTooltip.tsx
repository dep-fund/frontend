import { useState, useRef, useEffect, type ReactNode } from "react";
import "./HelpTooltip.css";

interface HelpTooltipProps {
  /** Texto corto, va arriba en negrita dentro del popover (opcional) */
  title?: string;
  /** Contenido explicativo. Podés pasar string o JSX para más control. */
  children: ReactNode;
  /** Lado preferido del popover relativo al ícono. Default: "right" */
  side?: "right" | "left" | "top" | "bottom";
  /** Tamaño del ícono en px. Default: 15 */
  size?: number;
}

/**
 * Ícono "?" minimalista que al hacer click/focus despliega un popover
 * con la explicación de un campo o concepto puntual.
 *
 * Uso:
 *   <label>
 *     Meta Mínima
 *     <HelpTooltip title="Soft Cap">
 *       Si no se alcanza este monto antes de la fecha límite, los
 *       inversores son reembolsados automáticamente.
 *     </HelpTooltip>
 *   </label>
 */
export default function HelpTooltip({
  title,
  children,
  side = "right",
  size = 15,
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      } else {
        e.stopPropagation();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span className="ht-wrap" ref={wrapRef}>
      <button
        type="button"
        className="ht-icon"
        style={{ width: size, height: size }}
        aria-label={title ? `Ayuda: ${title}` : "Más información"}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        ?
      </button>

      {open && (
        <div className={`ht-popover ht-popover--${side}`} role="tooltip">
          <div className="ht-popover-arrow" />
          {title && <div className="ht-popover-title">{title}</div>}
          <div className="ht-popover-body">{children}</div>
        </div>
      )}
    </span>
  );
}