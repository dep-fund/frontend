import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { X } from "lucide-react";
import type { MarketplaceInfo } from "../types";
import { parseContractError } from "../utils/ParseContractError";
import {
  fetchAllTokens,
  createPublication,
  getWalletByAddress,
  createWallet,
  listWallets,
  confirmMarketplaceSell,
} from "../services/api";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const MARKETPLACE_ABI = [
  "function list(address token, uint256 amount, uint256 pricePerToken) external returns (uint256)",
  "event Listed(uint256 indexed listingId, address indexed seller, uint256 indexed totalAmount, uint256 pricePerToken)",
];

interface TokenOption {
  id: string;
  address: string;
  name: string;
  symbol: string;
  balance: bigint;
}

interface Props {
  info: MarketplaceInfo;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Resuelve el wallet_id de nuestra plataforma a partir de la address de
 * MetaMask. Normaliza a lowercase (el backend guarda así), evita el 409
 * mal manejado con un fallback a listWallets.
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

export default function CreateListingModal({ info, onClose, onSuccess }: Props) {
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserTokens();
  }, []);

  const loadUserTokens = async () => {
    setLoadingTokens(true);
    setError(null);
    try {
      if (!(window as any).ethereum) {
        setError("Instalá MetaMask para continuar.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const platformTokens = await fetchAllTokens();

      const tokensWithBalance: TokenOption[] = [];
      for (const t of platformTokens) {
        const contract = new ethers.Contract(t.contract_address, ERC20_ABI, provider);
        const balance: bigint = await contract.balanceOf(walletAddress);
        if (balance > 0n) {
          tokensWithBalance.push({
            id: t.id,
            address: t.contract_address,
            name: t.name,
            symbol: `DPF-${t.suffix}`,
            balance,
          });
        }
      }

      setTokens(tokensWithBalance);
    } catch {
      setError("Error al cargar tus tokens.");
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!selectedToken) return setError("Seleccioná un token.");
    if (!amount || Number(amount) <= 0) return setError("Ingresá una cantidad válida.");
    if (!pricePerToken || Number(pricePerToken) <= 0) return setError("Ingresá un precio válido.");

    const tokenData = tokens.find((t) => t.address === selectedToken);
    if (!tokenData) return setError("Token no encontrado.");

    try {
      const amountWei = ethers.parseUnits(amount, 18);
      if (amountWei > tokenData.balance) {
        return setError("No tenés tokens suficientes.");
      }
    } catch {
      return setError("Cantidad inválida.");
    }

    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Resolvemos el wallet_id ANTES de cualquier tx on-chain: si esto
      // falla, todavía no se aprobó ni listó nada.
      let walletId: string;
      try {
        walletId = await resolveWalletId(walletAddress);
      } catch (walletError) {
        console.error("Error resolviendo wallet_id:", walletError);
        setError("No pudimos verificar tu wallet en la plataforma. Intentá de nuevo.");
        return;
      }

      const amountWei = ethers.parseUnits(amount, 18);
      const priceWei = ethers.parseUnits(pricePerToken, 6);

      // 1. Approve token al marketplace
      const token = new ethers.Contract(selectedToken, ERC20_ABI, signer);
      const approveTx = await token.approve(info.marketplace_address, amountWei);
      await approveTx.wait();

      // 2. List en blockchain
      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);
      const listTx = await marketplace.list(selectedToken, amountWei, priceWei);
      const receipt = await listTx.wait();

      // 3. Extraer listingId del evento Listed
      const marketplaceInterface = new ethers.Interface(MARKETPLACE_ABI);
      let listingId: number | null = null;

      for (const log of receipt.logs) {
        try {
          const parsed = marketplaceInterface.parseLog(log);
          if (parsed?.name === "Listed") {
            listingId = Number(parsed.args.listingId);
            break;
          }
        } catch {
          // log de otro contrato, ignorar
        }
      }

      if (listingId === null) {
        return setError("No se pudo obtener el ID del listing del contrato.");
      }

      // 4. Guardar en DB con listing_id
      await createPublication({
        token_id: tokenData.id,
        total: amount,
        price_per_token: pricePerToken,
        listing_id: listingId,
      });

      // 5. Registrar la transacción de venta en nuestra plataforma.
      // Si esto falla, no revertimos nada (el listing ya está confirmado
      // on-chain y en createPublication); solo avisamos por consola.
      try {
        await confirmMarketplaceSell(listTx.hash, walletId);
      } catch (txRegisterError) {
        console.error("Error registrando transacción de venta:", txRegisterError);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(parseContractError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTokenData = tokens.find((t) => t.address === selectedToken);

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-modal-header">
          <h2>Crear Publicación de Venta</h2>
          <button className="form-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-body">
          <div className="form-group">
            <label>Token DPF a vender</label>
            {loadingTokens ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>Cargando tus tokens...</p>
            ) : tokens.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                No tenés tokens DPF disponibles en tu wallet.
              </p>
            ) : (
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "0 12px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "white",
                }}
              >
                <option value="">Seleccioná un token</option>
                {tokens.map((t) => (
                  <option key={t.address} value={t.address}>
                    {t.name} ({t.symbol}) — {ethers.formatUnits(t.balance, 18)} disponibles
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Cantidad a vender (DPF)</label>
            <div className="input-with-symbol">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={selectedTokenData ? ethers.formatUnits(selectedTokenData.balance, 18) : undefined}
              />
              <span className="symbol-label">DPF</span>
            </div>
            {selectedTokenData && (
              <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                Disponible: {ethers.formatUnits(selectedTokenData.balance, 18)} {selectedTokenData.symbol}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Precio por token (USDC)</label>
            <div className="input-with-symbol">
              <input
                type="number"
                placeholder="0.00"
                value={pricePerToken}
                onChange={(e) => setPricePerToken(e.target.value)}
              />
              <span className="symbol-label">USDC</span>
            </div>
          </div>

          {amount && pricePerToken && (
            <div style={{
              background: "#f0f9f9",
              border: "1px solid #2C7176",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "13px",
              color: "#2C7176",
            }}>
              Total estimado de venta:{" "}
              <strong>
                {(Number(amount) * Number(pricePerToken)).toFixed(2)} USDC
              </strong>
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn-execute bg-fund"
              onClick={handleSubmit}
              disabled={isProcessing || loadingTokens || tokens.length === 0}
            >
              {isProcessing ? "Procesando..." : "Publicar Oferta"}
            </button>
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}