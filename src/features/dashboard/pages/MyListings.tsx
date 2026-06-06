import { useState, useEffect } from "react";
import { ethers } from "ethers";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { fetchMyListings, fetchMarketplaceInfo } from "../services/api";
import { parseContractError } from "../utils/ParseContractError";
import type { Listing, MarketplaceInfo } from "../types";
import "./MyListings.css";

const MARKETPLACE_ABI = ["function cancel(uint256 listingId) external"];

export default function MyListings() {
  const { user } = useUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [info, setInfo] = useState<MarketplaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(window as any).ethereum) { setError("Instalá MetaMask para continuar."); return; }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const [active, finalized, cancelled, infoData] = await Promise.all([
        fetchMyListings(walletAddress, "active"),
        fetchMyListings(walletAddress, "finalized"),
        fetchMyListings(walletAddress, "cancelled"),
        fetchMarketplaceInfo(),
      ]);
      setListings([...active, ...finalized, ...cancelled].sort((a, b) => a.id - b.id));
      setInfo(infoData);
    } catch {
      setError("Error al cargar tus publicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (listingId: number) => {
    setTxError(null);
    setTxSuccess(null);
    if (!info) return;
    try {
      setCancelingId(listingId);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);

      const tx = await marketplace.cancel(BigInt(listingId), { gasLimit: 200000 });
      await tx.wait();
      setTxSuccess(`Publicación #${listingId + 1} cancelada. Tus tokens fueron devueltos.`);
      await load();
    } catch (err: any) {
      setTxError(parseContractError(err));
    } finally {
      setCancelingId(null);
    }
  };

  const formatTokens = (amount: number) => ethers.formatUnits(BigInt(amount), 18);
  const formatPrice  = (price: number)  => ethers.formatUnits(BigInt(price), 6);
  const shortAddress = (addr: string)   => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const tokensSold = (l: Listing) =>
    Number(formatTokens(l.total_amount - l.remaining_amount));

  const earnings = (l: Listing) =>
    (tokensSold(l) * Number(formatPrice(l.price_per_token))).toFixed(2);

  const accentClass = (status: string) =>
    status === "finalized" ? "listing-card-accent--finalized"
    : status === "cancelled" ? "listing-card-accent--cancelled"
    : "";

  const statusLabel: Record<string, string> = {
    active: "Activa", finalized: "Finalizada", cancelled: "Cancelada",
  };

  return (
    <DashboardLayout title="Mis Publicaciones" user={user}>
      <div className="myprojects-header">
        <span className="myprojects-count">
          {listings.length} publicación{listings.length !== 1 ? "es" : ""}
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

      {!loading && listings.length === 0 && (
        <div className="myprojects-empty">
          <p>No tenés publicaciones todavía.</p>
        </div>
      )}

      <div className="mylistings-grid">
        {listings.map((listing) => (
          <div key={listing.id} className="listing-card">
            <div className={`listing-card-accent ${accentClass(listing.status)}`} />
            <div className="listing-card-body">
              <div className="listing-card-top">
                <div>
                  <div className="listing-card-title">Publicación #{listing.id + 1}</div>
                  <div className="listing-card-sub">{shortAddress(listing.seller)}</div>
                </div>
                <span className={`listing-badge listing-badge--${listing.status}`}>
                  {statusLabel[listing.status]}
                </span>
              </div>

              <div className="listing-metrics">
                <div className="listing-metric">
                  <div className="listing-metric-label">Precio / token</div>
                  <div className="listing-metric-value">{formatPrice(listing.price_per_token)} USDC</div>
                </div>
                <div className="listing-metric">
                  <div className="listing-metric-label">Disponible</div>
                  <div className="listing-metric-value">{formatTokens(listing.remaining_amount)} DPF</div>
                </div>
                <div className="listing-metric">
                  <div className="listing-metric-label">Tokens vendidos</div>
                  <div className="listing-metric-value listing-metric-value--highlight">{tokensSold(listing)} DPF</div>
                </div>
                <div className="listing-metric">
                  <div className="listing-metric-label">Ganancias</div>
                  <div className="listing-metric-value listing-metric-value--highlight">{earnings(listing)} USDC</div>
                </div>
              </div>

              <div className="listing-divider" />
              <div className="listing-row">
                <span>Total original</span>
                <span>{formatTokens(listing.total_amount)} DPF</span>
              </div>
              <div className="listing-row">
                <span>Token</span>
                <span>{shortAddress(listing.token)}</span>
              </div>

              {listing.status === "active" && (
                <button
                  className="btn-cancel-listing"
                  onClick={() => handleCancel(listing.id)}
                  disabled={cancelingId === listing.id}
                >
                  {cancelingId === listing.id ? "Cancelando..." : "Cancelar publicación"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}