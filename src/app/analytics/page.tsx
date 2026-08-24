"use client";

import { useState } from "react";
import {
  Download,
  Droplets,
  Lightbulb,
  Radio,
  Thermometer,
} from "lucide-react";
import { toast } from "sonner";
import { useDevice } from "@/context/device-context";
import { useApiResource } from "@/hooks/use-api-resource";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsRange, MetricStats } from "@/types";
import { Button, Card, CardContent } from "@/components/ui";
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

    const headers = ["Timestamp", "Temperature_C", "Humidity_Percent", "Light_Raw"];
    const rows = resource.data.readings.map((r) => [
      r.timestamp,
      r.temperatureC,
      r.humidityPercent,
      r.lightValue,
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

  return (
    <div className="space-y-6">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Environmental Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Statistical distributions, multi-day averages, and telemetry trend analysis
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
          title="Light Intensity"
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
                  Motion Frequency
                </p>
                <p className="mt-3 text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  {data.totalMotionEvents}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Radio className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Events in {range}
              </span>
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                Active Detection
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trend Charts */}
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
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
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
