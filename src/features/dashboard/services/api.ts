import axios from "axios";
import { API_URL } from "../../../constants";
import type { PaginatedResponse, Project, User, Category, Listing, MarketplaceInfo, ProjectToken, Publication, Trade } from "../types";
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchMe = async (): Promise<User> => {
  const res = await axios.get(`${API_URL}/users/me`, { headers: authHeader() });
  return res.data;
};

export const fetchMyProjects = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Project>> => {
  const res = await axios.get(`${API_URL}/projects`, {
    headers: authHeader(),
    params: { page, page_size: pageSize },
  });
  return res.data;
};

export const fetchExploreProjects = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Project>> => {
  const res = await axios.get(`${API_URL}/projects/explore`, {
    headers: authHeader(),
    params: { page, page_size: pageSize },
  });
  return res.data;
};

export const fetchCategories = async (): Promise<PaginatedResponse<Category>> => {
  const res = await axios.get(`${API_URL}/categories`, {
    headers: authHeader(),
    params: { page: 1, page_size: 100 },
  });
  return res.data;
};

export const createProject = async (data: {
  name: string;
  description: string;
  total_amount: number;
  min_amount?: number | null;
  suffix?: string | null;
  annual_gross_profit?: number | null;
  annual_expenses?: number | null;
  ubication: string;
  category_ids?: string[];
}): Promise<Project> => {
  const res = await axios.post(`${API_URL}/projects`, data, { headers: authHeader() });
  return res.data;
};

export const updateProject = async (
  projectId: string,
  data: {
    name?: string;
    description?: string;
    total_amount?: number;
    ubication?: string;
    state?: string;
    category_ids?: string[];
  }
): Promise<Project> => {
  const res = await axios.patch(`${API_URL}/projects/${projectId}`, data, { headers: authHeader() });
  return res.data;
};

export const fetchProject = async (projectId: string): Promise<Project> => {
  const res = await axios.get(`${API_URL}/projects/${projectId}`, { headers: authHeader() });
  return res.data;
};

export const updateMe = async (data: {
  username?: string;
  name?: string;
  last_name?: string;
  email?: string;
}): Promise<User> => {
  const res = await axios.patch(`${API_URL}/users/me`, data, { headers: authHeader() });
  return res.data;
};

export const changePassword = async (data: {
  old_password: string;
  new_password: string;
}): Promise<void> => {
  await axios.post(`${API_URL}/users/me/change-password`, data, { headers: authHeader() });
};

export const deleteMe = async (): Promise<void> => {
  await axios.delete(`${API_URL}/users/me`, { headers: authHeader() });
};

export const updateAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.patch(`${API_URL}/users/me/avatar`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export type ProjectAdvance = {
  project_id: string;
  number: number;
  description: string;
  url?: string | null;
};

export const listAdvances = async (projectId: string): Promise<ProjectAdvance[]> => {
  const res = await axios.get(`${API_URL}/projects/${projectId}/advances`, { headers: authHeader() });
  return res.data;
};

export const addAdvance = async (projectId: string, file: File, description: string): Promise<ProjectAdvance> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description);
  const res = await axios.post(`${API_URL}/projects/${projectId}/advances`, formData, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAdvance = async (projectId: string, number: number): Promise<void> => {
  await axios.delete(`${API_URL}/projects/${projectId}/advances/${number}`, { headers: authHeader() });
};

export type ProjectImage = {
  project_id: string;
  number: number;
  url: string;
};

export const listProjectImages = async (projectId: string): Promise<ProjectImage[]> => {
  const res = await axios.get(`${API_URL}/projects/${projectId}/images`, { headers: authHeader() });
  return res.data;
};

export const uploadProjectImage = async (projectId: string, file: File): Promise<ProjectImage> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${API_URL}/projects/${projectId}/images`, formData, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProjectImage = async (projectId: string, number: number): Promise<void> => {
  await axios.delete(`${API_URL}/projects/${projectId}/images/${number}`, { headers: authHeader() });
};

export type ProjectDocument = {
  project_id: string;
  number: number;
  url: string;
  name?: string;
};

export const listDocuments = async (
  projectId: string
): Promise<ProjectDocument[]> => {
  const res = await axios.get(
    `${API_URL}/projects/${projectId}/documents`,
    { headers: authHeader() }
  );

  return res.data;
};

export const addDocument = async (
  projectId: string,
  file: File,
): Promise<ProjectDocument> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${API_URL}/projects/${projectId}/documents`,
    formData,
    { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const deleteDocument = async (
  projectId: string,
  number: number
): Promise<void> => {
  await axios.delete(
    `${API_URL}/projects/${projectId}/documents/${number}`,
    { headers: authHeader() }
  );
};

export const fetchMarketplaceInfo = async (): Promise<MarketplaceInfo> => {
  const res = await axios.get(`${API_URL}/marketplace/info`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchActiveListings = async (): Promise<Listing[]> => {
  const res = await axios.get(`${API_URL}/marketplace`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchListingsByToken = async (tokenAddress: string): Promise<Listing[]> => {
  const res = await axios.get(`${API_URL}/marketplace/listings/token/${tokenAddress}`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchMyListings = async (sellerAddress: string, status = "active"): Promise<Listing[]> => {
  const res = await axios.get(`${API_URL}/marketplace/listings/seller/${sellerAddress}?status=${status}`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchTokenByProject = async (projectId: string): Promise<ProjectToken> => {
  const res = await axios.get(`${API_URL}/tokens/project/${projectId}`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchAllTokens = async () => {
  const res = await axios.get(`${API_URL}/tokens`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchPublications = async (): Promise<Publication[]> => {
  const res = await axios.get(`${API_URL}/publications`, { headers: authHeader() });
  return res.data;
};

export const createPublication = async (data: {
  token_id: string;
  total: string;
  price_per_token: string;
  listing_id: number;
}): Promise<Publication> => {
  const res = await axios.post(`${API_URL}/publications`, data, { headers: authHeader() });
  return res.data;
};

export const cancelPublication = async (publicationId: string): Promise<Publication> => {
  const res = await axios.patch(`${API_URL}/publications/${publicationId}/cancel`, {}, { headers: authHeader() });
  return res.data;
};

export const createTrade = async (data: {
  publication_id: string;
  amount: string;
}): Promise<Trade> => {
  const res = await axios.post(`${API_URL}/trades`, data, { headers: authHeader() });
  return res.data;
};

export const confirmTrade = async (tradeId: string, tx_hash: string): Promise<Trade> => {
  const res = await axios.patch(`${API_URL}/trades/${tradeId}/confirm`, { tx_hash }, { headers: authHeader() });
  return res.data;
};

export const failTrade = async (tradeId: string): Promise<Trade> => {
  const res = await axios.patch(`${API_URL}/trades/${tradeId}/fail`, {}, { headers: authHeader() });
  return res.data;
};

export const fetchMyTrades = async (): Promise<Trade[]> => {
  const res = await axios.get(`${API_URL}/trades/my-trades`, { headers: authHeader() });
  return res.data;
};

export const fetchMyPublications = async (): Promise<Publication[]> => {
  const res = await axios.get(`${API_URL}/publications/my`, { headers: authHeader() });
  return res.data;
};