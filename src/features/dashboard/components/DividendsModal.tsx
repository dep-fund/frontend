import { useEffect, useState } from "react";
import { X, TrendingUp, Clock, CheckCircle, AlertCircle, Coins } from "lucide-react";
import { useDividends, type DividendHistory } from "../hooks/useDividends";
import "./DividendsModal.css";

interface DividendsModalProps {
  projectName: string;
  projectId: string;
  dividendAddress: string;
  walletAddress: string;
  onClose: () => void;
}

export default function DividendsModal({
  projectName,
  projectId,
  dividendAddress,
  walletAddress,
  onClose,
}: DividendsModalProps) {
  const { claimable, history, loading, claiming, error, claimSuccess, refetch, claim } =
    useDividends(dividendAddress, walletAddress, projectId);

  const [tab, setTab] = useState<"overview" | "history">("overview");

  const hasClaimable = parseFloat(claimable) >= 0.000001;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="div-overlay" onClick={onClose}>
      <div className="div-modal" onClick={(e) => e.stopPropagation()}>

        <div className="div-header">
          <div className="div-header-left">
            <div className="div-icon-wrap">
              <Coins size={18} color="#EC8F41" />
            </div>
            <div>
              <p className="div-header-label">Dividendos</p>
              <h2 className="div-header-title">{projectName}</h2>
            </div>
          </div>
          <button className="div-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="div-tabs">
          <button
            className={`div-tab ${tab === "overview" ? "div-tab--active" : ""}`}
            onClick={() => setTab("overview")}
          >
            Resumen
          </button>
          <button
            className={`div-tab ${tab === "history" ? "div-tab--active" : ""}`}
            onClick={() => setTab("history")}
          >
            Historial
          </button>
        </div>

        <div className="div-body">
          {loading ? (
            <div className="div-loading">
              <div className="div-spinner" />
              <p>Consultando la blockchain...</p>
            </div>
          ) : tab === "overview" ? (
            <OverviewTab
              claimable={claimable}
              hasClaimable={hasClaimable}
              claiming={claiming}
              error={error}
              claimSuccess={claimSuccess}
              claim={claim}
              onClaim={() => refetch()}
            />
          ) : (
            <HistoryTab history={history} />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  claimable,
  hasClaimable,
  claiming,
  error,
  claimSuccess,
  claim,
  onClaim,
}: {
  claimable: string;
  hasClaimable: boolean;
  claiming: boolean;
  error: string | null;
  claimSuccess: boolean;
  claim: () => Promise<void>;
  onClaim: () => void;
}) {
  const handleClaim = async () => {
    await claim();
    onClaim();
  };

  return (
    <div className="div-overview">
      <div className="div-balance-card">
        <p className="div-balance-label">Disponible para retirar</p>
        <p className="div-balance-amount">
          {parseFloat(claimable).toFixed(2)}
          <span className="div-balance-currency"> USDC</span>
        </p>
        {!hasClaimable && (
          <p className="div-balance-hint">
            No tenés dividendos pendientes en este momento.
          </p>
        )}
      </div>

      <div className="div-info-row">
        <div className="div-info-item">
          <TrendingUp size={14} color="#2C7176" />
          <span>Los dividendos se acreditan cada vez que el proyecto distribuye ganancias.</span>
        </div>
        <div className="div-info-item">
          <Clock size={14} color="#2C7176" />
          <span>Podés reclamar en cualquier momento sin vencimiento.</span>
        </div>
      </div>

      {error && (
        <div className="div-feedback div-feedback--error">
          <AlertCircle size={15} />
          {error}
        </div>
      )}
      {claimSuccess && (
        <div className="div-feedback div-feedback--success">
          <CheckCircle size={15} />
          ¡USDC acreditados en tu billetera!
        </div>
      )}

      <button
        className="div-claim-btn"
        disabled={!hasClaimable || claiming}
        onClick={handleClaim}
      >
        {claiming ? (
          <>
            <div className="div-spinner div-spinner--sm" />
            Procesando en blockchain...
          </>
        ) : (
          `Reclamar ${hasClaimable ? parseFloat(claimable).toFixed(2) + " USDC" : ""}`
        )}
      </button>
    </div>
  );
}

function HistoryTab({ history }: { history: DividendHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="div-empty">
        <Coins size={32} color="#e5e7eb" />
        <p>No hay movimientos registrados aún.</p>
        <span>El historial aparecerá aquí cuando el proyecto distribuya ganancias.</span>
      </div>
    );
  }

  return (
    <div className="div-history">
      {history.map((item, i) => (
        <div key={i} className="div-history-item">
          <div
            className={`div-history-dot ${
              item.type === "claimed" ? "div-history-dot--claimed" : "div-history-dot--distributed"
            }`}
          />
          <div className="div-history-info">
            <p className="div-history-type">
              {item.type === "claimed" ? "Retiro realizado" : "Distribución del proyecto"}
            </p>
            <p className="div-history-date">
              {item.date.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="div-history-right">
            <a
              href={`https://sepolia.basescan.org/tx/${item.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="div-history-tx"
            >
              Ver tx ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}