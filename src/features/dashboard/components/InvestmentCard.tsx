import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ProjectCard.css"; 

export default function InvestmentCard({ investment }: { investment: any }) {
  const navigate = useNavigate();
  

  const tokens = investment.tokens || 0;
  const progress = investment.progress || "0%";
  const investedAmount = investment.amount || 0;
  
  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-card-cover project-card-cover--placeholder" style={{ backgroundColor: '#1e293b' }} />
        <span className="project-badge badge--active">Inversión Activa</span>
      </div>
      
      <div className="project-card-body">
        <h3 className="project-card-name">{investment.projectName || "Proyecto Deportivo"}</h3>
        <p className="project-card-category" style={{ color: '#2C7176', fontWeight: 600 }}>
          Participación: {tokens} DPF
        </p>
        
        <div className="project-card-stats" style={{ marginTop: '16px' }}>
          <div>
            <span className="stat-label">Invertido (USDC)</span>
            <span className="stat-value">{investedAmount}</span>
          </div>
          <div>
            <span className="stat-label">Progreso</span>
            <span className="stat-value" style={{ color: '#EC8F41' }}>{progress}</span>
          </div>
        </div>

        <div className="project-card-actions" style={{ marginTop: '16px' }}>
          <button className="btn-detail" onClick={() => navigate(`/dashboard/projects/${investment.projectId}`)}>
            <TrendingUp size={15} /> Ver Rendimiento
          </button>
        </div>
      </div>
    </div>
  );
}