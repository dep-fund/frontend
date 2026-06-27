import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { ArrowLeft, ShieldCheck, ArrowUpDown, Info, X, Coins, TrendingUp, AlertCircle } from "lucide-react";
import "../components/Marketplace.css";
import "./InvestCheckout.css";
import { fetchProject, fetchTokenByProject, createInvestment, getWalletByAddress, createWallet } from "../services/api";
import type { Project, ProjectToken } from "../types";
import { parseContractError } from "../utils/ParseContractError";

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as string;

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

/**
 * Resuelve el wallet_id (de nuestra plataforma) a partir de la address
 * conectada en MetaMask. Si la wallet no está registrada (404), la crea
 * y reintenta. Se llama ANTES de ejecutar la tx on-chain, para no dejar
 * plata movida sin poder registrar la inversión después.
 */
async function resolveWalletId(address: string): Promise<string> {
  try {
    const wallet = await getWalletByAddress(address);
    return wallet.id;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const created = await createWallet(address);
      return created.id;
    }
    throw err;
  }
}

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
  const [priceTooltipOpen, setPriceTooltipOpen] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);

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

  const offeringAddress = project?.offering_address ?? null;
  const tokenSuffix = projectToken?.token?.suffix ?? project?.suffix ?? "TOKEN";
  const minInvestment = 1;

  const tokenPrice = projectToken?.current_price
    ? Number(projectToken.current_price)
    : null;

  console.log("projectToken:", projectToken);
  console.log("current_price raw:", projectToken?.current_price);
  console.log("tokenPrice calculado:", tokenPrice);

  const handleUsdcChange = (val: string) => {
    setUsdcAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val)) || !tokenPrice) return setTokenAmount("");
    setTokenAmount((Number(val) / tokenPrice).toFixed(4));
  };

  const handleTokenChange = (val: string) => {
    setTokenAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val)) || !tokenPrice) return setUsdcAmount("");
    setUsdcAmount((Number(val) * tokenPrice).toFixed(2));
  };

  const handleInvest = async () => {
    setTxError(null);

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

      // Resolvemos el wallet_id de nuestra plataforma ANTES de ejecutar
      // cualquier tx on-chain. Si esto falla, no se movió plata todavía.
      let walletId: string;
      try {
        walletId = await resolveWalletId(walletAddress);
      } catch (walletError) {
        console.error("Error resolviendo wallet_id:", walletError);
        setTxError("No pudimos verificar tu wallet en la plataforma. Intentá de nuevo.");
        return;
      }

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const offering = new ethers.Contract(offeringAddress, OFFERING_ABI, signer);

      const amountToInvest = ethers.parseUnits(usdcAmount, 6);

      try {
        const balance: bigint = await usdc.balanceOf(walletAddress);
        if (balance < amountToInvest) {
          setTxError(`Saldo insuficiente. Tenés ${ethers.formatUnits(balance, 6)} USDC.`);
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
        if ((totalRaised + amountToInvest) > hardCap) {
          const disponible = ethers.formatUnits(hardCap - totalRaised, 6);
          setTxError(`Superás el Hard Cap. Máximo disponible: ${disponible} USDC.`);
          return;
        }
      } catch (validationError) {
        console.warn("Validaciones pre-tx no disponibles:", validationError);
      }

      const approveTx = await usdc.approve(offeringAddress, amountToInvest);
      await approveTx.wait();

      const investTx = await offering.invest(amountToInvest, { gasLimit: 500_000 });
      const receipt = await investTx.wait();
      console.log("Inversión confirmada. Receipt:", receipt);

      try {
        await createInvestment(id!, {
          token_quantity: Number(tokenAmount),
          unit_price: tokenPrice ?? 0,
          tx_hash: investTx.hash,
          wallet_id: walletId,
        });
      } catch (backendError) {
        // La inversión en blockchain ya se confirmó (la plata se movió).
        // Si esto falla, no podemos revertir la tx, pero hay que avisar
        // para que se pueda reclamar/reintentar el registro manualmente.
        console.error("La inversión se confirmó en blockchain pero falló el registro en el backend:", backendError);
        setTxError(
          "Tu inversión se confirmó en la blockchain, pero hubo un error al registrarla en la plataforma. " +
          "Contactá a soporte con este hash de transacción: " + investTx.hash
        );
        setIsProcessing(false);
        return;
      }

      setSuccessMessage(
        `¡Inversión de ${usdcAmount} USDC procesada con éxito! Se han acreditado aproximadamente ${tokenAmount} DPF-${tokenSuffix} en tu billetera. ` +
        `El monto exacto puede variar levemente por el redondeo de la bonding curve.`
      );
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error en inversión:", error);
      setTxError(parseContractError(error));
    } finally {
      setIsProcessing(false);
    }
  };

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

          {/* Columna izquierda — info del proyecto */}
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
                <li style={{ color: "#6b7280", fontSize: "12px" }}>
                  ⚠ El monto de tokens recibido puede variar levemente por redondeo de la bonding curve.
                </li>
                {!offeringAddress && (
                  <li style={{ color: "#f59e0b" }}>
                    ⚠ Contrato de oferta pendiente de despliegue
                  </li>
                )}
              </ul>
            </div>

            {/* Mini-panel de ayuda contextual */}
            <div className="checkout-help-block">
              <button
                className="checkout-help-toggle"
                onClick={() => setHelpPanelOpen((v) => !v)}
                aria-expanded={helpPanelOpen}
              >
                <Info size={14} />
                ¿Cómo funciona esta inversión?
                <span className="checkout-help-toggle-arrow">{helpPanelOpen ? "▲" : "▼"}</span>
              </button>

              {helpPanelOpen && (
                <div className="checkout-help-content">

                  <div className="checkout-help-item">
                    <div className="checkout-help-item-icon">
                      <Coins size={13} />
                    </div>
                    <div>
                      <p className="checkout-help-item-title">¿Qué recibo?</p>
                      <p className="checkout-help-item-text">
                        Tokens <strong>$DPF</strong> proporcionales a tu inversión en USDC. Cada token representa participación real en el complejo y genera dividendos cuando el proyecto distribuye ganancias.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-help-item">
                    <div className="checkout-help-item-icon checkout-help-item-icon--green">
                      <TrendingUp size={13} />
                    </div>
                    <div>
                      <p className="checkout-help-item-title">¿Puedo salir después?</p>
                      <p className="checkout-help-item-text">
                        Sí. Podés vender tus $DPF en el Marketplace en cualquier momento a precio de mercado y recibir USDC de los compradores.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-help-item">
                    <div className="checkout-help-item-icon checkout-help-item-icon--amber">
                      <AlertCircle size={13} />
                    </div>
                    <div>
                      <p className="checkout-help-item-title">¿Qué pasa si el proyecto no llega a su meta?</p>
                      <p className="checkout-help-item-text">
                        Si la oferta no alcanza su mínimo de recaudación antes del cierre, recuperás tu USDC íntegramente.
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Columna derecha — inputs de inversión */}
          <div className="trade-box-right">

            {/* Precio con tooltip explicativo */}
            <div className="price-indicator">
              <span>
                Precio del Token:{" "}
                <strong>
                  {tokenPrice ? `${tokenPrice.toFixed(6)} USDC` : "Cargando..."} / DPF-{tokenSuffix}
                </strong>
              </span>
              <button
                className="checkout-price-info-btn"
                onClick={() => setPriceTooltipOpen((v) => !v)}
                aria-label="¿Por qué varía el precio?"
              >
                <Info size={14} />
              </button>
            </div>

            {priceTooltipOpen && (
              <div className="checkout-price-tooltip">
                <button
                  className="checkout-price-tooltip-close"
                  onClick={() => setPriceTooltipOpen(false)}
                  aria-label="Cerrar"
                >
                  <X size={13} />
                </button>
                <p className="checkout-price-tooltip-title">Precio dinámico</p>
                <p className="checkout-price-tooltip-text">
                  El precio del token sube a medida que el proyecto recauda más fondos. Invertir antes significa un precio más bajo y mayor cantidad de tokens por el mismo USDC.
                </p>
                <p className="checkout-price-tooltip-text">
                  El precio mostrado es el actual. El monto final de tokens puede variar levemente si otra transacción se confirma antes.
                </p>
              </div>
            )}

            <div className="trade-inputs-group">
              <div className="trade-input-wrapper">
                <label>Inviertes (USDC)</label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={usdcAmount}
                    onChange={(e) => handleUsdcChange(e.target.value)}
                    disabled={!tokenPrice}
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
                    disabled={!tokenPrice}
                  />
                  <span className="symbol-label">DPF-{tokenSuffix}</span>
                </div>
              </div>
            </div>

            {txError && <div className="tx-error-msg">{txError}</div>}

            <div className="tx-summary-box">
              <p>Inversión: <strong>{usdcAmount || 0} USDC</strong></p>
              <p>Recibirás (aprox.): <strong>{tokenAmount || 0} {tokenSuffix}</strong></p>
              <p>
                Precio actual:{" "}
                <strong>
                  1 {tokenSuffix} ≈ {tokenPrice ? tokenPrice.toFixed(6) : "..."} USDC
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
                  !offeringAddress ||
                  !tokenPrice
                }
                onClick={handleInvest}
              >
                {isProcessing ? "Procesando en Blockchain..." : "Confirmar Inversión"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <ShieldCheck size={48} color="#10b981" className="success-modal-icon" />
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