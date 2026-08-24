import { apiFetch, queryString } from "@/lib/api";
import type { Analytics, AnalyticsRange, ChartRange, ChartReading } from "@/types";
export const analyticsService = {
  chart: (id: string, range: ChartRange, signal?: AbortSignal) => apiFetch<ChartReading[]>(`/devices/${encodeURIComponent(id)}/charts/environment${queryString({ range })}`, { signal }),
  get: (id: string, range: AnalyticsRange, signal?: AbortSignal) => apiFetch<Analytics>(`/devices/${encodeURIComponent(id)}/analytics${queryString({ range })}`, { signal }),
};
