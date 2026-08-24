import { apiFetch, queryString } from "@/lib/api";
import type { SensorReading } from "@/types";
export const readingsService = {
  latest: (id: string, signal?: AbortSignal) => apiFetch<SensorReading>(`/devices/${encodeURIComponent(id)}/readings/latest`, { signal }),
  recent: (id: string, limit = 20, signal?: AbortSignal) => apiFetch<SensorReading[]>(`/devices/${encodeURIComponent(id)}/readings${queryString({ limit })}`, { signal }),
};
