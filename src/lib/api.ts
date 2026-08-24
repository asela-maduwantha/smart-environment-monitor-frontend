import type { ApiResponse } from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "ApiError"; }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    if (!response.ok || !payload?.success) {
      throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof ApiError || (error instanceof DOMException && error.name === "AbortError")) throw error;
    throw new ApiError("Unable to reach monitoring server.", 0);
  }
}

export function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value !== undefined && search.set(key, String(value)));
  const result = search.toString();
  return result ? `?${result}` : "";
}
