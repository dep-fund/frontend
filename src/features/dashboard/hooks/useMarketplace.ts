import { useState, useCallback } from "react";
import { Contract, BrowserProvider } from "ethers";
import { useConnection } from "wagmi";
import { useBlockchain } from "../../../blockchain/useBlockchain";
import { ABI, ADDRESSES } from "../../../blockchain/config";
import { buyListing, getListing, listToken } from "../../../blockchain/marketplace";
import type { Listing } from "../types/marketplace";

export function useMarketplace() {
  const { getSigner }               = useBlockchain();
  const { isConnected }             = useConnection();
  const [listings, setListings]     = useState<Listing[]>([]);
  const [loading, setLoading]       = useState(false);
  const [txStatus, setTxStatus]     = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const provider    = new BrowserProvider(window.ethereum as any);
      const marketplace = new Contract(ADDRESSES.MARKETPLACE, ABI.MARKETPLACE, provider);
      const count       = (await marketplace.listingsCount()) as bigint;

      const results: Listing[] = [];
      for (let i = 0; i < Number(count); i++) {
        const l = await getListing(i);
        if (l.active) results.push({ id: i, ...l });
      }
      setListings(results);
    } catch (err) {
      console.error("Error cargando listings:", err);
    }
  }, []);

  const handleBuy = async (listing: Listing) => {
    setLoading(true);
    setTxStatus(null);
    try {
      const signer = getSigner();
      const hash   = await buyListing(signer, listing.id, listing.priceUsdc);
      setTxStatus(`✅ Compra exitosa — TX: ${hash.slice(0, 18)}...`);
      await fetchListings();
    } catch (err: any) {
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (token: string, amount: string, price: string) => {
    setTxStatus(null);
    try {
      const signer    = getSigner();
      const amountBig = BigInt(Math.floor(Number(amount) * 1e18));
      const priceBig  = BigInt(Math.floor(Number(price)  * 1e6));
      const listingId = await listToken(signer, token, amountBig, priceBig);
      setTxStatus(`✅ Publicación creada — listing #${listingId}`);
      await fetchListings();
      return true;
    } catch (err: any) {
      setTxStatus(`❌ Error: ${err.message}`);
      return false;
    }
  };

  return {
    listings,
    loading,
    txStatus,
    isConnected,
    setTxStatus,
    fetchListings,
    handleBuy,
    handleCreate,
  };
}