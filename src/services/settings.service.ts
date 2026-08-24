import { apiFetch } from "@/lib/api";
import type { DeviceSettings } from "@/types";
export const settingsService = {
  get: (id: string, signal?: AbortSignal) => apiFetch<DeviceSettings>(`/devices/${encodeURIComponent(id)}/settings`, { signal }),
  update: (id: string, settings: DeviceSettings) => apiFetch<DeviceSettings>(`/devices/${encodeURIComponent(id)}/settings`, { method: "PUT", body: JSON.stringify(settings) }),
};
