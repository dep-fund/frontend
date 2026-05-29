import { useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import InvestmentCard from "../components/InvestmentCard";
import { useExploreProjects } from "../hooks/useExploreProjects";

export default function MyInvestments() {
  const { user } = useUser();
  const { projects, loading } = useExploreProjects();
  
  const myInvestmentsData = useMemo(() => {
    const saved = localStorage.getItem("my_investments");
    return saved ? JSON.parse(saved) : [];
  }, []);

  const investments = useMemo(() => {
    return projects
      .filter((p) => myInvestmentsData.some((inv: any) => inv.projectId === p.id))
      .map((p) => {
        const invData = myInvestmentsData.find((inv: any) => inv.projectId === p.id);
        return {
          id: invData.id || p.id,
          projectName: p.name,
          tokens: invData.tokens || 0,
          amount: invData.amount || 0,
          roi: invData.roi || "+0.0%",
          projectId: p.id
        };
      });
  }, [projects, myInvestmentsData]);

  return (
    <DashboardLayout title="Mis Inversiones" user={user}>
      <div className="myprojects-header">
        <span className="myprojects-count">{investments.length} inversión{investments.length !== 1 ? "es" : ""} activas</span>
      </div>

      {loading && <div className="myprojects-loading">Cargando tus inversiones...</div>}

      {!loading && investments.length === 0 && (
        <div className="myprojects-empty">
          <p>Aún no realizaste ninguna inversión.</p>
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