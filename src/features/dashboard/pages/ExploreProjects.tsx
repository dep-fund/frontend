import { useState, useMemo } from "react";
import "./ExploreProjects.css";
import { Search, Library } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import ProjectCard from "../components/ProjectCard";
import { useUser } from "../hooks/useUser";
import { useExploreProjects } from "../hooks/useExploreProjects";
import { useCategories } from "../hooks/useCategories";

export default function ExploreProjects() {
  const { user } = useUser();
  const { projects, loading } = useExploreProjects();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        p.categories?.some((c) => c.id === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, selectedCategory]);

  return (
    <DashboardLayout title="Explorar Proyectos" user={user}>
      <div className="explore-layout">
        <aside className="explore-filters">
          <h3 className="explore-filters-title">Filtros</h3>

          <div className="explore-filter-group">
            <label htmlFor="search-projects">Buscar proyectos</label>
            <div className="explore-search">
              <Search size={14} className="explore-search-icon" />
              <input
                id="search-projects"
                type="text"
                placeholder="Nombre del proyecto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

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
        </aside>

        <div className="explore-main">
          <p className="explore-count">
            <Library size={16} style={{ marginRight: 8, color: '#EC8F41' }} />
            {loading ? "Cargando proyectos..." : `${filtered.length} proyecto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
          </p>

          <div className="explore-grid">
            {loading ? (
              <p className="explore-loading">Obteniendo los proyectos de la comunidad...</p>
            ) : (
              <>
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} showActions={false} />
                ))}
                {filtered.length === 0 && (
                  <p className="explore-empty">No se encontraron proyectos con los filtros actuales.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
