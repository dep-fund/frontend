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

export function useDividends(dividendAddress: string | null, walletAddress: string | null) {
  const [claimable, setClaimable] = useState<string>("0");
  const [history, setHistory] = useState<DividendHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    if (!dividendAddress || !walletAddress || !(window as any).ethereum) return;

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(dividendAddress, DIVIDENDS_ABI, provider);

      // Claimable amount
      const raw: bigint = await contract.claimable(walletAddress);
      setClaimable(ethers.formatUnits(raw, 6));

      // Historial: eventos Claimed del holder + todos los Distributed
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 1900); // margen de seguridad bajo 2000

      const [claimedEvents, distributedEvents] = await Promise.all([
        contract.queryFilter(contract.filters.Claimed(walletAddress), fromBlock, "latest"),
        contract.queryFilter(contract.filters.Distributed(), fromBlock, "latest"),
      ]);

      const claimed: DividendHistory[] = await Promise.all(
        claimedEvents.map(async (e) => {
          const block = await e.getBlock();
          return {
            type: "claimed" as const,
            amount: ethers.formatUnits((e as any).args.amount, 6),
            date: new Date(block.timestamp * 1000),
            txHash: e.transactionHash,
          };
        })
      );

      const distributed: DividendHistory[] = await Promise.all(
        distributedEvents.map(async (e) => {
          const block = await e.getBlock();
          return {
            type: "distributed" as const,
            amount: ethers.formatUnits((e as any).args.usdcAmount, 6),
            date: new Date(block.timestamp * 1000),
            txHash: e.transactionHash,
          };
        })
      );

      const all = [...claimed, ...distributed].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );
      setHistory(all);
    } catch (err: any) {
      console.error("useDividends error:", err);
      setError("No se pudo cargar la información de dividendos.");
    } finally {
      setLoading(false);
    }
  }, [dividendAddress, walletAddress]);

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

  return { claimable, history, loading, claiming, error, claimSuccess, refetch: fetchData, claim};
}