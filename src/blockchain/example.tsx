import { useState } from "react";
import { useBlockchain, invest, claimDividends, listToken } from "@/services/blockchain";

/**
 * Ejemplo de uso del servicio blockchain en un componente React.
 * Mostramos invest, claim y list — el resto sigue el mismo patrón.
 */
export function ProjectActions({ offeringAddress, dividendsAddress, tokenAddress }) {
  const { getSigner, isReady } = useBlockchain();
  const [loading, setLoading]  = useState(false);
  const [txHash, setTxHash]    = useState<string | null>(null);

  // ── Invertir en el Offering ──────────────────────────────────────────────
  const handleInvest = async () => {
    setLoading(true);
    try {
      const signer = getSigner();
      const hash   = await invest(signer, offeringAddress, 100n * 10n**6n); // 100 USDC
      setTxHash(hash);

      // Registrás en el backend si hace falta
      await fetch("/api/investments", {
        method: "POST",
        body: JSON.stringify({ tx_hash: hash, offering: offeringAddress }),
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Reclamar dividendos ──────────────────────────────────────────────────
  const handleClaim = async () => {
    setLoading(true);
    try {
      const signer = getSigner();
      const hash   = await claimDividends(signer, dividendsAddress);
      setTxHash(hash);
    } finally {
      setLoading(false);
    }
  };

  // ── Listar tokens en el Marketplace ─────────────────────────────────────
  const handleList = async () => {
    setLoading(true);
    try {
      const signer    = getSigner();
      const listingId = await listToken(
        signer,
        tokenAddress,
        500n * 10n**18n,  // 500 DPF
        250n * 10n**6n    // 250 USDC
      );

      // Registrás en el backend
      await fetch("/api/marketplace/listings", {
        method: "POST",
        body: JSON.stringify({ listing_id: listingId }),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) return <p>Conectá tu wallet para continuar</p>;

  return (
    <div>
      <button onClick={handleInvest} disabled={loading}>Invertir 100 USDC</button>
      <button onClick={handleClaim}  disabled={loading}>Reclamar dividendos</button>
      <button onClick={handleList}   disabled={loading}>Listar tokens</button>
      {txHash && <p>TX: {txHash}</p>}
    </div>
  );
}
