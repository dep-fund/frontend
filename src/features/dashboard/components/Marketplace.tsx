import { useState } from "react";
import { ethers } from "ethers";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import "./Marketplace.css";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useMarketplace } from "../hooks/useMarketplace";
import CreateListingModal from "../components/CreateListingModal";
import type { Listing } from "../types";

export default function Marketplace() {
  const { user } = useUser();
  const { listings, info, loading, error, txError, setTxError, txSuccess, setTxSuccess, isProcessing, buyTokens, reload } = useMarketplace();

  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleOpenTrade = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setUsdcAmount("");
      setTokenAmount("");
      setTxError(null);
    }
  };

  const formatPrice = (pricePerToken: number) =>
    ethers.formatUnits(BigInt(pricePerToken), 6);

  const formatTokens = (amount: number) =>
    ethers.formatUnits(BigInt(amount), 18);

  const handleUsdcChange = (val: string, pricePerToken: number) => {
    setUsdcAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setTokenAmount("");
    const price = Number(ethers.formatUnits(BigInt(pricePerToken), 6));
    setTokenAmount((Number(val) / price).toFixed(4));
  };

  const handleTokenChange = (val: string, pricePerToken: number) => {
    setTokenAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setUsdcAmount("");
    const price = Number(ethers.formatUnits(BigInt(pricePerToken), 6));
    setUsdcAmount((Number(val) * price).toFixed(2));
  };

  const handleBuy = async (listing: Listing) => {
    if (!tokenAmount || isNaN(Number(tokenAmount))) return;
    const success = await buyTokens(listing.id, Math.floor(Number(tokenAmount)));
    if (success) {
      setSelectedId(null);
      setUsdcAmount("");
      setTokenAmount("");
    }
  };

  const shortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <DashboardLayout title="Marketplace" user={user}>
      <div className="p2p-container animate-fade-in">

        {txSuccess && (
          <div style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#dcfce7",
            color: "#166534",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}>
            {txSuccess}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <div className="p2p-header-tabs" style={{ marginBottom: 0, flex: 1 }}>
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

          {tradeType === "SELL" && info && (
            <button
              className="btn-execute bg-fund"
              style={{ padding: "12px 20px", fontSize: "14px" }}
              onClick={() => setShowCreateModal(true)}
            >
              + Nueva Publicación
            </button>
          )}
        </div>

        {tradeType === "BUY" && (
          <>
            {loading && <p className="loading-msg">Cargando listings...</p>}
            {error && <p className="loading-msg" style={{ color: "red" }}>{error}</p>}

            {!loading && !error && listings.length === 0 && (
              <p className="loading-msg">No hay ofertas activas en este momento.</p>
            )}

            {!loading && !error && listings.length > 0 && (
              <div className="p2p-table-wrapper">
                <div className="p2p-table-header">
                  <div className="col-advertiser">Vendedor</div>
                  <div className="col-price">Precio / Token</div>
                  <div className="col-limit">Disponible</div>
                  <div className="col-trade">Operar</div>
                </div>

                {listings.map((listing) => {
                  const isOpen = selectedId === listing.id;
                  return (
                    <div key={listing.id} className="p2p-row-group">
                      <div className="p2p-row">
                        <div className="col-advertiser">
                          <div className="adv-badge">{listing.seller[2].toUpperCase()}</div>
                          <div>
                            <span className="adv-name">{shortAddress(listing.seller)}</span>
                            <p className="adv-stats">Token: {shortAddress(listing.token)}</p>
                          </div>
                        </div>

                        <div className="col-price font-bold">
                          {formatPrice(listing.price_per_token)} USDC
                        </div>

                        <div className="col-limit">
                          <p><span>Disponible:</span> {formatTokens(listing.remaining_amount)} DPF</p>
                          <p><span>Total original:</span> {formatTokens(listing.total_amount)} DPF</p>
                        </div>

                        <div className="col-trade">
                          <button
                            className="trade-action-btn btn-buy"
                            onClick={() => handleOpenTrade(listing.id)}
                          >
                            Comprar DPF
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p2p-trade-box animate-fade-in">
                          <div className="trade-box-left">
                            <h4>Términos del listing</h4>
                            <p className="terms-text">
                              Asegurate de tener saldo suficiente en USDC para cubrir el monto
                              y los fees de red (Gas). La transacción se ejecuta directamente
                              en el Smart Contract. Una vez confirmada, recibirás los tokens DPF
                              en tu wallet.
                            </p>
                          </div>

                          <div className="trade-box-right">
                            <div className="price-indicator">
                              Precio por token: <strong>{formatPrice(listing.price_per_token)} USDC</strong>
                            </div>

                            <div className="trade-inputs-group">
                              <div className="trade-input-wrapper">
                                <label>Pagás (USDC)</label>
                                <div className="input-with-symbol">
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={usdcAmount}
                                    onChange={(e) => handleUsdcChange(e.target.value, listing.price_per_token)}
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
                                    onChange={(e) => handleTokenChange(e.target.value, listing.price_per_token)}
                                  />
                                  <span className="symbol-label">DPF</span>
                                </div>
                              </div>
                            </div>

                            {txError && (
                              <div style={{
                                marginTop: "0.75rem",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                background: "#fee2e2",
                                color: "#991b1b",
                                fontSize: "0.875rem",
                              }}>
                                {txError}
                              </div>
                            )}

                            <div className="trade-actions">
                              <button className="btn-secondary" onClick={() => setSelectedId(null)}>
                                Cancelar
                              </button>
                              <button
                                className="btn-execute bg-dep"
                                disabled={!tokenAmount || Number(tokenAmount) <= 0 || isProcessing}
                                onClick={() => handleBuy(listing)}
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

        {tradeType === "SELL" && (
          <p className="loading-msg">No tenés publicaciones activas.</p>
        )}

      </div>

      {showCreateModal && info && (
        <CreateListingModal
          info={info}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            reload();
            setTxSuccess("¡Publicación creada exitosamente!");
          }}
        />
      )}

    </DashboardLayout>
  );
}