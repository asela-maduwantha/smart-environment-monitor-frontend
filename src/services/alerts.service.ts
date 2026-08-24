import { apiFetch, queryString } from "@/lib/api";
import type { Alert, AlertStatus, AlertType } from "@/types";
export const alertsService = {
  list: (params: { deviceId?: string; status?: AlertStatus; type?: AlertType; limit?: number } = {}, signal?: AbortSignal) => apiFetch<Alert[]>(`/alerts${queryString(params)}`, { signal }),
  resolve: (id: string) => apiFetch<Alert>(`/alerts/${encodeURIComponent(id)}/resolve`, { method: "PATCH" }),
};
