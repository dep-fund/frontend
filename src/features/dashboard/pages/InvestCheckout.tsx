import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { ArrowLeft, ShieldCheck, ArrowUpDown } from "lucide-react";
import "../components/Marketplace.css";
import "./InvestCheckout.css";
import { fetchProject, fetchTokenByProject } from "../services/api";
import type { Project, ProjectToken } from "../types";
import { parseContractError } from "../utils/ParseContractError";

// ─── Env vars ────────────────────────────────────────────────────────────────
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as string;

// ─── TODO: reemplazar con endpoint cuando esté disponible ────────────────────
const TOKEN_PRICE_USDC = 0.5;

// ─── ABIs mínimos necesarios ─────────────────────────────────────────────────
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const OFFERING_ABI = [
  "function invest(uint256 usdcAmount) external",
  "function totalRaised() view returns (uint256)",
  "function HARD_CAP() view returns (uint256)",
  "function DEADLINE() view returns (uint256)",
  "function SOFT_CAP() view returns (uint256)",
];

export default function InvestCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [projectToken, setProjectToken] = useState<ProjectToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ─── Carga del proyecto y su token ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    Promise.all([fetchProject(id), fetchTokenByProject(id)])
      .then(([proj, token]) => {
        setProject(proj);
        setProjectToken(token);
      })
      .catch(() => {
        setProject(null);
        setProjectToken(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Derivados del proyecto ───────────────────────────────────────────────
  const offeringAddress = project?.offering_address ?? null;
  const tokenSuffix = projectToken?.token?.suffix ?? project?.suffix ?? "TOKEN";
  const minInvestment = 1;

  // ─── Conversión de montos ──────────────────────────────────────────────────
  const handleUsdcChange = (val: string) => {
    setUsdcAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setTokenAmount("");
    setTokenAmount((Number(val) / TOKEN_PRICE_USDC).toFixed(4));
  };

  const handleTokenChange = (val: string) => {
    setTokenAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setUsdcAmount("");
    setUsdcAmount((Number(val) * TOKEN_PRICE_USDC).toFixed(2));
  };

  // ─── Flujo de inversión ────────────────────────────────────────────────────
  const handleInvest = async () => {
    setTxError(null);
    console.log("USDC_ADDRESS:", USDC_ADDRESS);
    console.log("offering_address:", offeringAddress);

    if (!offeringAddress) {
      setTxError("Este proyecto aún no tiene un contrato de oferta desplegado.");
      return;
    }

    try {
      setIsProcessing(true);

      if (!(window as any).ethereum) {
        setTxError("Instalá MetaMask para continuar.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const offering = new ethers.Contract(offeringAddress, OFFERING_ABI, signer);

      const amountToInvest = ethers.parseUnits(usdcAmount, 6);

      // ── Validaciones pre-transacción ──────────────────────────────────────

      try {
        const balance: bigint = await usdc.balanceOf(walletAddress);
        if (balance < amountToInvest) {
          setTxError(
            `Saldo insuficiente. Tenés ${ethers.formatUnits(balance, 6)} USDC.`
          );
          return;
        }

        const deadline: bigint = await offering.DEADLINE();
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (now >= deadline) {
          setTxError("La oferta ya cerró.");
          return;
        }

        const totalRaised: bigint = await offering.totalRaised();
        const hardCap: bigint = await offering.HARD_CAP();
        if (totalRaised + amountToInvest > hardCap) {
          const disponible = ethers.formatUnits(hardCap - totalRaised, 6);
          setTxError(`Superás el Hard Cap. Máximo disponible: ${disponible} USDC.`);
          return;
        }
      } catch (validationError) {
        console.warn("Validaciones pre-tx no disponibles en este contrato:", validationError);
      }

      // ── Paso 1: Approve ───────────────────────────────────────────────────
      console.log("Aprobando USDC...");
      const approveTx = await usdc.approve(offeringAddress, amountToInvest);
      await approveTx.wait();
      console.log("Approve confirmado.");

      // ── Paso 2: Invest ────────────────────────────────────────────────────
      console.log("Ejecutando invest...");
      const investTx = await offering.invest(amountToInvest, { gasLimit: 500_000 });
      const receipt = await investTx.wait();
      console.log("Inversión confirmada. Receipt:", receipt);

      // ── Historial local (temporal hasta integración con BD) ───────────────
      const nuevaInversion = {
        projectId: id,
        usdcAmount: Number(usdcAmount),
        tokenAmount: Number(tokenAmount),
        tokenSuffix,
        tokenPrice: TOKEN_PRICE_USDC,
        txHash: investTx.hash,
        createdAt: Date.now(),
      };
      const historial = JSON.parse(
        localStorage.getItem("historial_real_inversiones") || "[]"
      );
      historial.push(nuevaInversion);
      localStorage.setItem("historial_real_inversiones", JSON.stringify(historial));

      setSuccessMessage(
        `¡Inversión de ${usdcAmount} USDC procesada con éxito! Se han acreditado ${tokenAmount} DPF-${tokenSuffix} en tu billetera.`
      );
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error en inversión:", error);
      setTxError(parseContractError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Estados de carga / error ─────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Confirmar Inversión" user={user}>
        <p className="loading-msg">Cargando detalles del proyecto...</p>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Confirmar Inversión" user={user}>
        <p className="loading-msg">Proyecto no encontrado.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Confirmar Inversión" user={user}>
      <div className="p2p-container invest-checkout-wrapper animate-fade-in">

        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="p2p-trade-box invest-trade-box animate-fade-in">

          {/* ── Info del proyecto ── */}
          <div className="trade-box-left">
            <h3 className="checkout-project-title">{project.name}</h3>
            <span className="badge-category">
              {project.categories?.[0]?.name ?? "Sin categoría"}
            </span>
            <p className="terms-text project-desc">{project.description}</p>

            <div className="project-rules">
              <h4>Condiciones de Inversión</h4>
              <ul>
                <li>
                  <ShieldCheck size={16} color="#10b981" /> Inversión mínima:{" "}
                  {minInvestment} USDC
                </li>
                <li>
                  <ShieldCheck size={16} color="#10b981" /> Fondos protegidos
                  por contrato inteligente
                </li>
                {!offeringAddress && (
                  <li style={{ color: "#f59e0b" }}>
                    ⚠ Contrato de oferta pendiente de despliegue
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* ── Inputs de inversión ── */}
          <div className="trade-box-right">
            <div className="price-indicator">
              Precio del Token:{" "}
              <strong>
                {TOKEN_PRICE_USDC} USDC / DPF-{tokenSuffix}
              </strong>
            </div>

            <div className="trade-inputs-group">
              <div className="trade-input-wrapper">
                <label>Inviertes (USDC)</label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={usdcAmount}
                    onChange={(e) => handleUsdcChange(e.target.value)}
                  />
                  <span className="symbol-label">USDC</span>
                </div>
              </div>

              <div className="trade-inputs-spacer">
                <ArrowUpDown size={16} className="text-muted" />
              </div>

              <div className="trade-input-wrapper">
                <label>Recibes (DPF-{tokenSuffix})</label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={tokenAmount}
                    onChange={(e) => handleTokenChange(e.target.value)}
                  />
                  <span className="symbol-label">DPF-{tokenSuffix}</span>
                </div>
              </div>
            </div>

            {txError && <div className="tx-error-msg">{txError}</div>}

            <div className="tx-summary-box">
              <p>
                Inversión: <strong>{usdcAmount || 0} USDC</strong>
              </p>
              <p>
                Recibirás:{" "}
                <strong>
                  {tokenAmount || 0} {tokenSuffix}
                </strong>
              </p>
              <p>
                Precio actual:{" "}
                <strong>
                  1 {tokenSuffix} = {TOKEN_PRICE_USDC} USDC
                </strong>
              </p>
            </div>

            <div className="trade-actions invest-trade-actions">
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button
                className="btn-execute bg-dep"
                disabled={
                  !usdcAmount ||
                  parseFloat(usdcAmount) < minInvestment ||
                  isProcessing ||
                  !offeringAddress
                }
                onClick={handleInvest}
              >
                {isProcessing
                  ? "Procesando en Blockchain..."
                  : "Confirmar Inversión"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de éxito ── */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <ShieldCheck
              size={48}
              color="#10b981"
              className="success-modal-icon"
            />
            <h3 className="success-modal-title">¡Inversión Exitosa!</h3>
            <p className="success-modal-text">{successMessage}</p>
            <button
              className="btn-execute bg-dep"
              onClick={() => navigate("/dashboard/investments")}
            >
              Ver Mis Inversiones
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}