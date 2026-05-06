import axios from "axios";
import { API_URL } from "../../../constants";
import type { PaginatedResponse, Project, User, Category } from "../types";

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
  image?: string;
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
