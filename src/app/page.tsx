"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Droplets,
  Lightbulb,
  Radio,
  Thermometer,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { useDevice } from "@/context/device-context";
import { useApiResource } from "@/hooks/use-api-resource";
import { dashboardService } from "@/services/dashboard.service";
import { alertsService } from "@/services/alerts.service";
import { formatNumber, relativeTime } from "@/lib/formatters";
import { rssiQuality } from "@/lib/utils";
import type { ChartRange } from "@/types";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { VitalityScore } from "@/components/dashboard/vitality-score";
import { EnvironmentChart, LightChart } from "@/components/dashboard/charts";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";

const ranges: { label: string; value: ChartRange }[] = [
  { label: "1 Hour", value: "1h" },
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

export default function DashboardPage() {
  const { selectedDeviceId } = useDevice();
  const [range, setRange] = useState<ChartRange>("24h");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const resource = useApiResource(
    (signal) => dashboardService.get(selectedDeviceId, range, signal),
    [selectedDeviceId, range]
  );

  const handleQuickResolve = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await alertsService.resolve(alertId);
      toast.success("Alert resolved successfully.");
      resource.retry();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to resolve alert.");
    } finally {
      setResolvingId(null);
    }
  };

  if (resource.loading && !resource.data) return <PageSkeleton />;
  if (resource.error && !resource.data)
    return <ErrorState message={resource.error} retry={resource.retry} />;

  const data = resource.data;
  if (!data) return <EmptyState title="No sensor readings yet." />;

  const { latestReading: r, settings: s, device } = data;

  // Temperature status & range
  const tempRangeSpan = Math.max(s.highTemperature - s.lowTemperature, 1);
  const tempPercent = ((r.temperatureC - s.lowTemperature) / tempRangeSpan) * 100;
  const temperatureHigh = r.temperatureC > s.highTemperature;
  const temperatureLow = r.temperatureC < s.lowTemperature;
  const tempStatus = temperatureHigh
    ? "High Temp Alert"
    : temperatureLow
    ? "Low Temp Alert"
    : "Comfortable";

  // Humidity status & range
  const humRangeSpan = Math.max(s.highHumidity - s.lowHumidity, 1);
  const humPercent = ((r.humidityPercent - s.lowHumidity) / humRangeSpan) * 100;
  const humidityNormal =
    r.humidityPercent >= s.lowHumidity && r.humidityPercent <= s.highHumidity;
  const humStatus = humidityNormal
    ? "Optimal Balance"
    : r.humidityPercent < s.lowHumidity
    ? "Low Humidity"
    : "High Humidity";

  // Light status & range
  const lightRangeSpan = Math.max(s.highLight - s.lowLight, 1);
  const lightPercent = ((r.lightValue - s.lowLight) / lightRangeSpan) * 100;
  const lightStatus =
    r.lightValue < s.lowLight
      ? "Dark"
      : r.lightValue > s.highLight
      ? "Bright"
      : "Nominal";

  return (
    <div className="space-y-6">
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Environmental Overview Hub
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time IoT telemetry, threshold comfort analysis, and trend visualizations
          </p>
        </div>

        {/* Time range pill buttons */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 p-1 dark:border-white/10 dark:bg-slate-900/80">
          {ranges.map((item) => {
            const active = range === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vitality Score Ring Hub */}
      <VitalityScore reading={r} settings={s} alerts={data.alerts} />

      {/* 4 Sensor Telemetry Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SensorCard
          title="Ambient Temperature"
          value={formatNumber(r.temperatureC)}
          unit="°C"
          status={tempStatus}
          detail={`Target: ${s.lowTemperature}–${s.highTemperature} °C`}
          icon={Thermometer}
          color={temperatureHigh || temperatureLow ? "rose" : "blue"}
          rangePercent={tempPercent}
          isAlert={temperatureHigh || temperatureLow}
        />

        <SensorCard
          title="Relative Humidity"
          value={formatNumber(r.humidityPercent, 0)}
          unit="%"
          status={humStatus}
          detail={`Target: ${s.lowHumidity}–${s.highHumidity}%`}
          icon={Droplets}
          color={humidityNormal ? "cyan" : "amber"}
          rangePercent={humPercent}
          isAlert={!humidityNormal}
        />

        <SensorCard
          title="Ambient Light"
          value={formatNumber(r.lightValue, 0)}
          unit="raw"
          status={lightStatus}
          detail={`Threshold: ${s.lowLight}–${s.highLight}`}
          icon={Lightbulb}
          color="amber"
          rangePercent={lightPercent}
        />

        <SensorCard
          title="Motion Detection"
          value={r.motionDetected ? "Detected" : "Clear"}
          status={`${data.motionEventsToday} events today`}
          detail="PIR Sensor Active"
          icon={Radio}
          color={r.motionDetected ? "rose" : "violet"}
          isAlert={r.motionDetected}
        />
      </div>

      {/* Interactive Charts Suite */}
      {data.chartReadings.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <EnvironmentChart
            data={data.chartReadings}
            longRange={range === "7d" || range === "30d"}
          />
          <LightChart
            data={data.chartReadings}
            longRange={range === "7d" || range === "30d"}
          />
        </div>
      ) : (
        <EmptyState title="No historical readings yet." />
      )}

      {/* Bottom 3 Information Panels */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Device Status & Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Node Hardware Status</CardTitle>
            <CardDescription>
              Connectivity and firmware diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-sm">
            <InfoRow label="Node Identifier" value={device.name || device.id} />
            <InfoRow
              label="Connection State"
              value={device.status === "online" ? "Online" : "Offline"}
              badge={
                <Badge
                  variant={device.status === "online" ? "success" : "neutral"}
                  dot
                >
                  {device.status}
                </Badge>
              }
            />
            <InfoRow label="Physical Location" value={device.location} />
            <InfoRow
              label="Last Telemetry Sync"
              value={relativeTime(device.lastSeen)}
            />
            <InfoRow
              label="Wi-Fi Signal Strength"
              value={`${device.wifiRssi} dBm`}
              badge={
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <Wifi className="h-3.5 w-3.5" />
                  {rssiQuality(device.wifiRssi)}
                </span>
              }
            />
          </CardContent>
        </Card>

        {/* Active Alerts Watch */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Active Incident Watch</CardTitle>
              <Badge variant="warning">
                {data.alerts.filter((a) => a.status === "active").length} active
              </Badge>
            </div>
            <CardDescription>
              Unresolved environmental threshold breaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.alerts.filter((a) => a.status === "active").length ? (
              <div className="space-y-3">
                {data.alerts
                  .filter((a) => a.status === "active")
                  .slice(0, 4)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-50/50 p-3 dark:border-amber-500/20 dark:bg-amber-950/20"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-amber-950 dark:text-amber-200 truncate">
                          {a.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {a.value}
                          {a.unit ? ` ${a.unit}` : ""} · {relativeTime(a.triggeredAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={resolvingId === a.id}
                        onClick={() => handleQuickResolve(a.id)}
                        className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 shrink-0"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/80 mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  All Systems Clear
                </p>
                <p className="text-xs text-slate-400">No active alerts triggered.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity Stream</CardTitle>
            <CardDescription>
              Chronological log of alerts & motion events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.alerts.length ||
            data.recentReadings.some((x) => x.motionDetected) ? (
              <div className="space-y-3.5">
                {[
                  ...data.alerts.slice(0, 3).map((a) => ({
                    id: a.id,
                    text: a.title,
                    at: a.triggeredAt,
                    type: "alert" as const,
                  })),
                  ...data.recentReadings
                    .filter((x) => x.motionDetected)
                    .slice(0, 3)
                    .map((x) => ({
                      id: x.id,
                      text: "PIR Motion Detected in zone",
                      at: x.timestamp,
                      type: "motion" as const,
                    })),
                ]
                  .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-xs">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          item.type === "alert"
                            ? "bg-amber-500 shadow-xs shadow-amber-500"
                            : "bg-cyan-500 shadow-xs shadow-cyan-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.text}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {relativeTime(item.at)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Recent Activity
                </p>
                <p className="text-xs text-slate-400">Idle state monitored.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-0 dark:border-white/5">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
        {badge || value}
      </div>
    </div>
  );
}
