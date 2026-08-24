import { alertsService } from "./alerts.service";
import { analyticsService } from "./analytics.service";
import { deviceService } from "./device.service";
import { readingsService } from "./readings.service";
import { settingsService } from "./settings.service";
import type { DashboardSummary } from "@/types";

export const dashboardService = {
  async get(id: string, range: "1h" | "24h" | "7d" | "30d", signal?: AbortSignal): Promise<DashboardSummary> {
    const [device, latestReading, settings, alerts, chartReadings, recentReadings] = await Promise.all([
      deviceService.get(id, signal), readingsService.latest(id, signal), settingsService.get(id, signal),
      alertsService.list({ deviceId: id, limit: 8 }, signal), analyticsService.chart(id, range, signal),
      readingsService.recent(id, 30, signal),
    ]);
    const today = new Date().toDateString();
    return {
      device, latestReading, settings, alerts, chartReadings, recentReadings,
      motionEventsToday: recentReadings.filter((r) => r.motionDetected && new Date(r.timestamp).toDateString() === today).length,
      environmentStatus: alerts.some((a) => a.status === "active") ? "attention" : "normal",
    };
  },
};
