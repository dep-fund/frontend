export type ProjectState = "PENDING" | "APPROVED" | "CANCELED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";



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
  // Campos financieros
  min_amount: string | null;
  risk: string | null;
  annual_expenses: string | null;
  annual_gross_profit: string | null;
  roi: string | null;
  annual_benefits: string | null;
  // Campos blockchain
  suffix: string | null;
  dividend_address: string | null;
  offering_address: string | null;
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

export interface Listing {
  id: number;
  total_amount: number;
  remaining_amount: number;
  price_per_token: number;
  seller: string;
  status: "active" | "finalized" | "cancelled";
  token: string;
}
 
export interface MarketplaceInfo {
  marketplace_address: string;
  usdc_address: string;
  factory_address: string;
}

export interface TokenDetail {
  id: string;
  name: string;
  suffix: string;
  contract_address: string;
}

export interface ProjectToken {
  id: string;
  token_id: string;
  project_id: string;
  total_supply: string;
  available_supply: string;
  token: TokenDetail;
  current_price: string | null;  // ← agregar esto
}

export interface Publication {
  id: string;
  token_id: string;
  seller_id: string;
  status: "active" | "completed" | "canceled";
  total: string;
  available: string;
  price_per_token: string;
  listing_id: number | null;  // agregar esta línea
  created_at: string;
  updated_at: string;
  token: TokenDetail;
}

export interface Trade {
  id: string;
  publication_id: string;
  buyer_id: string;
  amount: string;
  total_price: string;
  status: "pending" | "confirmed" | "failed";
  tx_hash: string | null;
  created_at: string;
}

export type Investment = {
  id: string;
  user_id: string;
  project_id: string;
  token_id: string;
  token_quantity: string;
  unit_price: string;
  source: "offering" | "marketplace";
  is_active: boolean;
  tx_hash: string | null;
  created_at: string;
};

export type ProjectInvestmentStats = {
  raised_amount: string;
  investors_count: number;
  progress_pct: string;
};