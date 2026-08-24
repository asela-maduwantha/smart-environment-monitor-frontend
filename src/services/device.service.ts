import { apiFetch } from "@/lib/api";
import type { Device } from "@/types";
export const deviceService = {
  list: (signal?: AbortSignal) => apiFetch<Device[]>("/devices", { signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<Device>(`/devices/${encodeURIComponent(id)}`, { signal }),
};
