import { TrendingUp, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { listProjectImages } from "../services/api";
import DividendsModal from "./DividendsModal";
import "./ProjectCard.css";

const DIVIDENDS_ABI = [
  "function claimable(address holder) view returns (uint256)",
];

/**
 * Formatea el monto reclamable para el badge de la card. Usa notación
 * compacta a partir de los miles (1.2K, 45.3K) para que el texto nunca
 * crezca tanto como para desbordar o achicar el badge de forma rara,
 * sin importar cuán grande sea el monto acumulado.
 */
const formatClaimable = (amount: number): string => {
  if (amount >= 1000) {
    return new Intl.NumberFormat("es-AR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return amount.toFixed(2);
};

export default function InvestmentCard({ investment }: { investment: any }) {
  const navigate = useNavigate();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showDividends, setShowDividends] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [claimableAmount, setClaimableAmount] = useState<string>("0");

  const tokens = investment.tokens || 0;
  const progress = investment.progress || "0%";
  const investedAmount = investment.amount || 0;
  const dividendAddress = investment.dividendAddress ?? null;

  // Obtener wallet conectada
  useEffect(() => {
    if (!(window as any).ethereum) return;
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    provider.getSigner()
      .then((s) => s.getAddress())
      .then(setWalletAddress)
      .catch(() => null);
  }, []);

  // Consultar claimable para mostrar badge
  useEffect(() => {
    if (!dividendAddress || !walletAddress || !(window as any).ethereum) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const contract = new ethers.Contract(dividendAddress, DIVIDENDS_ABI, provider);
    contract.claimable(walletAddress)
      .then((raw: bigint) => setClaimableAmount(ethers.formatUnits(raw, 6)))
      .catch(() => null);
  }, [dividendAddress, walletAddress]);

  useEffect(() => {
    if (investment.projectId) {
      listProjectImages(investment.projectId)
        .then((imgs) => imgs.length > 0 ? setCoverUrl(imgs[0].url) : null)
        .catch(() => null);
    }
  }, [investment.projectId]);

  const claimableNumeric = parseFloat(claimableAmount);
  const hasClaimable = claimableNumeric >= 0.000001;

  return (
    <>
      <div className="project-card">
        <div className="project-card-header">
          {coverUrl ? (
            <img src={coverUrl} alt={investment.projectName} className="project-card-cover" />
          ) : (
            <div className="project-card-cover project-card-cover--placeholder" />
          )}
          <span className="project-badge badge--active">Inversión Activa</span>

          {/* Badge de dividendos disponibles */}
          {hasClaimable && (
            <span className="project-badge badge--dividends" title={`${claimableNumeric.toFixed(6)} USDC dividendos`}>
              {formatClaimable(claimableNumeric)} USDC • Disponible
            </span>
          )}
        </div>

        <div className="project-card-body">
          <h3 className="project-card-name">{investment.projectName || "Proyecto Deportivo"}</h3>
          <p className="project-card-category" style={{ color: "#2C7176", fontWeight: 600 }}>
            Participación: {tokens} DPF
          </p>

          <div className="project-card-stats" style={{ marginTop: "16px" }}>
            <div>
              <span className="stat-label">Invertido (USDC)</span>
              <span className="stat-value">{investedAmount}</span>
            </div>
            <div>
              <span className="stat-label">Progreso</span>
              <span className="stat-value" style={{ color: "#EC8F41" }}>{progress}</span>
            </div>
          </div>

          <div className="project-card-actions" style={{ marginTop: "16px" }}>
            <button
              className="btn-detail"
              onClick={() => navigate(`/dashboard/projects/${investment.projectId}`)}
            >
              <TrendingUp size={15} /> Ver Rendimiento
            </button>

            {dividendAddress && (
              <button
                className={`btn-dividends ${hasClaimable ? "btn-dividends--active" : ""}`}
                onClick={() => setShowDividends(true)}
              >
                <Coins size={15} />
                Dividendos
              </button>
            )}
          </div>
        </div>
      </div>

      {showDividends && dividendAddress && walletAddress && (
        <DividendsModal
          projectName={investment.projectName}
          projectId={investment.projectId}
          dividendAddress={dividendAddress}
          walletAddress={walletAddress}
          onClose={() => setShowDividends(false)}
        />
      )}
    </>
  );
}