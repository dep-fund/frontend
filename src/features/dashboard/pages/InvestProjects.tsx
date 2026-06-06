import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useExploreProjects } from "../hooks/useExploreProjects";
import { useCategories } from "../hooks/useCategories";
import ProjectCard from "../components/ProjectCard";
import { Library, Calendar, DollarSign, Filter } from "lucide-react";
import "./ExploreProjects.css"; 
import "./InvestProjects.css";

export default function InvestProjects() {
  const { user } = useUser();
  const { projects, loading } = useExploreProjects();
  const { categories } = useCategories();
  const navigate = useNavigate();

  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxValue, setMaxValue] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filtrado de proyectos activos
  const filteredProjects = useMemo(() => {
    if (!user) return []; 
    
    return projects.filter((p) => {
      // Validar estado activo
      const isValidState = ["PENDING", "APPROVED", "ACTIVE", "ACTIVO"].includes(p.state);
      if (!isValidState) return false;

      // Filtrar por categorias
      if (selectedCategory) {
        const matchesCategory = p.categories?.some((c) => c.id === selectedCategory);
        if (!matchesCategory) return false;
      }

      // Aca filtramos por un valor ingresado que sea =<
      if (maxValue && !isNaN(parseFloat(maxValue))) {
        if (parseFloat(p.total_amount) > parseFloat(maxValue)) return false;
      }

      // Filtrar por rango de fechas (usando created_at del proyecto)
      if (p.created_at) {
        const pDate = p.created_at.split("T")[0];
        if (startDate && pDate < startDate) return false;
        if (endDate && pDate > endDate) return false;
      } else if (startDate || endDate) {
        return false;
      }
      return true;
    });
  }, [projects, user, selectedCategory, maxValue, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setMaxValue("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <DashboardLayout title="Invertir en Proyectos" user={user}>
      <div className="explore-layout">
        
        {/* Panel lateral de filtros */}
        <aside className="explore-filters">
          <div className="invest-filters-header">
            <h3 className="explore-filters-title invest-filters-title">Filtros</h3>
            <button 
              onClick={handleResetFilters}
              className="invest-filters-reset"
            >
              Limpiar
            </button>
          </div>

          {/* Categorías */}
          <div className="explore-filter-group">
            <label>Categoría</label>
            <div className="explore-cats">
              <button
                className={`explore-cat ${!selectedCategory ? "explore-cat--active" : ""}`}
                onClick={() => setSelectedCategory(null)}
              >
                Todas las categorías
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`explore-cat ${selectedCategory === cat.id ? "explore-cat--active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Más filtros condicionados a partir de las categorías */}
          <div className="invest-filters-more">
            <h4 className="invest-filters-subtitle">
              <Filter size={14} color="#EC8F41" /> Más filtros
            </h4>

            {/* Filtrar por menos valor (Monto Máximo) */}
            <div className="explore-filter-group">
              <label htmlFor="max-value-filter" className="invest-filter-label">
                <DollarSign size={12} /> Valor máximo
              </label>
              <div className="explore-search">
                <input
                  id="max-value-filter"
                  type="number"
                  placeholder="Ej: 500000"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="invest-input-number"
                />
              </div>
            </div>

            {/* Filtrar por rango de fechas */}
            <div className="explore-filter-group">
              <label className="invest-filter-label">
                <Calendar size={12} /> Rango de fechas
              </label>
              <div className="invest-date-container">
                <div>
                  <span className="invest-date-span">Desde:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="invest-date-input"
                  />
                </div>
                <div>
                  <span className="invest-date-span">Hasta:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="invest-date-input"
                  />
                </div>
              </div>
            </div>
          </div>

        </aside>

        {/* Listado principal de proyectos */}
        <div className="explore-main">
          <p className="explore-count">
            <Library size={16} className="invest-count-icon" />
            {loading ? "Cargando oportunidades..." : `${filteredProjects.length} oportunidad${filteredProjects.length !== 1 ? "es" : ""} encontrada${filteredProjects.length !== 1 ? "s" : ""}`}
          </p>

          <div className="explore-grid">
            {loading ? (
              <p className="explore-loading">Cargando oportunidades...</p>
            ) : (
              <>
                {filteredProjects.map((p) => (
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
                {filteredProjects.length === 0 && (
                  <p className="explore-empty">No se encontraron proyectos activos con los filtros actuales.</p>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
