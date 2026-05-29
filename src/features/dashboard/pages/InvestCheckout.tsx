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

  const tokenPrice = 1.05;
  const minInvestment = 50;
  
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

  const handleInvest = () => {
    const saved = JSON.parse(localStorage.getItem("my_investments") || "[]");
    saved.push({
      projectId: id,
      tokens: parseFloat(tokenAmount),
      amount: parseFloat(ethAmount),
      roi: "+12.5%" 
    });
    localStorage.setItem("my_investments", JSON.stringify(saved));

    alert(`¡Inversión de ${ethAmount} ETH procesada con éxito!`);
    navigate("/dashboard/investments");
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
                disabled={!ethAmount || parseFloat(ethAmount) < minInvestment}
                onClick={handleInvest}
              >
                Confirmar Inversión
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}