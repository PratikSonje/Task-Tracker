import { Task } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken(): string | null {
  return localStorage.getItem("tasktracker_token");
}

export function setToken(token: string) {
  localStorage.setItem("tasktracker_token", token);
}

export function removeToken() {
  localStorage.removeItem("tasktracker_token");
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      removeToken();
      window.location.reload();
    }
    throw new Error(errorData.error || "API Request Failed");
  }

  const result = await response.json();
  return result.data;
}

export const api = {
  async getTasks(): Promise<Task[]> {
    return fetchWithAuth("/tasks");
  },
  
  async createTask(data: Partial<Task>): Promise<Task> {
    return fetchWithAuth("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  async deleteTask(id: string): Promise<void> {
    await fetchWithAuth(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
  
  async login(data: any): Promise<any> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Authentication failed");
    return result;
  },

  async register(data: any): Promise<any> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Authentication failed");
    return result;
  }
};
