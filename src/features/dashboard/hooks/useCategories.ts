import { useState, useEffect } from "react";
import { fetchCategories } from "../services/api";
import type { Category } from "../types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.results))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
};
