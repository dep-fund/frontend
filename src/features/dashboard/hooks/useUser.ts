import { useState, useEffect } from "react";
import { fetchMe } from "../services/api";
import type { User } from "../types";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setError("Error al cargar usuario"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error, setUser };
};
