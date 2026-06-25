import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import InvestmentCard from "../components/InvestmentCard";
import { useExploreProjects } from "../hooks/useExploreProjects";

const getProgress = (id: string) => {
  const seed = id.charCodeAt(0) + id.charCodeAt(1);
  return Math.min(100, (seed % 60) + 40);
};

export default function MyInvestments() {
  const { user } = useUser();
  const { projects, loading: projectsLoading } = useExploreProjects();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Buscamos el registro REAL de transacciones exitosas.
    const savedHistory = localStorage.getItem("historial_real_inversiones");
    if (savedHistory && projects.length > 0) {
      const transaccionesReales = JSON.parse(savedHistory);

      // 2. Agrupamos las transacciones por ID de proyecto para sumar las inversiones
      const inversionesAgrupadas = transaccionesReales.reduce((acc: any, txInfo: any) => {
        const pid = txInfo.projectId;
        if (!acc[pid]) {
          acc[pid] = { projectId: pid, usdcAmount: 0, tokenAmount: 0 };
        }
        
        // Sumamos los USDC de todas las inversiones viejas y nuevas
        // (Soporte por si quedó alguna vieja guardada como ethAmount)
        const cantidadInvertida = parseFloat(txInfo.usdcAmount || txInfo.ethAmount || "0");
        
        acc[pid].usdcAmount += cantidadInvertida;
        acc[pid].tokenAmount += parseFloat(txInfo.tokenAmount || "0");
        return acc;
      }, {});

      // 3. Cruzamos los datos agrupados con la info visual del proyecto
      const inversionesMapeadas = Object.values(inversionesAgrupadas).map((grupo: any) => {
        const proyecto = projects.find(p => String(p.id) === String(grupo.projectId));

        return {
          id: grupo.projectId,
          projectName: proyecto?.name || "Proyecto en Blockchain",
          amount: Number(grupo.usdcAmount.toFixed(2)),
          tokens: Number(grupo.tokenAmount.toFixed(4)),
          progress: `${getProgress(grupo.projectId)}%`,
          projectId: grupo.projectId,
          dividendAddress: proyecto?.dividend_address ?? null,
        };
      });

      setInvestments(inversionesMapeadas);
    }
    
    if (!projectsLoading) {
      setLoading(false);
    }
  }, [projects, projectsLoading]);

  return (
    <DashboardLayout title="Mis Inversiones" user={user}>
      <div className="myprojects-header">
        <span className="myprojects-count">
          {investments.length} inversión{investments.length !== 1 ? "es" : ""} activas
        </span>
      </div>

      {loading && <div className="myprojects-loading">Sincronizando con la Blockchain...</div>}

      {!loading && investments.length === 0 && (
        <div className="myprojects-empty">
          <p>Aún no realizaste ninguna inversión en esta red.</p>
          <a href="/dashboard/invest" style={{ 
            display: "inline-block", 
            marginTop: "1rem", 
            padding: "10px 16px", 
            background: "#EC8F41", 
            color: "white", 
            borderRadius: "8px", 
            textDecoration: "none",
            fontWeight: "bold" 
          }}>
            Explorar Proyectos
          </a>
        </div>
      )}

      <div className="myprojects-grid">
        {investments.map(inv => (
          <InvestmentCard key={inv.id} investment={inv} />
        ))}
      </div>
    </DashboardLayout>
  );
}