import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useExploreProjects } from "../hooks/useExploreProjects";
import ProjectCard from "../components/ProjectCard";
import "./ExploreProjects.css"; 

export default function InvestProjects() {
  const { user } = useUser();
  const { projects, loading } = useExploreProjects();
  const navigate = useNavigate();
  
  const activeProjects = useMemo(() => {
    if (!user) return []; 
    
    return projects.filter((p) => {
      const isValidState = ["PENDING", "APPROVED", "ACTIVE", "ACTIVO"].includes(p.state);
      return isValidState;
    });
  }, [projects, user]);

  return (
    <DashboardLayout title="Invertir en Proyectos" user={user}>
      <div className="explore-main" style={{ width: '100%', margin: '0' }}>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Descubrí proyectos deportivos en búsqueda de financiamiento y forma parte de su crecimiento.
        </p>    
        
        <div className="explore-grid">
          {loading ? (
            <p className="explore-loading">Cargando oportunidades...</p>
          ) : (
            <>
              {activeProjects.map((p) => (
                <div key={p.id} className="invest-card-container">
                  <ProjectCard 
                    project={p} 
                    showActions={false} 
                  />
                  
                  <button 
                    className="btn-invest-slide" 
                    onClick={() => navigate(`/dashboard/invest/${p.id}`)}
                  >
                    Invertir en Proyecto
                  </button>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <p className="explore-empty">No hay proyectos disponibles para invertir en este momento.</p>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}