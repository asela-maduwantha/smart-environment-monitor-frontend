"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  Download,
  Droplets,
  Lightbulb,
  MapPin,
  Radio,
  Settings,
  Thermometer,
  UserCheck,
  UserX,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { useDevice } from "@/context/device-context";
import { useApiResource } from "@/hooks/use-api-resource";
import { deviceService } from "@/services/device.service";
import { readingsService } from "@/services/readings.service";
import { alertsService } from "@/services/alerts.service";
import { analyticsService } from "@/services/analytics.service";
import { settingsService } from "@/services/settings.service";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { EnvironmentChart, LightChart } from "@/components/dashboard/charts";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";
import { formatNumber, fullTimestamp, relativeTime } from "@/lib/formatters";
import { rssiQuality } from "@/lib/utils";

export default function DeviceDetailPage() {
  const params = useParams<{ deviceId: string }>();
  const id = decodeURIComponent(params.deviceId);
  const { selectedDeviceId, setSelectedDeviceId } = useDevice();

  const resource = useApiResource(async (signal) => {
    const [device, latest, readings, alerts, chart, settings] =
      await Promise.all([
        deviceService.get(id, signal),
        readingsService.latest(id, signal),
        readingsService.recent(id, 15, signal),
        alertsService.list({ deviceId: id, limit: 5 }, signal),
        analyticsService.chart(id, "24h", false, signal),
        settingsService.get(id, signal),
      ]);
    return { device, latest, readings, alerts, chart, settings };
  }, [id]);

  const exportReadingsCSV = () => {
    if (!resource.data || !resource.data.readings.length) {
      toast.error("No telemetry logs available to export.");
      return;
    }

    const headers = ["Recorded_At", "Temperature_C", "Humidity_Percent", "Light_Raw", "Motion_Detected", "Wi-Fi_RSSI"];
    const rows = resource.data.readings.map((r) => [
      r.timestamp,
      r.temperatureC,
      r.humidityPercent,
      r.lightValue,
      r.motionDetected ? "TRUE" : "FALSE",
      r.wifiRssi,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `device_${id}_telemetry_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Device telemetry exported to CSV.");
  };

  if (resource.loading) return <PageSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} retry={resource.retry} />;

  const d = resource.data;
  if (!d) return <EmptyState title="Device node not found." />;

  const isCurrentActive = selectedDeviceId === d.device.id;

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div>
        <Link
          href="/devices"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Node Fleet</span>
        </Link>
      </div>

      {/* Hardware Profile Banner */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                <Cpu className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {d.device.name || d.device.id}
                  </h2>
                  <Badge
                    variant={d.device.status === "online" ? "success" : "neutral"}
                    dot
                  >
                    {d.device.status}
                  </Badge>
                  {isCurrentActive && (
                    <Badge variant="glow">Active Workspace Node</Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono">ID: {d.device.id}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.device.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                    {d.device.wifiRssi} dBm ({rssiQuality(d.device.wifiRssi)})
                  </span>
                  <span>Last Seen: {relativeTime(d.device.lastSeen)}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              {!isCurrentActive && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedDeviceId(d.device.id);
                    toast.success(`Switched active node to ${d.device.name || d.device.id}`);
                  }}
                  className="text-xs"
                >
                  Select as Active Node
                </Button>
              )}
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Configure Limits</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Sensor Telemetry Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SensorCard
          title="Current Temperature"
          value={formatNumber(d.latest.temperatureC)}
          unit="°C"
          status="Latest Reading"
          detail={`Target: ${d.settings.lowTemperature}–${d.settings.highTemperature} °C`}
          icon={Thermometer}
          color="blue"
        />

        <SensorCard
          title="Current Humidity"
          value={formatNumber(d.latest.humidityPercent, 0)}
          unit="%"
          status="Latest Reading"
          detail={`Target: ${d.settings.lowHumidity}–${d.settings.highHumidity}%`}
          icon={Droplets}
          color="cyan"
        />

        <SensorCard
          title="Room Illumination"
          value={d.latest.lightValue >= 1 ? "Illuminated" : "Dim"}
          status={d.latest.lightValue >= 1 ? "Lights ON" : "Lights OFF"}
          detail="Digital LDR Sensor"
          icon={Lightbulb}
          color="amber"
        />

        <SensorCard
          title="Room Presence"
          value={d.latest.motionDetected ? "Someone in the room" : "Room Empty"}
          status={d.latest.motionDetected ? "Occupied" : "Vacant"}
          icon={d.latest.motionDetected ? UserCheck : UserX}
          color={d.latest.motionDetected ? "emerald" : "violet"}
          isAlert={d.latest.motionDetected}
        />
      </div>

      {/* Interactive Temporal Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <EnvironmentChart data={d.chart} />
        <LightChart data={d.chart} />
      </div>

      {/* Historical Telemetry Table & Configuration Overview */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Telemetry Log Table (2 columns on wide screens) */}
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Telemetry Packets</CardTitle>
              <CardDescription>
                Historical sensor log for {d.device.id}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportReadingsCSV}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </CardHeader>

          <CardContent>
            {d.readings.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs font-mono">
                  <thead className="border-b border-slate-200/80 bg-slate-50/50 uppercase text-[10px] text-slate-400 dark:border-white/5 dark:bg-slate-900/50">
                    <tr>
                      <th className="py-3 px-3">Timestamp</th>
                      <th className="py-3 px-3">Temp (°C)</th>
                      <th className="py-3 px-3">Humidity (%)</th>
                      <th className="py-3 px-3">Light (raw)</th>
                      <th className="py-3 px-3">Motion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {d.readings.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                          {fullTimestamp(r.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {formatNumber(r.temperatureC)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">
                          {formatNumber(r.humidityPercent, 0)}%
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                          {formatNumber(r.lightValue, 0)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold ${
                              r.motionDetected
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            }`}
                          >
                            {r.motionDetected ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-slate-400">
                No telemetry packets recorded yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Threshold Limits & Alerts Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Threshold Configuration</CardTitle>
              <CardDescription>
                Synchronized node parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-900/60 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">
                    Temp Safe Range
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {d.settings.lowTemperature}–{d.settings.highTemperature} °C
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">
                    Humidity Range
                  </span>
                  <span className="font-bold text-cyan-500">
                    {d.settings.lowHumidity}–{d.settings.highHumidity}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 text-[10px] uppercase block">
                    Publish Interval
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {d.settings.publishIntervalSeconds}s
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 text-[10px] uppercase block">
                    Sample Interval
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {d.settings.samplingIntervalSeconds}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Node Incidents</CardTitle>
              <CardDescription>
                Recent alerts triggered by {d.device.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {d.alerts.length ? (
                <div className="space-y-2.5">
                  {d.alerts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 p-3 text-xs dark:border-white/5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {relativeTime(a.triggeredAt)}
                        </p>
                      </div>
                      <Badge
                        variant={a.status === "active" ? "warning" : "success"}
                        dot
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  No alerts triggered for this node.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
