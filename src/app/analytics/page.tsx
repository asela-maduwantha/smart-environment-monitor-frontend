"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Download,
  Droplets,
  Flame,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  UserCheck,
  UserX,
  Wind,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useDevice } from "@/context/device-context";
import { useApiResource } from "@/hooks/use-api-resource";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsRange, MetricStats } from "@/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { EnvironmentChart, LightChart } from "@/components/dashboard/charts";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";
import { formatNumber } from "@/lib/formatters";

const ranges: { label: string; value: AnalyticsRange }[] = [
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

export default function AnalyticsPage() {
  const { selectedDeviceId } = useDevice();
  const [range, setRange] = useState<AnalyticsRange>("24h");

  const resource = useApiResource(
    (signal) => analyticsService.get(selectedDeviceId, range, signal),
    [selectedDeviceId, range]
  );

  const exportCSV = () => {
    if (!resource.data || !resource.data.readings.length) {
      toast.error("No readings available to export.");
      return;
    }

    const headers = ["Timestamp", "Temperature_C", "Humidity_Percent", "Light_Raw", "Is_Forecast"];
    const rows = resource.data.readings.map((r) => [
      r.timestamp,
      r.temperatureC,
      r.humidityPercent,
      r.lightValue,
      r.isForecast ? "YES" : "NO",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      `download`,
      `environment_analytics_${selectedDeviceId}_${range}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Analytics CSV exported successfully.");
  };

  if (resource.loading && !resource.data) return <PageSkeleton />;
  if (resource.error && !resource.data)
    return <ErrorState message={resource.error} retry={resource.retry} />;

  const data = resource.data;
  if (!data) return <EmptyState title="No analytics available yet." />;

  const pred = data.predictions;

  return (
    <div className="space-y-6">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Predictive Analytics & Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Multi-hour trend forecasting, thermal comfort indices, mold risk assessment, and occupancy patterns
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-white/10 dark:bg-slate-900/80">
            {ranges.map((r) => {
              const active = range === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Predictive Intelligence Suite Cards */}
      {pred && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* 1-Hour Forecast Card */}
          <Card className="border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  +1 Hour Forecast
                </p>
                <Badge variant="info">
                  {pred.forecast.tempTrend === "rising" ? "Rising Trend" : pred.forecast.tempTrend === "falling" ? "Falling Trend" : "Steady"}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {pred.forecast.forecast1h.temperatureC}°C
                </span>
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  / {pred.forecast.forecast1h.humidityPercent}% RH
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Rate: {pred.forecast.tempVelocityPerHour > 0 ? "+" : ""}{pred.forecast.tempVelocityPerHour}°C/hr · {pred.forecast.humidityVelocityPerHour > 0 ? "+" : ""}{pred.forecast.humidityVelocityPerHour}% RH/hr
              </p>

              {pred.forecast.timeToThreshold && (
                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-50/50 p-2 text-[11px] text-amber-900 dark:text-amber-200">
                  ⚠️ {pred.forecast.timeToThreshold.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* +3 Hours Forecast Card */}
          <Card className="border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  +3 Hours Projection
                </p>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Damped Trend
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {pred.forecast.forecast3h.temperatureC}°C
                </span>
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  / {pred.forecast.forecast3h.humidityPercent}% RH
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Predictive physics regression based on 30-sample sliding window
              </p>
            </CardContent>
          </Card>

          {/* Thermal Comfort & Feels Like */}
          <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Wind className="h-4 w-4" />
                  Apparent &quot;Feels Like&quot;
                </p>
                <Badge variant={pred.comfort.comfortStatus === "Optimal Comfort" ? "success" : "warning"}>
                  {pred.comfort.comfortStatus}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {pred.comfort.feelsLikeC}°C
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Dew Point: {pred.comfort.dewPointC}°C)
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {pred.comfort.summary}
              </p>
            </CardContent>
          </Card>

          {/* Mold & Moisture Hazard */}
          <Card className="border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Mold Risk Index
                </p>
                <Badge variant={pred.moldRisk.riskLevel === "LOW" ? "success" : pred.moldRisk.riskLevel === "MODERATE" ? "warning" : "critical"}>
                  {pred.moldRisk.riskLevel} Risk
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {pred.moldRisk.riskScore}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {pred.moldRisk.condensationRisk ? "Condensation Warning" : "Dry Surface Margin"}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {pred.moldRisk.recommendation}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 24-Hour Room Occupancy Heatmap & Energy Efficiency Section */}
      {pred && (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* 24h Hourly Occupancy Distribution Bar Chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-cyan-500" />
                  24-Hour Room Occupancy & Activity Pattern
                </CardTitle>
                <CardDescription>
                  Hourly distribution of movement events and room visits ({pred.occupancy.totalVisitsToday} visits recorded)
                </CardDescription>
              </div>
              <Badge variant="glow">
                Peak: {pred.occupancy.peakHourLabel}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Hourly Activity Bar Graph */}
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-36 pt-4 border-b border-slate-100 dark:border-white/5">
                {pred.occupancy.hourlyDistribution.map((item) => (
                  <div
                    key={item.hour}
                    className="flex flex-col items-center gap-1 group relative h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                      <span>{item.label}: {item.eventCount} visits</span>
                    </div>
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all ${
                        item.eventCount > 0
                          ? item.occupancyIntensity > 60
                            ? "bg-cyan-500 dark:bg-cyan-400"
                            : "bg-blue-500/70 dark:bg-cyan-600/70"
                          : "bg-slate-200/50 dark:bg-slate-800/50 h-1.5"
                      }`}
                      style={{
                        height: item.eventCount > 0 ? `${Math.max(12, item.occupancyIntensity)}%` : "6px",
                      }}
                    />
                    <span className="text-[9px] font-mono text-slate-400 truncate hidden sm:block">
                      {item.hour % 3 === 0 ? String(item.hour).padStart(2, "0") : ""}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <span>Active Room Presence Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Live Status:</span>
                  <Badge variant={pred.occupancy.isOccupied ? "success" : "neutral"} dot>
                    {pred.occupancy.currentPresence}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy & Lighting Efficiency Auditor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base">Lighting & Energy Audit</CardTitle>
              </div>
              <CardDescription>
                Illumination efficiency vs room presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Lighting Efficiency Score</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {pred.energy.efficiencyScore}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${pred.energy.efficiencyScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-white/5">
                  <span className="text-slate-500">Total Hours Illuminated:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {pred.energy.illuminatedHours} hrs
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-white/5">
                  <span className="text-slate-500">Occupied & Lit:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {pred.energy.occupiedIlluminatedHours} hrs
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-white/5">
                  <span className="text-slate-500">Lit while Room Empty:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {pred.energy.wastedLightingHours} hrs
                  </span>
                </div>
              </div>

              {pred.energy.alertMessage ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 p-2.5 text-xs text-amber-900 dark:text-amber-200">
                  💡 {pred.energy.alertMessage}
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/50 p-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                  ✓ Efficient lighting utilization — no unnecessary illumination detected.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4 Stat Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Ambient Temperature"
          stats={data.temperature}
          unit="°C"
          icon={<Thermometer className="h-5 w-5" />}
          color="blue"
        />

        <StatsCard
          title="Relative Humidity"
          stats={data.humidity}
          unit="%"
          icon={<Droplets className="h-5 w-5" />}
          color="cyan"
        />

        <StatsCard
          title="Illumination Intensity"
          stats={data.light}
          unit="raw"
          icon={<Lightbulb className="h-5 w-5" />}
          color="amber"
        />

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Room Presence Visits
                </p>
                <p className="mt-3 text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  {data.totalMotionEvents}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Events in {range}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {pred?.occupancy.currentPresence ?? "Active Monitor"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trend Charts with Forecast Extension */}
      {data.readings.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <EnvironmentChart
            data={data.readings}
            longRange={range !== "24h"}
          />
          <LightChart
            data={data.readings}
            longRange={range !== "24h"}
          />
        </div>
      ) : (
        <EmptyState title="No sensor readings available for this period." />
      )}
    </div>
  );
}

function StatsCard({
  title,
  stats,
  unit,
  icon,
  color,
}: {
  title: string;
  stats: MetricStats;
  unit: string;
  icon: React.ReactNode;
  color: "blue" | "cyan" | "amber";
}) {
  const colors = {
    blue: "border-blue-500/20 bg-blue-50/10 text-blue-600 dark:text-blue-400",
    cyan: "border-cyan-500/20 bg-cyan-50/10 text-cyan-600 dark:text-cyan-400",
    amber: "border-amber-500/20 bg-amber-50/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${colors[color]}`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50/70 p-3 dark:bg-slate-900/50">
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Average
            </p>
            <p className="mt-0.5 text-sm font-bold font-mono text-slate-900 dark:text-white">
              {formatNumber(stats.average)}
              <span className="text-[10px] text-slate-400 font-sans"> {unit}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Minimum
            </p>
            <p className="mt-0.5 text-sm font-bold font-mono text-slate-900 dark:text-white">
              {formatNumber(stats.minimum)}
              <span className="text-[10px] text-slate-400 font-sans"> {unit}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Maximum
            </p>
            <p className="mt-0.5 text-sm font-bold font-mono text-slate-900 dark:text-white">
              {formatNumber(stats.maximum)}
              <span className="text-[10px] text-slate-400 font-sans"> {unit}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
