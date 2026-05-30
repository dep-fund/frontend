import { useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { formatUsdc, formatToken, shortAddress } from "../utils/marketplace";
import type { Listing } from "../types/marketplace";

interface Props {
  listing:     Listing;
  tradeType:   "BUY" | "SELL";
  isOpen:      boolean;
  loading:     boolean;
  isConnected: boolean;
  onToggle:    () => void;
  onBuy:       (listing: Listing) => void;
}

export default function ListingRow({
  listing, tradeType, isOpen, loading, isConnected, onToggle, onBuy,
}: Props) {
  const [usdtAmount,  setUsdtAmount]  = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const precioNum = Number(listing.priceUsdc) / 1e6;

  const handleUsdtChange = (val: string) => {
    setUsdtAmount(val);
    setTokenAmount(!val || isNaN(Number(val)) ? "" : (Number(val) / precioNum).toFixed(4));
  };

  const handleTokenChange = (val: string) => {
    setTokenAmount(val);
    setUsdtAmount(!val || isNaN(Number(val)) ? "" : (Number(val) * precioNum).toFixed(2));
  };

  return (
    <div className="p2p-row-group">
      <div className="p2p-row">
        {/* Vendedor */}
        <div className="col-advertiser">
          <div className="adv-badge">{listing.seller[2].toUpperCase()}</div>
          <div>
            <span className="adv-name">{shortAddress(listing.seller)}</span>
            <p className="adv-stats">Token: {shortAddress(listing.token)}</p>
          </div>
        </div>

        {/* Precio */}
        <div className="col-price font-bold">
          {formatUsdc(listing.priceUsdc)} USDC
        </div>

        {/* Disponible */}
        <div className="col-limit">
          <p><span>Disponible:</span> {formatToken(listing.amount)} DPF</p>
        </div>

        {/* Acción */}
        <div className="col-trade">
          <button
            className={`trade-action-btn ${tradeType === "BUY" ? "btn-buy" : "btn-sell"}`}
            onClick={onToggle}
          >
            {tradeType === "BUY" ? "Comprar DPF" : "Vender DPF"}
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Panel de compra */}
      {isOpen && (
        <div className="p2p-trade-box animate-fade-in">
          <div className="trade-box-left">
            <h4>Términos</h4>
            <p className="terms-text">
              Asegurate de tener saldo suficiente para cubrir el gas.
              La transacción se ejecuta directamente en el Smart Contract.
            </p>
          </div>

          <div className="trade-box-right">
            <div className="price-indicator">
              Precio: <strong>{precioNum.toFixed(2)} USDC</strong>
            </div>

            <div className="trade-inputs-group">
              <div className="trade-input-wrapper">
                <label>Pagas (USDC)</label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={usdtAmount}
                    onChange={(e) => handleUsdtChange(e.target.value)}
                  />
                  <span className="symbol-label">USDC</span>
                </div>
              </div>

              <div className="trade-inputs-spacer">
                <ArrowUpDown size={16} className="text-muted" />
              </div>

              <div className="trade-input-wrapper">
                <label>Recibes (DPF)</label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={tokenAmount}
                    onChange={(e) => handleTokenChange(e.target.value)}
                  />
                  <span className="symbol-label">DPF</span>
                </div>
              </div>
            </div>

            <div className="trade-actions">
              <button className="btn-secondary" onClick={onToggle}>
                Cancelar
              </button>
              <button
                className="btn-execute bg-dep"
                disabled={loading || !isConnected}
                onClick={() => onBuy(listing)}
              >
                {loading ? "Procesando..." : "Confirmar Compra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}