import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { X } from "lucide-react";
import type { MarketplaceInfo } from "../types";
import { parseContractError } from "../utils/ParseContractError";

const FACTORY_ABI = [
  "event TokenCreated(address indexed token, string name, address indexed issuer)",
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const MARKETPLACE_ABI = [
  "function list(address token, uint256 amount, uint256 pricePerToken) external returns (uint256)",
];

interface TokenOption {
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

export default function CreateListingModal({ info, onClose, onSuccess }: Props) {
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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
      const address = await signer.getAddress();
      setWalletAddress(address);
  
      // Por ahora solo existe el token DPF
      const DPF_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // ← tu address de MockDPF
      const token = new ethers.Contract(DPF_ADDRESS, ERC20_ABI, provider);
      const [name, symbol, balance] = await Promise.all([
        token.name(),
        token.symbol(),
        token.balanceOf(address),
      ]);
  
      if (balance > 0n) {
        setTokens([{ address: DPF_ADDRESS, name, symbol, balance }]);
      }
  
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

    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const amountWei = ethers.parseUnits(amount, 18);
      const priceWei = ethers.parseUnits(pricePerToken, 6); // USDC tiene 6 decimales

      const token = new ethers.Contract(selectedToken, ERC20_ABI, signer);
      const marketplace = new ethers.Contract(info.marketplace_address, MARKETPLACE_ABI, signer);

      // Paso 1: Approve
      const approveTx = await token.approve(info.marketplace_address, amountWei);
      await approveTx.wait();

      // Paso 2: List
      const listTx = await marketplace.list(selectedToken, amountWei, priceWei);
      await listTx.wait();

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

          {/* Selección de token */}
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

          {/* Cantidad */}
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

          {/* Precio por token */}
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

          {/* Resumen */}
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