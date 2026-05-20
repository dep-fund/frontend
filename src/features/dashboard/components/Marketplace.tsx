import { useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import "./Marketplace.css";
import DashboardLayout from "../components/DashboardLayout";

import { useUser } from "../hooks/useUser";

interface Ad {
  id: number;
  username: string;
  ordenes: number;
  completado: string;
  precio: number;
  disponible: number;
  limiteMin: number;
  limiteMax: number;
}

const initialAds: Ad[] = [
  {
    id: 1,
    username: "Coin Reserve",
    ordenes: 2232,
    completado: "100.00%",
    precio: 1.02,
    disponible: 19992.01,
    limiteMin: 10,
    limiteMax: 5000
  },
  {
    id: 2,
    username: "HarveyySpecter",
    ordenes: 459,
    completado: "98.50%",
    precio: 1.05,
    disponible: 339.52,
    limiteMin: 50,
    limiteMax: 300
  },
  {
    id: 3,
    username: "Swap2pExpress",
    ordenes: 511,
    completado: "98.70%",
    precio: 1.03,
    disponible: 747.35,
    limiteMin: 20,
    limiteMax: 1000
  }
];

export default function Marketplace() {
    const { user } = useUser();
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [usdtAmount, setUsdtAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");


  const handleOpenTrade = (id: number) => {
    if (selectedAdId === id) {
      setSelectedAdId(null); 
    } else {
      setSelectedAdId(id);
      setUsdtAmount("");
      setTokenAmount("");
    }
  };

  // Lógica de cálculo automático (Teniendo en cuenta el precio)
  const handleUsdtChange = (val: string, precio: number) => {
    setUsdtAmount(val);
    if (!val || isNaN(Number(val))) {
      setTokenAmount("");
      return;
    }
    const calculated = (Number(val) / precio).toFixed(4);
    setTokenAmount(calculated);
  };

  const handleTokenChange = (val: string, precio: number) => {
    setTokenAmount(val);
    if (!val || isNaN(Number(val))) {
      setUsdtAmount("");
      return;
    }
    const calculated = (Number(val) * precio).toFixed(2);
    setUsdtAmount(calculated);
  };

  return (
    <DashboardLayout title="Marketplace" user={user}>
        <div className="p2p-container animate-fade-in">
        {/* Encabezado con selector BUY/SELL */}
        <div className="p2p-header-tabs">
            <button 
            className={`tab-btn tab-btn-buy ${tradeType === "BUY" ? "tab-btn--active-buy" : ""}`}
            onClick={() => { setTradeType("BUY"); setSelectedAdId(null); }}
            >
            Comprar
            </button>
            <button 
            className={`tab-btn tab-btn-sell ${tradeType === "SELL" ? "tab-btn--active-sell" : ""}`}
            onClick={() => { setTradeType("SELL"); setSelectedAdId(null); }}
            >
            Vender
            </button>
        </div>

        {/* Tabla de Anunciantes */}
        <div className="p2p-table-wrapper">
            <div className="p2p-table-header">
            <div className="col-advertiser">Anunciante</div>
            <div className="col-price">Precio (USDT)</div>
            <div className="col-limit">Disponible / Límites</div>
            <div className="col-trade">Operar</div>
            </div>

            {initialAds.map((ad) => {
            const isOpen = selectedAdId === ad.id;
            return (
                <div key={ad.id} className="p2p-row-group">
                {/* Fila Principal */}
                <div className="p2p-row">
                    <div className="col-advertiser">
                    <div className="adv-badge">{ad.username[0]}</div>
                    <div>
                        <span className="adv-name">{ad.username}</span>
                        <p className="adv-stats">{ad.ordenes} órdenes | {ad.completado}</p>
                    </div>
                    </div>

                    <div className="col-price font-bold">
                    {ad.precio.toFixed(2)} USDT
                    </div>

                    <div className="col-limit">
                    <p><span>Disponible:</span> {ad.disponible} DPF</p>
                    <p><span>Límites:</span> {ad.limiteMin} - {ad.limiteMax} USDT</p>
                    </div>

                    <div className="col-trade">
                    <button 
                        className={`trade-action-btn ${tradeType === "BUY" ? "btn-buy" : "btn-sell"}`}
                        onClick={() => handleOpenTrade(ad.id)}
                    >
                        {tradeType === "BUY" ? "Comprar DPF" : "Vender DPF"}
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    </div>
                </div>

                {/*  Operación Expandible */}
                {isOpen && (
                    <div className="p2p-trade-box animate-fade-in">
                    <div className="trade-box-left">
                        <h4>Términos del anunciante</h4>
                        <p className="terms-text">
                        Asegúrate de contar con saldo suficiente para cubrir los fees de la red (Gas).
                        La liberación de los tokens se ejecutará automáticamente vía Smart Contract.
                        Una vez confirmada la transacción en la blockchain, recibirás los DPF en tu wallet conectada.
                        </p>
                    </div>

                    <div className="trade-box-right">
                        <div className="price-indicator">
                        Precio de referencia: <strong>{ad.precio} USDT</strong>
                        </div>

                        <div className="trade-inputs-group">
                        <div className="trade-input-wrapper">
                            <label>{tradeType === "BUY" ? "Pagas (USDT)" : "Vendes (DPF)"}</label>
                            <div className="input-with-symbol">
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={tradeType === "BUY" ? usdtAmount : tokenAmount}
                                onChange={(e) => tradeType === "BUY" 
                                ? handleUsdtChange(e.target.value, ad.precio)
                                : handleTokenChange(e.target.value, ad.precio)
                                }
                            />
                            <span className="symbol-label">{tradeType === "BUY" ? "USDT" : "DPF"}</span>
                            </div>
                        </div>

                        <div className="trade-inputs-spacer">
                            <ArrowUpDown size={16} className="text-muted" />
                        </div>

                        <div className="trade-input-wrapper">
                            <label>{tradeType === "BUY" ? "Recibes (DPF)" : "Recibes (USDT)"}</label>
                            <div className="input-with-symbol">
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={tradeType === "BUY" ? tokenAmount : usdtAmount}
                                onChange={(e) => tradeType === "BUY"
                                ? handleTokenChange(e.target.value, ad.precio)
                                : handleUsdtChange(e.target.value, ad.precio)
                                }
                            />
                            <span className="symbol-label">{tradeType === "BUY" ? "DPF" : "USDT"}</span>
                            </div>
                        </div>
                        </div>

                        <div className="trade-actions">
                        <button className="btn-secondary" onClick={() => setSelectedAdId(null)}>Cancelar</button>
                        <button className={`btn-execute ${tradeType === "BUY" ? "bg-dep" : "bg-fund"}`}>
                            {tradeType === "BUY" ? "Confirmar Compra" : "Confirmar Venta"}
                        </button>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            );
            })}
        </div>
        </div>

    </DashboardLayout>
  );
}