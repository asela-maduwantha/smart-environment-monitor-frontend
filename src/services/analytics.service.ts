import { apiFetch, queryString, unwrapCollection, unwrapEntity } from "@/lib/api";
import { mapAnalytics, mapChartReading, type RawAnalytics, type RawChartReading } from "@/lib/api-mappers";
import type { AnalyticsRange, ChartRange } from "@/types";
export const analyticsService = {
  chart: async (id: string, range: ChartRange, signal?: AbortSignal) => unwrapCollection<RawChartReading>(await apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/charts/environment${queryString({ range })}`, { signal }), "readings", "chartReadings", "items").map(mapChartReading),
  get: async (id: string, range: AnalyticsRange, signal?: AbortSignal) => {
    const [raw, readings] = await Promise.all([
      apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/analytics${queryString({ range })}`, { signal }),
      apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/charts/environment${queryString({ range })}`, { signal }),
    ]);
    return mapAnalytics(unwrapEntity<RawAnalytics>(raw, "analytics"), range, unwrapCollection<RawChartReading>(readings, "readings", "chartReadings", "items").map(mapChartReading));
  },
};
