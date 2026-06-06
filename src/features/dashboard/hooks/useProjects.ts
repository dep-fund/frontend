import { useState, useEffect } from "react";
import { fetchMyProjects } from "../services/api";
import type { Project } from "../types";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const data = await fetchMyProjects(page, pageSize);
      setProjects(data.results);
      setTotal(data.total);
    } catch {
      setError("Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { projects, total, loading, error, reload: load };
};
