import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose:  () => void;
  onCreate: (token: string, amount: string, price: string) => Promise<boolean>;
}

export default function CreateListingModal({ onClose, onCreate }: Props) {
  const [token,      setToken]      = useState("");
  const [amount,     setAmount]     = useState("");
  const [price,      setPrice]      = useState("");
  const [creating,   setCreating]   = useState(false);
  const [tokenError, setTokenError] = useState("");

  const isValidAddress = (val: string) => /^0x[0-9a-fA-F]{40}$/.test(val);

  const handleSubmit = async () => {
    if (!isValidAddress(token)) {
      setTokenError("Ingresá una dirección válida (0x...)");
      return;
    }
    setTokenError("");
    if (!amount || !price) return;
    setCreating(true);
    const ok = await onCreate(token, amount, price);
    setCreating(false);
    if (ok) onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Crear publicación</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div>
            <label>Dirección del token DPF</label>
            <input
              type="text"
              placeholder="0x..."
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTokenError("");
              }}
              style={tokenError ? { borderColor: "#c62828" } : undefined}
            />
            {tokenError && (
              <span style={{ color: "#c62828", fontSize: "12px", marginTop: "4px", display: "block" }}>
                {tokenError}
              </span>
            )}
          </div>

          <div>
            <label>Cantidad de tokens a vender</label>
            <input
              type="number"
              placeholder="ej: 500"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label>Precio total en USDC</label>
            <input
              type="number"
              placeholder="ej: 250"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-execute bg-dep"
            disabled={creating || !token || !amount || !price}
            onClick={handleSubmit}
          >
            {creating ? "Procesando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}