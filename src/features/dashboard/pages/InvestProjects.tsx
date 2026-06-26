import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import { useExploreProjects } from "../hooks/useExploreProjects";
import { useCategories } from "../hooks/useCategories";
import ProjectCard from "../components/ProjectCard";
import { Library, Calendar, DollarSign, Filter, HelpCircle, X, TrendingUp, AlertCircle, Coins, BookOpen } from "lucide-react";
import "./ExploreProjects.css";
import "./InvestProjects.css";

const BANNER_KEY = "depfund_invest_banner_dismissed";

export default function InvestProjects() {
  const { user } = useUser();
  const { projects, loading } = useExploreProjects();
  const { categories } = useCategories();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxValue, setMaxValue] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_KEY);
    if (!dismissed) setBannerVisible(true);
  }, []);

  const handleDismissBanner = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setBannerVisible(false);
  };

  const filteredProjects = useMemo(() => {
    if (!user) return [];

    return projects.filter((p) => {
      const isValidState = ["PENDING", "APPROVED", "ACTIVE", "ACTIVO"].includes(p.state);
      if (!isValidState) return false;

      if (selectedCategory) {
        const matchesCategory = p.categories?.some((c) => c.id === selectedCategory);
        if (!matchesCategory) return false;
      }

      if (maxValue && !isNaN(parseFloat(maxValue))) {
        if (parseFloat(p.total_amount) > parseFloat(maxValue)) return false;
      }

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

          {/* Pill de guía permanente en el filtro */}
          <button
            className="invest-guide-pill"
            onClick={() => setHelpOpen(true)}
          >
            <BookOpen size={13} />
            Guía del inversor
          </button>

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

          {/* Más filtros */}
          <div className="invest-filters-more">
            <h4 className="invest-filters-subtitle">
              <Filter size={14} color="#EC8F41" /> Más filtros
            </h4>

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

        {/* Listado principal */}
        <div className="explore-main">

          {/* Banner descartable — solo aparece la primera vez */}
          {bannerVisible && (
            <div className="invest-onboarding-banner">
              <div className="invest-onboarding-banner-left">
                <span className="invest-onboarding-banner-icon">
                  <HelpCircle size={18} />
                </span>
                <div>
                  <p className="invest-onboarding-banner-title">¿Primera vez invirtiendo en DepFund?</p>
                  <p className="invest-onboarding-banner-text">
                    Entendé cómo funcionan los tokens $DPF, los dividendos y los perfiles de riesgo antes de elegir un proyecto.
                  </p>
                </div>
              </div>
              <div className="invest-onboarding-banner-actions">
                <button
                  className="invest-onboarding-banner-cta"
                  onClick={() => { setHelpOpen(true); handleDismissBanner(); }}
                >
                  Ver guía
                </button>
                <button
                  className="invest-onboarding-banner-dismiss"
                  onClick={handleDismissBanner}
                  aria-label="Cerrar banner"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          <p className="explore-count">
            <Library size={16} className="invest-count-icon" />
            {loading
              ? "Cargando oportunidades..."
              : `${filteredProjects.length} oportunidad${filteredProjects.length !== 1 ? "es" : ""} encontrada${filteredProjects.length !== 1 ? "s" : ""}`}
          </p>

          <div className="explore-grid">
            {loading ? (
              <p className="explore-loading">Cargando oportunidades...</p>
            ) : (
              <>
                {filteredProjects.map((p) => (
                  <div key={p.id} className="invest-card-container">
                    <ProjectCard project={p} showActions={false} />
                    <button
                      className="btn-invest-slide"
                      onClick={() => navigate(`/dashboard/invest/${p.id}`)}
                    >
                      Invertir en Proyecto
                    </button>
                  </div>
                ))}
                {filteredProjects.length === 0 && (
                  <p className="explore-empty">
                    No se encontraron proyectos activos con los filtros actuales.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Overlay de ayuda */}
      {helpOpen && (
        <div className="invest-help-overlay" onClick={() => setHelpOpen(false)}>
          <div
            className="invest-help-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Guía para inversores"
          >
            <div className="invest-help-panel-header">
              <span className="invest-help-panel-title">¿Cómo funciona invertir?</span>
              <button
                className="invest-help-close"
                onClick={() => setHelpOpen(false)}
                aria-label="Cerrar ayuda"
              >
                <X size={18} />
              </button>
            </div>

            <div className="invest-help-body">

              <div className="invest-help-section">
                <div className="invest-help-section-icon">
                  <Coins size={16} />
                </div>
                <div>
                  <p className="invest-help-section-title">¿Qué recibo al invertir?</p>
                  <p className="invest-help-section-text">
                    Al invertir en USDC recibís tokens <strong>$DPF</strong> que representan tu participación proporcional en el complejo deportivo. Mientras tengas tokens, cobrás dividendos en USDC cada vez que el complejo distribuya ganancias.
                  </p>
                </div>
              </div>

              <div className="invest-help-divider" />

              <div className="invest-help-section">
                <div className="invest-help-section-icon invest-help-section-icon--green">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="invest-help-section-title">Dos perfiles de riesgo</p>
                  <p className="invest-help-section-text">
                    <strong>Complejo en construcción ("pozo"):</strong> precio de token más bajo, mayor retorno potencial, más riesgo.
                  </p>
                  <p className="invest-help-section-text">
                    <strong>Complejo ya operando:</strong> precio más alto, menor riesgo, retorno más estable con datos reales de facturación.
                  </p>
                </div>
              </div>

              <div className="invest-help-divider" />

              <div className="invest-help-section">
                <div className="invest-help-section-icon invest-help-section-icon--amber">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="invest-help-section-title">¿Qué pasa si el proyecto no alcanza su meta?</p>
                  <p className="invest-help-section-text">
                    Cada oferta tiene un mínimo de recaudación. Si no se alcanza antes del cierre, recuperás tu USDC íntegramente. Si se alcanza, los fondos van al desarrollador y empezás a acumular dividendos.
                  </p>
                </div>
              </div>

              <div className="invest-help-divider" />

              <div className="invest-help-tip">
                <span>¿Querés salir de tu inversión?</span> Vendé tus $DPF en el Marketplace en cualquier momento y recibí USDC al instante.
              </div>

            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}