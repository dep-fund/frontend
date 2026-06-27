import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const DIVIDENDS_ABI = [
  "function claimable(address holder) view returns (uint256)",
  "function claim() external",
  "function dividendPerToken() view returns (uint256)",
  "event Claimed(address indexed holder, uint256 indexed amount)",
  "event Distributed(uint256 indexed usdcAmount, uint256 indexed dividendPerToken)",
];

export interface DividendHistory {
  type: "claimed" | "distributed";
  amount: string;
  date: Date;
  txHash: string;
}

export function useDividends(
  dividendAddress: string | null,
  walletAddress: string | null,
  projectId: string | null
) {
  const [claimable, setClaimable] = useState<string>("0");
  const [history, setHistory] = useState<DividendHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    if (!dividendAddress || !walletAddress || !projectId || !(window as any).ethereum) return;

    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(dividendAddress, DIVIDENDS_ABI, provider);
      const raw: bigint = await contract.claimable(walletAddress);
      setClaimable(ethers.formatUnits(raw, 6));
    } catch (err: any) {
      console.error("claimable error:", err);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transaction/projects/${projectId}/dividends/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const all: DividendHistory[] = data.map((tx: any) => ({
        type: tx.type === "DIVIDEND" ? "claimed" : "distributed",
        amount: "0",
        date: new Date(tx.created_at),
        txHash: tx.tx_hash,
      }));
      setHistory(all.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (err: any) {
      console.error("history error:", err);
    } finally {
      setLoading(false);
    }
  }, [dividendAddress, walletAddress, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const claim = useCallback(async () => {
    if (!dividendAddress || !(window as any).ethereum) return;

    try {
      setClaiming(true);
      setError(null);
      setClaimSuccess(false);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(dividendAddress, DIVIDENDS_ABI, signer);

      const tx = await contract.claim({ gasLimit: 200_000 });
      await tx.wait();

      setClaimSuccess(true);
      await fetchData();
    } catch (err: any) {
      console.error("claim error:", err);
      if (err?.reason) {
        setError(err.reason);
      } else {
        setError("Error al reclamar dividendos. Intentá de nuevo.");
      }
    } finally {
      setClaiming(false);
    }
  }, [dividendAddress, fetchData]);

  return { claimable, history, loading, claiming, error, claimSuccess, refetch: fetchData, claim };
}