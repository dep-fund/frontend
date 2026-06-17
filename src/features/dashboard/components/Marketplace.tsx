import { useState } from "react";
import { ethers } from "ethers";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import "./Marketplace.css";
import "./MarketplaceInline.css";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useMarketplace } from "../hooks/useMarketplace";
import CreateListingModal from "../components/CreateListingModal";
import type { Publication } from "../types";

export default function Marketplace() {
  const { user } = useUser();
  const {
    publications,
    info,
    loading,
    error,
    txError,
    setTxError,
    txSuccess,
    isProcessing,
    buyTokens,
    reload,
  } = useMarketplace();

  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleOpenTrade = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setUsdcAmount("");
      setTokenAmount("");
      setTxError(null);
    }
  };

  const formatPrice = (price: string) =>
    Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  const formatTokens = (amount: string) =>
    Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const handleUsdcChange = (val: string, pricePerToken: string) => {
    setUsdcAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setTokenAmount("");
    setTokenAmount((Number(val) / Number(pricePerToken)).toFixed(4));
  };

  const handleTokenChange = (val: string, pricePerToken: string) => {
    setTokenAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setUsdcAmount("");
    setUsdcAmount((Number(val) * Number(pricePerToken)).toFixed(2));
  };

  const handleBuy = async (publication: Publication) => {
    if (!tokenAmount || isNaN(Number(tokenAmount))) return;
    const numericAmount = Number(tokenAmount);
    if (numericAmount <= 0) {
      setTxError("La cantidad a comprar debe ser mayor a 0.");
      return;
    }
    const success = await buyTokens(publication, numericAmount);
    if (success) {
      setSelectedId(null);
      setUsdcAmount("");
      setTokenAmount("");
    }
  };

  const shortAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const activePublications = publications.filter((p) => p.status === "active");
  const myPublications = publications.filter((p) => p.seller_id === user?.id);

  return (
    <DashboardLayout title="Marketplace" user={user}>
      <div className="p2p-container animate-fade-in">

        {txSuccess && (
          <div className="p2p-tx-success">{txSuccess}</div>
        )}

        <div className="p2p-header-container">
          <div className="p2p-header-tabs p2p-header-tabs-override">
            <button
              className={`tab-btn tab-btn-buy ${tradeType === "BUY" ? "tab-btn--active-buy" : ""}`}
              onClick={() => { setTradeType("BUY"); setSelectedId(null); }}
            >
              Comprar
            </button>
            <button
              className={`tab-btn tab-btn-sell ${tradeType === "SELL" ? "tab-btn--active-sell" : ""}`}
              onClick={() => { setTradeType("SELL"); setSelectedId(null); }}
            >
              Vender
            </button>
          </div>

          {tradeType === "SELL" && (
            <button
              className="btn-execute bg-fund btn-new-listing"
              onClick={() => setShowCreateModal(true)}
            >
              + Nueva Publicación
            </button>
          )}
        </div>

        {/* TAB COMPRAR */}
        {tradeType === "BUY" && (
          <>
            {loading && <p className="loading-msg">Cargando publicaciones...</p>}
            {error && <p className="loading-msg p2p-error-text">{error}</p>}

            {!loading && !error && activePublications.length === 0 && (
              <p className="loading-msg">No hay ofertas activas en este momento.</p>
            )}

            {!loading && !error && activePublications.length > 0 && (
              <div className="p2p-table-wrapper">
                <div className="p2p-table-header">
                  <div className="col-advertiser">Vendedor</div>
                  <div className="col-price">Precio / Token</div>
                  <div className="col-limit">Disponible</div>
                  <div className="col-trade">Operar</div>
                </div>

                {activePublications.map((pub) => {
                  const isOpen = selectedId === pub.id;
                  return (
                    <div key={pub.id} className="p2p-row-group">
                      <div className="p2p-row">
                        <div className="col-advertiser">
                          <div className="adv-badge">
                            {pub.token.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="adv-name">{pub.token.name}</span>
                            <p className="adv-stats">DPF-{pub.token.suffix}</p>
                          </div>
                        </div>

                        <div className="col-price font-bold">
                          {formatPrice(pub.price_per_token)} USDC
                        </div>

                        <div className="col-limit">
                          <p><span>Disponible:</span> {formatTokens(pub.available)} DPF</p>
                          <p><span>Total original:</span> {formatTokens(pub.total)} DPF</p>
                        </div>

                        <div className="col-trade">
                          <button
                            className="trade-action-btn btn-buy"
                            onClick={() => handleOpenTrade(pub.id)}
                          >
                            Comprar DPF
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p2p-trade-box animate-fade-in">
                          <div className="trade-box-left">
                            <h4>Términos de la publicación</h4>
                            <p className="terms-text">
                              Asegurate de tener saldo suficiente en USDC para cubrir el monto
                              y los fees de red (Gas). La transacción se ejecuta directamente
                              en el Smart Contract. Una vez confirmada, recibirás los tokens DPF
                              en tu wallet.
                              <br /><br />
                              <strong>Aclaración:</strong> La Plataforma se queda con el 2% de los tokens que compres.
                            </p>
                          </div>

                          <div className="trade-box-right">
                            <div className="price-indicator">
                              Precio por token: <strong>{formatPrice(pub.price_per_token)} USDC</strong>
                            </div>

                            <div className="trade-inputs-group">
                              <div className="trade-input-wrapper">
                                <label>Pagás (USDC)</label>
                                <div className="input-with-symbol">
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={usdcAmount}
                                    onChange={(e) => handleUsdcChange(e.target.value, pub.price_per_token)}
                                  />
                                  <span className="symbol-label">USDC</span>
                                </div>
                              </div>

                              <div className="trade-inputs-spacer">
                                <ArrowUpDown size={16} className="text-muted" />
                              </div>

                              <div className="trade-input-wrapper">
                                <label>Recibís (DPF)</label>
                                <div className="input-with-symbol">
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={tokenAmount}
                                    onChange={(e) => handleTokenChange(e.target.value, pub.price_per_token)}
                                  />
                                  <span className="symbol-label">DPF</span>
                                </div>
                              </div>
                            </div>

                            {txError && (
                              <div className="p2p-tx-error">{txError}</div>
                            )}

                            <div className="trade-actions">
                              <button className="btn-secondary" onClick={() => setSelectedId(null)}>
                                Cancelar
                              </button>
                              <button
                                className="btn-execute bg-dep"
                                disabled={!tokenAmount || Number(tokenAmount) <= 0 || isProcessing}
                                onClick={() => handleBuy(pub)}
                              >
                                {isProcessing ? "Procesando..." : "Confirmar Compra"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB VENDER */}
        {tradeType === "SELL" && (
          <>
            {loading && <p className="loading-msg">Cargando tus publicaciones...</p>}

            {!loading && myPublications.length === 0 && (
              <p className="loading-msg">No tenés publicaciones activas.</p>
            )}

            {!loading && myPublications.length > 0 && (
              <div className="p2p-table-wrapper">
                <div className="p2p-table-header">
                  <div className="col-advertiser">Token</div>
                  <div className="col-price">Precio / Token</div>
                  <div className="col-limit">Disponible</div>
                  <div className="col-trade">Estado</div>
                </div>

                {myPublications.map((pub) => (
                  <div key={pub.id} className="p2p-row-group">
                    <div className="p2p-row">
                      <div className="col-advertiser">
                        <div className="adv-badge">
                          {pub.token.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="adv-name">{pub.token.name}</span>
                          <p className="adv-stats">DPF-{pub.token.suffix}</p>
                        </div>
                      </div>

                      <div className="col-price font-bold">
                        {formatPrice(pub.price_per_token)} USDC
                      </div>

                      <div className="col-limit">
                        <p><span>Disponible:</span> {formatTokens(pub.available)} DPF</p>
                        <p><span>Total original:</span> {formatTokens(pub.total)} DPF</p>
                      </div>

                      <div className="col-trade">
                        <span className={`status-badge status-${pub.status}`}>
                          {pub.status === "active" ? "Activa" : pub.status === "completed" ? "Completada" : "Cancelada"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && info && (
        <CreateListingModal
          info={info}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            reload();
          }}
        />
      )}
    </DashboardLayout>
  );
}