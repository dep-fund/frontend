// import { useMemo } from "react";
// import DashboardLayout from "../components/DashboardLayout";
// import { useUser } from "../hooks/useUser";
// import InvestmentCard from "../components/InvestmentCard";
// import { useExploreProjects } from "../hooks/useExploreProjects";

// export default function MyInvestments() {
//   const { user } = useUser();
//   const { projects, loading } = useExploreProjects();
  
//   const myInvestmentsData = useMemo(() => {
//     const saved = localStorage.getItem("my_investments");
//     return saved ? JSON.parse(saved) : [];
//   }, []);

//   const investments = useMemo(() => {
//     return projects
//       .filter((p) => myInvestmentsData.some((inv: any) => inv.projectId === p.id))
//       .map((p) => {
//         const invData = myInvestmentsData.find((inv: any) => inv.projectId === p.id);
//         return {
//           id: invData.id || p.id,
//           projectName: p.name,
//           tokens: invData.tokens || 0,
//           amount: invData.amount || 0,
//           roi: invData.roi || "+0.0%",
//           projectId: p.id
//         };
//       });
//   }, [projects, myInvestmentsData]);

//   return (
//     <DashboardLayout title="Mis Inversiones" user={user}>
//       <div className="myprojects-header">
//         <span className="myprojects-count">{investments.length} inversión{investments.length !== 1 ? "es" : ""} activas</span>
//       </div>

//       {loading && <div className="myprojects-loading">Cargando tus inversiones...</div>}

//       {!loading && investments.length === 0 && (
//         <div className="myprojects-empty">
//           <p>Aún no realizaste ninguna inversión.</p>
//           <a href="/dashboard/invest" style={{ 
//             display: "inline-block", 
//             marginTop: "1rem", 
//             padding: "10px 16px", 
//             background: "#EC8F41", 
//             color: "white", 
//             borderRadius: "8px", 
//             textDecoration: "none",
//             fontWeight: "bold" 
//           }}>
//             Explorar Proyectos
//           </a>
//         </div>
//       )}

//       <div className="myprojects-grid">
//         {investments.map(inv => (
//           <InvestmentCard key={inv.id} investment={inv} />
//         ))}
//       </div>
//     </DashboardLayout>
//   );
// }


import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import InvestmentCard from "../components/InvestmentCard";
import { useExploreProjects } from "../hooks/useExploreProjects";

export default function MyInvestments() {
  const { user } = useUser();
  const { projects, loading: projectsLoading } = useExploreProjects();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Buscamos el registro REAL de transacciones exitosas.
    // (Si tu backend ya estuviera conectado, aquí haríamos un fetch a tu API)
    const savedHistory = localStorage.getItem("historial_real_inversiones");
    
    if (savedHistory && projects.length > 0) {
      const transaccionesReales = JSON.parse(savedHistory);

      // 2. Cruzamos los datos de la transacción de la blockchain con la info visual del proyecto
      const inversionesMapeadas = transaccionesReales.map((txInfo: any) => {
        const proyecto = projects.find(p => String(p.id) === String(txInfo.projectId));
        
        return {
          id: txInfo.txHash, // Usamos el Hash real de la Blockchain como ID único
          projectName: proyecto?.name || "Proyecto en Blockchain",
          tokens: txInfo.tokenAmount, // Tokens DPF exactos calculados en la compra
          amount: txInfo.ethAmount,   // ETH exacto que pagaste en MetaMask
          roi: "+0.0%", // Esto queda estático hasta que programen la lógica de retornos
          projectId: txInfo.projectId
        };
      });

      setInvestments(inversionesMapeadas);
    }
    
    // Apagamos el estado de carga solo cuando los proyectos terminan de descargar
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