import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  fetchPublications,
  fetchMarketplaceInfo,
  createTrade,
  confirmTrade,
  failTrade,
  getWalletByAddress,
  createWallet,
  listWallets,
  confirmMarketplaceBuy,
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

/**
 * Resuelve el wallet_id de nuestra plataforma a partir de la address de
 * MetaMask. Normaliza a lowercase (el backend guarda así) antes de
 * consultar, evita el 409 -> 404 mal manejado con un fallback a listWallets.
 */
async function resolveWalletId(rawAddress: string): Promise<string> {
  const address = rawAddress.toLowerCase();

  try {
    const wallet = await getWalletByAddress(address);
    return wallet.id;
  } catch (err: any) {
    if (err?.response?.status !== 404) throw err;

    try {
      const created = await createWallet(address);
      return created.id;
    } catch (createErr: any) {
      if (createErr?.response?.status === 409) {
        const { results } = await listWallets();
        const match = results.find((w) => w.address.toLowerCase() === address);
        if (match) return match.id;
      }
      throw createErr;
    }
  }
}

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
    let onChainConfirmed = false;

    try {
      setIsProcessing(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Resolvemos el wallet_id ANTES de cualquier tx on-chain, igual que
      // en InvestCheckout: si esto falla, todavía no se movió plata.
      let walletId: string;
      try {
        walletId = await resolveWalletId(walletAddress);
      } catch (walletError) {
        console.error("Error resolviendo wallet_id:", walletError);
        setTxError("No pudimos verificar tu wallet en la plataforma. Intentá de nuevo.");
        return false;
      }

      const amountWei = ethers.parseUnits(
        amount.toFixed(18).replace(/\.?0+$/, "") || "0",
        18
      );
      const pricePerToken = Number(publication.price_per_token);
      const totalUsdc = BigInt(Math.ceil(pricePerToken * amount * 1_000_000));

      const usdc = new ethers.Contract(info.usdc_address, USDC_ABI, signer);
      const balance: bigint = await usdc.balanceOf(walletAddress);
      if (balance < totalUsdc) {
        setTxError(`Saldo insuficiente. Tenés ${ethers.formatUnits(balance, 6)} USDC.`);
        return false;
      }

      const trade = await createTrade({
        publication_id: publication.id,
        amount: amount.toString(),
      });
      tradeId = trade.id;

      const approveTx = await usdc.approve(info.marketplace_address, totalUsdc);
      await approveTx.wait();

      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);
      const buyTx = await marketplace.buy(
        BigInt(publication.listing_id),
        amountWei,
        { gasLimit: 300000 }
      );
      const receipt = await buyTx.wait();
      onChainConfirmed = true;

      await confirmTrade(tradeId, receipt.hash);

      // Registramos la transacción de compra en nuestra plataforma.
      // Si esto falla, no revertimos nada (la compra ya está confirmada
      // on-chain y en confirmTrade); solo avisamos.
      try {
        await confirmMarketplaceBuy(receipt.hash, walletId);
      } catch (txRegisterError) {
        console.error("Error registrando transacción de compra:", txRegisterError);
      }

      showSuccess(`¡Compra exitosa! Recibiste ${amount} DPF en tu wallet.`);
      await load();
      return true;

    } catch (err: any) {
      if (onChainConfirmed) {
        setTxError(
          "Tu compra se confirmó en la blockchain, pero hubo un error al registrarla en la plataforma. " +
          "Contactá a soporte con este ID de operación: " + tradeId
        );
      } else {
        if (tradeId) await failTrade(tradeId).catch(() => {});
        setTxError(parseContractError(err));
      }
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