import { apiFetch, unwrapEntity } from "@/lib/api";
import type { DeviceSettings } from "@/types";
export const settingsService = {
  get: async (id: string, signal?: AbortSignal) => unwrapEntity<DeviceSettings>(await apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/settings`, { signal }), "settings"),
  update: async (id: string, settings: DeviceSettings) => unwrapEntity<DeviceSettings>(await apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/settings`, { method: "PUT", body: JSON.stringify(settings) }), "settings"),
};
