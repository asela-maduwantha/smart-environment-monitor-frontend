import { apiFetch, queryString, unwrapCollection, unwrapEntity } from "@/lib/api";
import { mapAnalytics, mapChartReading, type RawAnalytics, type RawChartReading } from "@/lib/api-mappers";
import type { AnalyticsRange, ChartRange, PredictiveInsights } from "@/types";

export const analyticsService = {
  chart: async (id: string, range: ChartRange, includeForecast = false, signal?: AbortSignal) =>
    unwrapCollection<RawChartReading>(
      await apiFetch<unknown>(
        `/devices/${encodeURIComponent(id)}/charts/environment${queryString({ range, forecast: includeForecast ? 'true' : undefined })}`,
        { signal }
      ),
      "readings",
      "chartReadings",
      "items"
    ).map(mapChartReading),

  get: async (id: string, range: AnalyticsRange, signal?: AbortSignal) => {
    const [raw, readings, predictions] = await Promise.all([
      apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/analytics${queryString({ range })}`, { signal }),
      apiFetch<unknown>(`/devices/${encodeURIComponent(id)}/charts/environment${queryString({ range, forecast: 'true' })}`, { signal }),
      apiFetch<{ success: boolean; data: PredictiveInsights }>(`/devices/${encodeURIComponent(id)}/analytics/predictions`, { signal }).catch(() => null),
    ]);
    const analytics = mapAnalytics(
      unwrapEntity<RawAnalytics>(raw, "analytics"),
      range,
      unwrapCollection<RawChartReading>(readings, "readings", "chartReadings", "items").map(mapChartReading)
    );
    return {
      ...analytics,
      predictions: predictions?.data,
    };
  },

  predictions: async (id: string, signal?: AbortSignal): Promise<PredictiveInsights | null> => {
    try {
      return await apiFetch<PredictiveInsights>(
        `/devices/${encodeURIComponent(id)}/analytics/predictions`,
        { signal }
      );
    } catch {
      return null;
    }
  },
};

