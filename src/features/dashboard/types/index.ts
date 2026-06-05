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

  min_amount?: string | null;
  risk?: RiskLevel | null;
  annual_expenses?: string | null;
  annual_gross_profit?: string | null;
  roi?: string | null;
  annual_benefits?: string | null;
  suffix?: string | null;
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
