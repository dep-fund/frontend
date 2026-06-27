import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useUser } from "../hooks/useUser";
import InvestmentCard from "../components/InvestmentCard";
import { useExploreProjects } from "../hooks/useExploreProjects";
import { fetchMyInvestments, fetchProjectInvestmentStats } from "../services/api";

type InvestmentGroup = {
  id: string;
  projectName: string;
  amount: number;
  tokens: number;
  progress: string;
  projectId: string;
  dividendAddress: string | null;
};

export default function MyInvestments() {
  const { user } = useUser();
  const { projects, loading: projectsLoading } = useExploreProjects();
  const [investments, setInvestments] = useState<InvestmentGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectsLoading) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { results } = await fetchMyInvestments();

        // Solo nos interesa lo que el usuario sigue teniendo hoy.
        // Lo que ya vendió (is_active = false) no cuenta como inversión actual.
        const activas = results.filter((inv) => inv.is_active);

        // Agrupamos por proyecto: sumamos tokens y costo invertido (FIFO ya
        // resuelto en el backend, acá solo sumamos lo que queda activo).
        const agrupadas = activas.reduce<Record<string, { tokens: number; amount: number }>>(
          (acc, inv) => {
            const pid = inv.project_id;
            if (!acc[pid]) acc[pid] = { tokens: 0, amount: 0 };
            const quantity = Number(inv.token_quantity);
            const price = Number(inv.unit_price);
            acc[pid].tokens += quantity;
            acc[pid].amount += quantity * price;
            return acc;
          },
          {}
        );

        const projectIds = Object.keys(agrupadas);

        // Progreso real del proyecto (a nivel proyecto, no del usuario individual).
        const statsEntries = await Promise.all(
          projectIds.map(async (pid) => {
            try {
              const stats = await fetchProjectInvestmentStats(pid);
              return [pid, stats] as const;
            } catch {
              return [pid, null] as const;
            }
          })
        );
        const statsByProject = Object.fromEntries(statsEntries);

        const mapeadas: InvestmentGroup[] = projectIds.map((pid) => {
          const grupo = agrupadas[pid];
          const proyecto = projects.find((p) => String(p.id) === String(pid));
          const stats = statsByProject[pid];

          return {
            id: pid,
            projectName: proyecto?.name || "Proyecto",
            amount: Number(grupo.amount.toFixed(2)),
            tokens: Number(grupo.tokens.toFixed(4)),
            progress: stats ? `${Number(stats.progress_pct).toFixed(0)}%` : "—",
            projectId: pid,
            dividendAddress: proyecto?.dividend_address ?? null,
          };
        });

        if (!cancelled) setInvestments(mapeadas);
      } catch (err) {
        console.error("Error cargando mis inversiones:", err);
        if (!cancelled) setInvestments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [projects, projectsLoading]);

  return (
    <DashboardLayout title="Mis Inversiones" user={user}>
      <div className="myprojects-header">
        <span className="myprojects-count">
          {investments.length} inversión{investments.length !== 1 ? "es" : ""} activas
        </span>
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
        {investments.map((inv) => (
          <InvestmentCard key={inv.id} investment={inv} />
        ))}
      </div>
    </DashboardLayout>
  );
}