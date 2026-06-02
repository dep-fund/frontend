import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { ArrowLeft, ShieldCheck, ArrowUpDown } from "lucide-react";
import "../components/Marketplace.css";
import "./InvestCheckout.css";
import { fetchProject } from "../services/api";
import type { Project } from "../types";

export default function InvestCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [ethAmount, setEthAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const tokenPrice = 1.05;
  const minInvestment = 0.01;
  
  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEthChange = (val: string) => {
    setEthAmount(val);
    if (!val || isNaN(Number(val))) return setTokenAmount("");
    
    const calculated = (Number(val) / tokenPrice).toFixed(4);
    setTokenAmount(calculated);
  };

  const handleTokenChange = (val: string) => {
    setTokenAmount(val);
    if (!val || isNaN(Number(val))) return setEthAmount("");
    
    const calculated = (Number(val) * tokenPrice).toFixed(2);
    setEthAmount(calculated);
  };


// const handleInvest = async () => {
//   try {
//     setIsProcessing(true);

//     if (!(window as any).ethereum) {
//       alert("Instalá MetaMask");
//       return;
//     }

//     const provider = new ethers.BrowserProvider((window as any).ethereum);
//     const signer = await provider.getSigner();

//     // const OFFERING_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//     const OFFERING_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
//     const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//     const offering = new ethers.Contract(
//       OFFERING_ADDRESS,
//       [
//         "function invest(uint256 usdcAmount) external"
//       ],
//       signer
//     );

//     const usdc = new ethers.Contract(
//       USDC_ADDRESS,
//       [
//         "function approve(address spender, uint256 amount) external returns (bool)"
//       ],
//       signer
//     );

//     const amount = ethers.parseUnits(ethAmount, 6); // USDC tiene 6 decimales

//     // 1. approve
//     const tx1 = await usdc.approve(OFFERING_ADDRESS, amount);
//     await tx1.wait();

//     // 2. invest real
//     const tx2 = await offering.invest(amount);
//     await tx2.wait();

//     alert(`Inversión exitosa: ${ethAmount} USDC`);

//     navigate("/dashboard/investments");

//   } catch (error) {
//     console.error(error);
//     alert("Error en inversión");
//   } finally {
//     setIsProcessing(false);
//   }
// };

const handleInvest = async () => {
  try {
    setIsProcessing(true);

    if (!(window as any).ethereum) {
      alert("Instalá MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    // Usamos la Cuenta 2 de Anvil directamente como Tesorería para la Demo
    const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    console.log("Modo Demo: Enviando ETH directo a la Tesorería...");

    // Hacemos una transferencia pura de ETH, forzando el límite de gas
    // Esto evita chocar con las reglas de USDC de los contratos.
    const tx = await signer.sendTransaction({
      to: TREASURY_ADDRESS,
      value: ethers.parseEther(ethAmount),
      gasLimit: 21000 // Forzamos el gas para que MetaMask no dude
    });

    await tx.wait();

    // --- Guardamos en el historial para que se vea en la web ---
    const nuevaInversion = {
      
      projectId: id,
      ethAmount: ethAmount, 
      tokenAmount: tokenAmount,
      txHash: tx.hash 
    };
    const historial = JSON.parse(localStorage.getItem("historial_real_inversiones") || "[]");
    historial.push(nuevaInversion);
    localStorage.setItem("historial_real_inversiones", JSON.stringify(historial));
    // -----------------------------------------------------------

    alert(`¡Inversión de ${ethAmount} ETH procesada con éxito!`);
    navigate("/dashboard/investments");

  } catch (error) {
    console.error("Error en inversión:", error);
    alert("La transacción falló. Asegurate de que MetaMask esté conectado a Localhost 8545.");
  } finally {
    setIsProcessing(false);
  }
};


  if (loading) {
    return (
      <DashboardLayout title="Confirmar Inversión" user={user}>
        <p className="loading-msg">Cargando detalles del proyecto...</p>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Confirmar Inversión" user={user}>
        <p className="loading-msg">Proyecto no encontrado.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Confirmar Inversión" user={user}>
      <div className="p2p-container invest-checkout-wrapper animate-fade-in">
        
        <button 
          onClick={() => navigate(-1)}
          className="btn-back"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="p2p-trade-box invest-trade-box animate-fade-in">
          
          <div className="trade-box-left">
            <h3 className="checkout-project-title">{project.name}</h3>
            <span className="badge-category">
              {project.categories?.[0]?.name ?? "Sin categoría"}
            </span>
            
            <p className="terms-text project-desc">
              {project.description}
            </p>

            <div className="project-rules">
              <h4>Condiciones de Inversión</h4>
              <ul>
                <li><ShieldCheck size={16} color="#10b981" /> Inversión mínima: {minInvestment} ETH</li>
                <li><ShieldCheck size={16} color="#10b981" /> Los fondos están protegidos por contrato inteligente</li>
              </ul>
            </div>
          </div>

          <div className="trade-box-right">
            <div className="price-indicator">
              Precio del Token: <strong>{tokenPrice} ETH</strong>
            </div>

            <div className="trade-inputs-group">
              <div className="trade-input-wrapper">
                <label>Inviertes (ETH)</label>
                <div className="input-with-symbol">
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={ethAmount}
                    onChange={(e) => handleEthChange(e.target.value)}
                  />
                  <span className="symbol-label">ETH</span>
                </div>
              </div>

              <div className="trade-inputs-spacer">
                <ArrowUpDown size={16} className="text-muted" />
              </div>

              <div className="trade-input-wrapper">
                <label>Recibes (DPF)</label>
                <div className="input-with-symbol">
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={tokenAmount}
                    onChange={(e) => handleTokenChange(e.target.value)}
                  />
                  <span className="symbol-label">DPF</span>
                </div>
              </div>
            </div>

            <div className="trade-actions invest-trade-actions">
              <button className="btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button 
                className="btn-execute bg-dep"
                disabled={!ethAmount || parseFloat(ethAmount) < minInvestment || isProcessing}
                onClick={handleInvest}
              >
                {isProcessing ? "Procesando en Blockchain..." : "Confirmar Inversión"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}