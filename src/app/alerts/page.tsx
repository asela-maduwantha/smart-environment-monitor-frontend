"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useApiResource } from "@/hooks/use-api-resource";
import { alertsService } from "@/services/alerts.service";
import { relativeTime, fullTimestamp } from "@/lib/formatters";
import type { AlertSeverity, AlertStatus, AlertType } from "@/types";
import { Badge, Button, Card, CardContent, Input } from "@/components/ui";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";

type StatusFilter = "all" | AlertStatus;
type SeverityFilter = "all" | AlertSeverity;
type SensorFilter = "all" | AlertType;

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sensorFilter, setSensorFilter] = useState<SensorFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const resource = useApiResource(
    (signal) =>
      alertsService.list(
        statusFilter === "all" ? {} : { status: statusFilter },
        signal
      ),
    [statusFilter]
  );

  const rawAlerts = useMemo(() => resource.data ?? [], [resource.data]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter((a) => {
      // Severity filter
      if (severityFilter !== "all" && a.severity !== severityFilter)
        return false;
      // Sensor type filter
      if (sensorFilter !== "all" && a.type !== sensorFilter)
        return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.deviceId.toLowerCase().includes(q) ||
          String(a.value).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rawAlerts, severityFilter, sensorFilter, searchQuery]);

  // Alert KPI counters
  const totalCount = rawAlerts.length;
  const activeCount = rawAlerts.filter((a) => a.status === "active").length;
  const criticalCount = rawAlerts.filter(
    (a) => a.status === "active" && a.severity === "critical"
  ).length;
  const resolvedCount = rawAlerts.filter((a) => a.status === "resolved").length;

  async function resolveAlert(id: string) {
    setResolvingId(id);
    try {
      await alertsService.resolve(id);
      toast.success("Alert resolved and incident closed.");
      resource.retry();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unable to resolve alert."
      );
    } finally {
      setResolvingId(null);
    }
  }

  if (resource.loading && !resource.data) return <PageSkeleton />;
  if (resource.error && !resource.data)
    return <ErrorState message={resource.error} retry={resource.retry} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Incident Command & Alerts
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time anomaly detection, threshold breach logs, and incident resolution
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={criticalCount > 0 ? "critical" : "neutral"} dot pulse={criticalCount > 0}>
            {criticalCount} Critical
          </Badge>
          <Badge variant={activeCount > 0 ? "warning" : "success"} dot>
            {activeCount} Active Issues
          </Badge>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Incident Events
              </p>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {totalCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Bell className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                Active Breaches
              </p>
              <p className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {activeCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                Critical Severity
              </p>
              <p className="mt-1 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {criticalCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Resolved Incidents
              </p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {resolvedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search input */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search alerts by title, sensor, or node ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filters */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-white/10 dark:bg-slate-900/80">
                {(["all", "active", "resolved"] as StatusFilter[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                      statusFilter === st
                        ? "bg-blue-600 text-white shadow-xs dark:bg-cyan-500 dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Severity Filters */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-white/10 dark:bg-slate-900/80">
                {(["all", "critical", "warning", "info"] as SeverityFilter[]).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                      severityFilter === sev
                        ? "bg-blue-600 text-white shadow-xs dark:bg-cyan-500 dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      {filteredAlerts.length ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/50 uppercase text-[10px] text-slate-400 dark:border-white/5 dark:bg-slate-900/50 font-mono">
                <tr>
                  <th className="px-6 py-4">Incident Title</th>
                  <th className="px-6 py-4">Device Node</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Breach Value</th>
                  <th className="px-6 py-4">Triggered Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {alert.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono capitalize">
                        Type: {alert.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {alert.deviceId}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "critical"
                            : alert.severity === "warning"
                            ? "warning"
                            : "info"
                        }
                        dot
                      >
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {alert.value}
                      {alert.unit ? ` ${alert.unit}` : ""}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      <div>{relativeTime(alert.triggeredAt)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {fullTimestamp(alert.triggeredAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={alert.status === "active" ? "warning" : "success"}
                        dot
                      >
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {alert.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={resolvingId === alert.id}
                          onClick={() => resolveAlert(alert.id)}
                          className="h-8 px-3 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No alerts found"
          description="No incidents match the active search and filter criteria."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setSeverityFilter("all");
                setSensorFilter("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      )}
    </div>
  );
}
