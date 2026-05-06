import { useState, useEffect } from "react";
import { fetchExploreProjects } from "../services/api";
import type { Project } from "../types";

export const useExploreProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = async (p = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const data = await fetchExploreProjects(p, pageSize);
      setProjects(data.results);
      setTotal(data.total);
      setPage(p);
    } catch {
      setError("Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { projects, total, loading, error, page, load };
};
