import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  fetchPublications,
  fetchMarketplaceInfo,
  createTrade,
  confirmTrade,
  failTrade,
} from "../services/api";
import type { Publication, MarketplaceInfo } from "../types";
import { parseContractError } from "../utils/ParseContractError";

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

const MARKETPLACE_ABI = [
  "function buy(uint256 listingId, uint256 amount) external",
];

export const useMarketplace = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
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
      const [publicationsData, infoData] = await Promise.all([
        fetchPublications(),
        fetchMarketplaceInfo(),
      ]);
      setPublications(publicationsData);
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

  const buyTokens = async (publication: Publication, amount: number): Promise<boolean> => {
    setTxError(null);

    if (!info) {
      setTxError("No se pudo obtener la información del contrato.");
      return false;
    }

    if (!(window as any).ethereum) {
      setTxError("Instalá MetaMask para continuar.");
      return false;
    }

    if (!amount || amount <= 0) {
      setTxError("La cantidad debe ser mayor a 0.");
      return false;
    }

    if (publication.listing_id === null || publication.listing_id === undefined) {
      setTxError("Esta publicación no tiene un listing ID válido.");
      return false;
    }

    let tradeId: string | null = null;

    try {
      setIsProcessing(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const amountWei = ethers.parseUnits(
        amount.toFixed(18).replace(/\.?0+$/, "") || "0",
        18
      );
      const pricePerToken = Number(publication.price_per_token);
      const totalUsdc = BigInt(Math.ceil(pricePerToken * amount * 1_000_000));

      // 1. Verificar saldo USDC
      const usdc = new ethers.Contract(info.usdc_address, USDC_ABI, signer);
      const balance: bigint = await usdc.balanceOf(walletAddress);
      if (balance < totalUsdc) {
        setTxError(`Saldo insuficiente. Tenés ${ethers.formatUnits(balance, 6)} USDC.`);
        return false;
      }

      // 2. Crear trade en DB (pending)
      const trade = await createTrade({
        publication_id: publication.id,
        amount: amount.toString(),
      });
      tradeId = trade.id;

      // 3. Approve USDC al marketplace
      const approveTx = await usdc.approve(info.marketplace_address, totalUsdc);
      await approveTx.wait();

      // 4. Buy en blockchain usando el listing_id guardado en DB
      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);
      const buyTx = await marketplace.buy(
        BigInt(publication.listing_id),
        amountWei,
        { gasLimit: 300000 }
      );
      const receipt = await buyTx.wait();

      // 5. Confirmar trade en DB con tx_hash
      await confirmTrade(tradeId, receipt.hash);

      showSuccess(`¡Compra exitosa! Recibiste ${amount} DPF en tu wallet.`);
      await load();
      return true;

    } catch (err: any) {
      if (tradeId) {
        await failTrade(tradeId).catch(() => {});
      }
      setTxError(parseContractError(err));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    publications,
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