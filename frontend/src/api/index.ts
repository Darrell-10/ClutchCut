import axios from "axios";
import type {
  UploadResponse,
  ProcessingStatus,
  Clip,
  SearchRequest,
  SearchResponse,
  PlayCategory,
} from "../types";

const BASE = "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function uploadVideo(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<UploadResponse>("/api/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getStatus(jobId: string): Promise<ProcessingStatus> {
  const res = await api.get<ProcessingStatus>(`/api/status/${jobId}`);
  return res.data;
}

export async function getClips(jobId: string, category?: PlayCategory): Promise<Clip[]> {
  const params = category ? { category } : {};
  const res = await api.get<Clip[]>(`/api/clips/${jobId}`, { params });
  return res.data;
}

export async function searchClips(req: SearchRequest): Promise<SearchResponse> {
  const res = await api.post<SearchResponse>("/api/search", req);
  return res.data;
}

export function getClipUrl(filename: string): string {
  return `${BASE}/clips/${filename}`;
}

export function getThumbnailUrl(filename: string): string {
  return `${BASE}/thumbnails/${filename}`;
}

export function getDownloadUrl(filename: string): string {
  return `${BASE}/api/clip/download/${filename}`;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthUser { id: number; name: string; email: string; }
export interface AuthResponse { access_token: string; user_id: number; name: string; email: string; }

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
  return res.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<AuthUser>("/api/auth/me");
  return res.data;
}

export async function getMyJobs(): Promise<any[]> {
  const res = await api.get("/api/my/jobs");
  return res.data;
}
