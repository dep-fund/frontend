import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import "./Marketplace.css";
import DashboardLayout from "../components/DashboardLayout";
import ListingRow from "../components/ListingRow";
import CreateListingModal from "../components/CreateListingModal";
import { useUser } from "../hooks/useUser";
import { useMarketplace } from "../hooks/useMarketplace";

export default function Marketplace() {
  const { user }                    = useUser();
  const {
    listings, loading, txStatus,
    isConnected, setTxStatus,
    fetchListings, handleBuy, handleCreate,
  }                                 = useMarketplace();
  const [tradeType, setTradeType]   = useState<"BUY" | "SELL">("BUY");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  console.log("isConnected:", isConnected, "tradeType:", tradeType);
  console.log("MARKETPLACE:", import.meta.env.VITE_MARKETPLACE_ADDRESS);
  console.log("USDC:", import.meta.env.VITE_USDC_ADDRESS);
  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <DashboardLayout title="Marketplace" user={user}>
      <div className="p2p-container animate-fade-in">

        {/* Status de transacción */}
        {txStatus && (
          <div className={`tx-status ${txStatus.startsWith("✅") ? "tx-status--ok" : "tx-status--err"}`}>
            {txStatus}
            <button onClick={() => setTxStatus(null)}><X size={14} /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="p2p-header-tabs">
          <div className="tabs-left">
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

          {tradeType === "SELL" && isConnected && (
            <button className="btn-create-listing" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Crear publicación
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="p2p-table-wrapper">
          <div className="p2p-table-header">
            <div className="col-advertiser">Vendedor</div>
            <div className="col-price">Precio (USDC)</div>
            <div className="col-limit">Disponible</div>
            <div className="col-trade">Operar</div>
          </div>

          {listings.length === 0 && (
            <div className="p2p-empty">No hay publicaciones activas en el contrato.</div>
          )}

          {listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              tradeType={tradeType}
              isOpen={selectedId === listing.id}
              loading={loading}
              isConnected={isConnected}
              onToggle={() => setSelectedId(selectedId === listing.id ? null : listing.id)}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateListingModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </DashboardLayout>
  );
}