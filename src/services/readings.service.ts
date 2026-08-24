import { apiFetch, queryString, unwrapCollection, unwrapEntity } from "@/lib/api";
import { mapReading, type RawReading } from "@/lib/api-mappers";
export const readingsService = {
  latest: async (id: string, signal?: AbortSignal) => mapReading(unwrapEntity<RawReading>(await apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/readings/latest`, { signal }), "reading")),
  recent: async (id: string, limit = 20, signal?: AbortSignal) => unwrapCollection<RawReading>(await apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/readings${queryString({ limit })}`, { signal }), "readings", "items").map(mapReading),
};
