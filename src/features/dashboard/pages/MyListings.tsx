import { useState, useEffect } from "react";
import { ethers } from "ethers";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { fetchMyPublications, fetchMarketplaceInfo, cancelPublication } from "../services/api";
import type { Publication, MarketplaceInfo } from "../types";
import "./MyListings.css";

const MARKETPLACE_ABI = ["function cancel(uint256 listingId) external"];

export default function MyListings() {
  const { user } = useUser();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [info, setInfo] = useState<MarketplaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pubs, infoData] = await Promise.all([
        fetchMyPublications(),
        fetchMarketplaceInfo(),
      ]);
      setPublications(pubs);
      setInfo(infoData);
    } catch {
      setError("Error al cargar tus publicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (publication: Publication) => {
    setTxError(null);
    setTxSuccess(null);
    if (!info || publication.listing_id === null) return;

    try {
      setCancelingId(publication.id);

      // 1. Cancelar en blockchain
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);
      const tx = await marketplace.cancel(BigInt(publication.listing_id), { gasLimit: 200000 });
      await tx.wait();

      // 2. Cancelar en BD
      await cancelPublication(publication.id);

      setTxSuccess(`Publicación cancelada. Tus tokens fueron devueltos.`);
      await load();
    } catch (err: any) {
      setTxError(err?.shortMessage || err?.message || "Error al cancelar.");
    } finally {
      setCancelingId(null);
    }
  };

  const formatTokens = (amount: string) => Number(amount).toLocaleString("es-AR", { maximumFractionDigits: 4 });
  const formatPrice = (price: string) => Number(price).toFixed(6);
  const tokensSold = (p: Publication) => Number(p.total) - Number(p.available);
  const earnings = (p: Publication) => (tokensSold(p) * Number(p.price_per_token)).toFixed(2);

  const accentClass = (status: string) =>
    status === "completed" ? "listing-card-accent--finalized"
    : status === "canceled" ? "listing-card-accent--cancelled"
    : "";

  const statusLabel: Record<string, string> = {
    active: "Activa",
    completed: "Completada",
    canceled: "Cancelada",
  };

  return (
    <DashboardLayout title="Mis Publicaciones" user={user}>
      <div className="myprojects-header">
        <span className="myprojects-count">
          {publications.length} publicación{publications.length !== 1 ? "es" : ""}
        </span>
      </div>

      {loading && <div className="myprojects-loading">Cargando publicaciones...</div>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {txError && (
        <div style={{ margin: "12px 0", padding: "10px 14px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", fontSize: "0.875rem" }}>
          {txError}
        </div>
      )}
      {txSuccess && (
        <div style={{ margin: "12px 0", padding: "10px 14px", borderRadius: "8px", background: "#dcfce7", color: "#166534", fontSize: "0.875rem" }}>
          {txSuccess}
        </div>
      )}

      {!loading && publications.length === 0 && (
        <div className="myprojects-empty">
          <p>No tenés publicaciones todavía.</p>
        </div>
      )}

      <div className="mylistings-grid">
        {publications.map((pub) => (
          <div key={pub.id} className="listing-card">
            <div className={`listing-card-accent ${accentClass(pub.status)}`} />
            <div className="listing-card-body">
              <div className="listing-card-top">
                <div>
                  <div className="listing-card-title">{pub.token.name}</div>
                  <div className="listing-card-sub">DPF-{pub.token.suffix}</div>
                </div>
                <span className={`listing-badge listing-badge--${pub.status}`}>
                  {statusLabel[pub.status] ?? pub.status}
                </span>
              </div>

              <div className="listing-metrics">
                <div className="listing-metric">
                  <div className="listing-metric-label">Precio / token</div>
                  <div className="listing-metric-value">{formatPrice(pub.price_per_token)} USDC</div>
                </div>
                <div className="listing-metric">
                  <div className="listing-metric-label">Disponible</div>
                  <div className="listing-metric-value">{formatTokens(pub.available)} DPF</div>
                </div>
                <div className="listing-metric">
                  <div className="listing-metric-label">Tokens vendidos</div>
                  <div className="listing-metric-value listing-metric-value--highlight">
                    {formatTokens(String(tokensSold(pub)))} DPF
                  </div>
                </div>
                <div className="listing-metric">
                  <div className="listing-metric-label">Ganancias</div>
                  <div className="listing-metric-value listing-metric-value--highlight">
                    {earnings(pub)} USDC
                  </div>
                </div>
              </div>

              <div className="listing-divider" />
              <div className="listing-row">
                <span>Total original</span>
                <span>{formatTokens(pub.total)} DPF</span>
              </div>
              <div className="listing-row">
                <span>Listing ID</span>
                <span>#{pub.listing_id !== null ? pub.listing_id + 1 : "—"}</span>
              </div>

              {pub.status === "active" && (
                <button
                  className="btn-cancel-listing"
                  onClick={() => handleCancel(pub)}
                  disabled={cancelingId === pub.id}
                >
                  {cancelingId === pub.id ? "Cancelando..." : "Cancelar publicación"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}