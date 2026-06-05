import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { fetchActiveListings, fetchMarketplaceInfo } from "../services/api";
import type { Listing, MarketplaceInfo } from "../types";
import { parseContractError } from "../utils/ParseContractError";

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const MARKETPLACE_ABI = [
  "function buy(uint256 listingId, uint256 amount) external",
];

export const useMarketplace = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [info, setInfo] = useState<MarketplaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showSuccess = (msg: string) => {
    setTxSuccess(msg);
    setTimeout(() => setTxSuccess(null), 5000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listingsData, infoData] = await Promise.all([
        fetchActiveListings(),
        fetchMarketplaceInfo(),
      ]);
      setListings(listingsData);
      setInfo(infoData);
    } catch {
      setError("Error al cargar el marketplace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const buyTokens = async (listingId: number, amount: number): Promise<boolean> => {
    setTxError(null);

    if (!info) {
      setTxError("No se pudo obtener la información del contrato.");
      return false;
    }

    if (!(window as any).ethereum) {
      setTxError("Instalá MetaMask para continuar.");
      return false;
    }

    try {
      setIsProcessing(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const listing = listings.find((l) => l.id === listingId);
      if (!listing) {
        setTxError("Listing no encontrado.");
        return false;
      }

      //Para poder comprar porciones de tokens.
      if (!amount || amount <= 0) {
        setTxError("La cantidad debe ser mayor a 0.");
        return false;
      }
      const amountWei = ethers.parseUnits(amount.toFixed(18).replace(/\.?0+$/, "") || "0", 18);
      const totalUsdc = BigInt(Math.ceil(Number(ethers.formatUnits(BigInt(listing.price_per_token), 6)) * amount * 1_000_000));

      const usdc = new ethers.Contract(info.usdc_address, USDC_ABI, signer);
      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);

      const balance: bigint = await usdc.balanceOf(walletAddress);
      if (balance < totalUsdc) {
        setTxError(`Saldo insuficiente. Tenés ${ethers.formatUnits(balance, 6)} USDC.`);
        return false;
      }

      const approveTx = await usdc.approve(info.marketplace_address, totalUsdc);
      await approveTx.wait();

      const anvilProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const marketplaceReadonly = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, anvilProvider);

      try {
        await marketplaceReadonly.buy.staticCall(BigInt(listingId), amountWei, { from: walletAddress });
      } catch (simErr: any) {
        setTxError(parseContractError(simErr));
        return false;
      }

      const buyTx = await marketplace.buy(BigInt(listingId), amountWei, { gasLimit: 300000 });
      await buyTx.wait();

      showSuccess(`¡Compra exitosa! Recibiste ${amount} DPF en tu wallet.`);
      await load();
      return true;

    } catch (err: any) {
      setTxError(parseContractError(err));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    listings,
    info,
    loading,
    error,
    txError,
    setTxError,
    txSuccess,
    setTxSuccess: showSuccess,
    isProcessing,
    buyTokens,
    reload: load,
  };
};