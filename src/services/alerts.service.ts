import { apiFetch, queryString, unwrapCollection, unwrapEntity } from "@/lib/api";
import { mapAlert, type RawAlert } from "@/lib/api-mappers";
import type { AlertStatus, AlertType } from "@/types";
export const alertsService = {
  list: async (params: { deviceId?: string; status?: AlertStatus; type?: AlertType; limit?: number } = {}, signal?: AbortSignal) => unwrapCollection<RawAlert>(await apiFetch<unknown>(`/alerts${queryString(params)}`, { signal }), "alerts", "items").map(mapAlert),
  resolve: async (id: string) => mapAlert(unwrapEntity<RawAlert>(await apiFetch<unknown>(`/alerts/${encodeURIComponent(id)}/resolve`, { method: "PATCH" }), "alert")),
};
