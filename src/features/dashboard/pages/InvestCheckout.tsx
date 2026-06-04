// import { ethers } from "ethers";
// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import DashboardLayout from "../components/DashboardLayout";
// import { useUser } from "../hooks/useUser";
// import { ArrowLeft, ShieldCheck, ArrowUpDown } from "lucide-react";
// import "../components/Marketplace.css";
// import "./InvestCheckout.css";
// import { fetchProject } from "../services/api";
// import type { Project } from "../types";

// export default function InvestCheckout() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { user } = useUser();
  
//   const [ethAmount, setEthAmount] = useState<string>("");
//   const [tokenAmount, setTokenAmount] = useState<string>("");
//   const [project, setProject] = useState<Project | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const tokenPrice = 1.05;
//   const minInvestment = 0.01;
  
//   useEffect(() => {
//     if (!id) return;
//     fetchProject(id)
//       .then(setProject)
//       .catch(() => setProject(null))
//       .finally(() => setLoading(false));
//   }, [id]);

//   const handleEthChange = (val: string) => {
//     setEthAmount(val);
//     if (!val || isNaN(Number(val))) return setTokenAmount("");
    
//     const calculated = (Number(val) / tokenPrice).toFixed(4);
//     setTokenAmount(calculated);
//   };

//   const handleTokenChange = (val: string) => {
//     setTokenAmount(val);
//     if (!val || isNaN(Number(val))) return setEthAmount("");
    
//     const calculated = (Number(val) * tokenPrice).toFixed(2);
//     setEthAmount(calculated);
//   };

// //-- Funciona pero de Prubeba con ETH.
// // const handleInvest = async () => {
// //   try {
// //     setIsProcessing(true);

// //     if (!(window as any).ethereum) {
// //       alert("Instalá MetaMask");
// //       return;
// //     }

// //     //Conexion a la billetera
// //     const provider = new ethers.BrowserProvider((window as any).ethereum);
// //     const signer = await provider.getSigner();

// //     // Aca vamos a definir hacia donde vamos enviar el dinero. en este caso use la 2da cuenta de Anvil.
// //     const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// //     console.log("Modo Demo: Enviando ETH directo a la Tesorería...");

// //     // Hacemos una transferencia pura de ETH, forzando el límite de gas
// //     // Esto evita chocar con las reglas de USDC de los contratos.
// //     const tx = await signer.sendTransaction({
// //       to: TREASURY_ADDRESS,
// //       value: ethers.parseEther(ethAmount),
// //       gasLimit: 21000 // Forzamos el gas para que MetaMask no dude
// //     });
// //     await tx.wait();
// //     // --- Guardamos en el historial para que se vea en la web  esto es imporntate ya que depues lo voy a pasar en una BD---
// //     const nuevaInversion = {
// //       projectId: id,
// //       ethAmount: ethAmount, 
// //       tokenAmount: tokenAmount,
// //       txHash: tx.hash 
// //     };
// //     const historial = JSON.parse(localStorage.getItem("historial_real_inversiones") || "[]");
// //     historial.push(nuevaInversion);
// //     localStorage.setItem("historial_real_inversiones", JSON.stringify(historial));
// //     // -----------------------------------------------------------
// //     alert(`¡Inversión de ${ethAmount} ETH procesada con éxito!`);
// //     navigate("/dashboard/investments");

// //   } catch (error) {
// //     console.error("Error en inversión:", error);
// //     alert("La transacción fallo.");
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };


// const handleInvest = async () => {
//   try {
//     setIsProcessing(true);

//     if (!(window as any).ethereum) {
//       alert("Instalá MetaMask");
//       return;
//     }

//     // Conexión a la billetera
//     const provider = new ethers.BrowserProvider((window as any).ethereum);
//     const signer = await provider.getSigner();

//     // 1. Direcciones de los contratos (¡Verificá que coincidan con tu terminal de Anvil!)
//     const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//     const OFFERING_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; 

//     // 2. Conectar con el contrato USDC (Para pedir permiso)
//     const usdcAbi = ["function approve(address spender, uint256 amount) external returns (bool)"];
//     const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);

//     // 3. Conectar con el contrato Offering (Para invertir)
//     const offeringAbi = ["function invest(uint256 usdcAmount) external"];
//     const offeringContract = new ethers.Contract(OFFERING_ADDRESS, offeringAbi, signer);

//     // 4. Convertir el monto ingresado a los 6 decimales que usa USDC
//     // (Aunque tu variable de estado se llame 'ethAmount', ahora estamos manejando USDC)
//     const amountToInvest = ethers.parseUnits(ethAmount, 6);

//     console.log("Paso 1: Aprobando el uso de USDC...");
//     // Le damos permiso al contrato Offering para gastar nuestra cantidad de USDC
//     const txApprove = await usdcContract.approve(OFFERING_ADDRESS, amountToInvest);
//     await txApprove.wait(); // Esperamos a que la red confirme el permiso

//     console.log("Paso 2: Ejecutando la inversión en el Smart Contract...");
//     // Ahora sí, invertimos de verdad
//     const txInvest = await offeringContract.invest(amountToInvest);
//     await txInvest.wait(); // Esperamos a que la red confirme la inversión

//     // --- Guardamos en el historial simulando la BD ---
//     const nuevaInversion = {
//       projectId: id,
//       ethAmount: ethAmount, 
//       tokenAmount: tokenAmount,
//       txHash: txInvest.hash // Guardamos el hash de la inversión final
//     };
    
//     const historial = JSON.parse(localStorage.getItem("historial_real_inversiones") || "[]");
//     historial.push(nuevaInversion);
//     localStorage.setItem("historial_real_inversiones", JSON.stringify(historial));
//     // -----------------------------------------------------------

//     alert(`¡Inversión de ${ethAmount} USDC procesada con éxito en el Smart Contract!`);
//     navigate("/dashboard/investments");

//   } catch (error) {
//     console.error("Error en inversión:", error);
//     alert("La transacción falló. Revisá la consola para más detalles.");
//   } finally {
//     setIsProcessing(false);
//   }
// };


//   if (loading) {
//     return (
//       <DashboardLayout title="Confirmar Inversión" user={user}>
//         <p className="loading-msg">Cargando detalles del proyecto...</p>
//       </DashboardLayout>
//     );
//   }

//   if (!project) {
//     return (
//       <DashboardLayout title="Confirmar Inversión" user={user}>
//         <p className="loading-msg">Proyecto no encontrado.</p>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout title="Confirmar Inversión" user={user}>
//       <div className="p2p-container invest-checkout-wrapper animate-fade-in">
        
//         <button 
//           onClick={() => navigate(-1)}
//           className="btn-back"
//         >
//           <ArrowLeft size={18} /> Volver
//         </button>

//         <div className="p2p-trade-box invest-trade-box animate-fade-in">
          
//           <div className="trade-box-left">
//             <h3 className="checkout-project-title">{project.name}</h3>
//             <span className="badge-category">
//               {project.categories?.[0]?.name ?? "Sin categoría"}
//             </span>
            
//             <p className="terms-text project-desc">
//               {project.description}
//             </p>

//             <div className="project-rules">
//               <h4>Condiciones de Inversión</h4>
//               <ul>
//                 <li><ShieldCheck size={16} color="#10b981" /> Inversión mínima: {minInvestment} ETH</li>
//                 <li><ShieldCheck size={16} color="#10b981" /> Los fondos están protegidos por contrato inteligente</li>
//               </ul>
//             </div>
//           </div>

//           <div className="trade-box-right">
//             <div className="price-indicator">
//               Precio del Token: <strong>{tokenPrice} ETH</strong>
//             </div>

//             <div className="trade-inputs-group">
//               <div className="trade-input-wrapper">
//                 <label>Inviertes (ETH)</label>
//                 <div className="input-with-symbol">
//                   <input 
//                     type="number" 
//                     placeholder="0.00" 
//                     value={ethAmount}
//                     onChange={(e) => handleEthChange(e.target.value)}
//                   />
//                   <span className="symbol-label">ETH</span>
//                 </div>
//               </div>

//               <div className="trade-inputs-spacer">
//                 <ArrowUpDown size={16} className="text-muted" />
//               </div>

//               <div className="trade-input-wrapper">
//                 <label>Recibes (DPF)</label>
//                 <div className="input-with-symbol">
//                   <input 
//                     type="number" 
//                     placeholder="0.00" 
//                     value={tokenAmount}
//                     onChange={(e) => handleTokenChange(e.target.value)}
//                   />
//                   <span className="symbol-label">DPF</span>
//                 </div>
//               </div>
//             </div>

//             <div className="trade-actions invest-trade-actions">
//               <button className="btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
//               <button 
//                 className="btn-execute bg-dep"
//                 disabled={!ethAmount || parseFloat(ethAmount) < minInvestment || isProcessing}
//                 onClick={handleInvest}
//               >
//                 {isProcessing ? "Procesando en Blockchain..." : "Confirmar Inversión"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }


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

// Centralizá las direcciones acá — actualizalas tras cada re-deploy de Anvil
const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const OFFERING_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const OFFERING_ABI = [
  "function invest(uint256 usdcAmount) external",
  "function totalRaised() view returns (uint256)",
  "function HARD_CAP() view returns (uint256)",
  "function DEADLINE() view returns (uint256)",
  "function SOFT_CAP() view returns (uint256)",
];

export default function InvestCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  //  Estado de error visible en la UI en lugar de solo alerts
  const [txError, setTxError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const TOKEN_PRICE = 0.5;
  const MIN_INVESTMENT = 1;

  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUsdcChange = (val: string) => {
    setUsdcAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setTokenAmount("");
    setTokenAmount((Number(val) / TOKEN_PRICE).toFixed(4));
  };

  const handleTokenChange = (val: string) => {
    setTokenAmount(val);
    setTxError(null);
    if (!val || isNaN(Number(val))) return setUsdcAmount("");
    setUsdcAmount((Number(val) * TOKEN_PRICE).toFixed(2));
  };

  const handleInvest = async () => {
    setTxError(null);

    try {
      setIsProcessing(true);

      if (!(window as any).ethereum) {
        setTxError("Instalá MetaMask para continuar.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const offering = new ethers.Contract(OFFERING_ADDRESS, OFFERING_ABI, signer);

      const amountToInvest = ethers.parseUnits(usdcAmount, 6);

      // --- Validaciones del lado del cliente antes de gastar gas ---

      const balance: bigint = await usdc.balanceOf(walletAddress);
      if (balance < amountToInvest) {
        setTxError(`Saldo insuficiente. Tenés ${ethers.formatUnits(balance, 6)} USDC.`);
        return;
      }

      const deadline: bigint = await offering.DEADLINE();
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (now >= deadline) {
        setTxError("La oferta ya cerró.");
        return;
      }

      const totalRaised: bigint = await offering.totalRaised();
      const hardCap: bigint = await offering.HARD_CAP();
      if (totalRaised + amountToInvest > hardCap) {
        const disponible = ethers.formatUnits(hardCap - totalRaised, 6);
        setTxError(`Superás el Hard Cap. Máximo disponible: ${disponible} USDC.`);
        return;
      }

      // --- Paso 1: Approve ---
      //  Siempre aprobamos el monto exacto, no más
      console.log("Aprobando USDC...");
      const approveTx = await usdc.approve(OFFERING_ADDRESS, amountToInvest);
      await approveTx.wait();
      console.log("Approve confirmado.");

      // --- Paso 2: Invest ---
      console.log("Ejecutando invest...");
      //  ACÁ ESTÁ EL LÍMITE DE GAS FORZADO PARA QUE ANVIL NO FALLE 
      const investTx = await offering.invest(amountToInvest, { gasLimit: 500000 });
      const receipt = await investTx.wait();
      console.log("Inversión confirmada. Receipt:", receipt);

      // --- Guardar en historial local ---
      const nuevaInversion = {
        projectId: id,
        usdcAmount: Number(usdcAmount),
        tokenAmount: Number(tokenAmount),
        tokenPrice: TOKEN_PRICE,
        txHash: investTx.hash,
        createdAt: Date.now(),
      };
      const historial = JSON.parse(
        localStorage.getItem("historial_real_inversiones") || "[]"
      );
      historial.push(nuevaInversion);
      localStorage.setItem(
        "historial_real_inversiones",
        JSON.stringify(historial)
      );

      setSuccessMessage(`¡Inversión de ${usdcAmount} USDC procesada con éxito! Se han cargado ${tokenAmount} DPF en tu billetera.`);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("Error en inversión:", error);

      //  Parsing más robusto del error de ethers v6
      const msg =
        error?.info?.error?.message ||   // error RPC de MetaMask
        error?.shortMessage ||           
        error?.reason ||                 
        error?.message ||
        "Error desconocido.";

      // Traducimos los custom errors del contrato a mensajes legibles
      if (msg.includes("Offering__Closed"))
        setTxError("La oferta está cerrada.");
      else if (msg.includes("Offering__HardCapReached"))
        setTxError("Se alcanzó el Hard Cap.");
      else if (msg.includes("Offering__SoftCapReached"))
        setTxError("El Soft Cap ya fue alcanzado.");
      else
        setTxError(msg);

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

        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="p2p-trade-box invest-trade-box animate-fade-in">

          <div className="trade-box-left">
            <h3 className="checkout-project-title">{project.name}</h3>
            <span className="badge-category">
              {project.categories?.[0]?.name ?? "Sin categoría"}
            </span>
            <p className="terms-text project-desc">{project.description}</p>
            <div className="project-rules">
              <h4>Condiciones de Inversión</h4>
              <ul>
                <li>
                  <ShieldCheck size={16} color="#10b981" /> Inversión mínima:{" "}
                  {MIN_INVESTMENT} USDC
                </li>
                <li>
                  <ShieldCheck size={16} color="#10b981" /> Fondos protegidos
                  por contrato inteligente
                </li>
              </ul>
            </div>
          </div>

          <div className="trade-box-right">
            <div className="price-indicator">
              Precio del Token: <strong>{TOKEN_PRICE} USDC</strong>
            </div>

            <div className="trade-inputs-group">
              <div className="trade-input-wrapper">
                <label>Inviertes (USDC)</label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={usdcAmount}
                    onChange={(e) => handleUsdcChange(e.target.value)}
                  />
                  <span className="symbol-label">USDC</span>
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

            {txError && (
              <div className="tx-error-msg">
                {txError}
              </div>
            )}

            <div className="tx-summary-box">
              <p>Inversión: <strong>{usdcAmount || 0} USDC</strong></p>
              <p>Recibirás: <strong>{tokenAmount || 0} DPF</strong></p>
              <p>Precio actual: <strong>1 DPF = {TOKEN_PRICE} USDC</strong></p>
            </div>

            <div className="trade-actions invest-trade-actions">
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button
                className="btn-execute bg-dep"
                disabled={
                  !usdcAmount ||
                  parseFloat(usdcAmount) < MIN_INVESTMENT ||
                  isProcessing
                }
                onClick={handleInvest}
              >
                {isProcessing
                  ? "Procesando en Blockchain..."
                  : "Confirmar Inversión"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <ShieldCheck size={48} color="#10b981" className="success-modal-icon" />
            <h3 className="success-modal-title">¡Inversión Exitosa!</h3>
            <p className="success-modal-text">{successMessage}</p>
            <button 
              className="btn-execute bg-dep"
              onClick={() => navigate("/dashboard/investments")}
            >
              Ver Mis Inversiones
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}