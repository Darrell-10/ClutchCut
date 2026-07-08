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
