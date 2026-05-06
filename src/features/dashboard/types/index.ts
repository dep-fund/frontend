export type ProjectState = "PENDING" | "APPROVED" | "CANCELED";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  total_amount: string;
  state: ProjectState;
  ubication: string;
  user_id: string;
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  results: T[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  last_name: string;
  birthdate: string | null;
  email: string;
  image: string | null;
  activated: boolean;
  blocked: boolean;
  created_at: string;
  updated_at: string;
}
