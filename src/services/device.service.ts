import { apiFetch, unwrapCollection, unwrapEntity } from "@/lib/api";
import { mapDevice, type RawDevice } from "@/lib/api-mappers";
export const deviceService = {
  list: async (signal?: AbortSignal) => unwrapCollection<RawDevice>(await apiFetch<unknown>("/devices", { signal }), "devices", "items").map(mapDevice),
  get: async (id: string, signal?: AbortSignal) => mapDevice(unwrapEntity<RawDevice>(await apiFetch<unknown>(`/devices/${encodeURIComponent(id)}`, { signal }), "device")),
};
