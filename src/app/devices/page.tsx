"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  MapPin,
  Search,
  Settings,
  Wifi,
} from "lucide-react";
import { useApiResource } from "@/hooks/use-api-resource";
import { deviceService } from "@/services/device.service";
import { formatNumber, relativeTime } from "@/lib/formatters";
import { rssiQuality } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, Input } from "@/components/ui";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const resource = useApiResource((signal) => deviceService.list(signal), []);

  if (resource.loading) return <PageSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} retry={resource.retry} />;

  const devices = resource.data || [];
  const filteredDevices = devices.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            IoT Node Fleet
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registered microcontroller nodes, hardware telemetry, and device diagnostics
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search devices by name, ID, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Fleet Grid */}
      {filteredDevices.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map((device) => {
            const isOnline = device.status === "online";

            return (
              <Card
                key={device.id}
                className="group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                {/* Top ambient status accent */}
                <div
                  className={`h-1.5 w-full ${
                    isOnline
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                      : "bg-slate-300 dark:bg-slate-800"
                  }`}
                />

                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                        isOnline
                          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                          : "border-slate-200 bg-slate-100 text-slate-400 dark:border-white/5 dark:bg-slate-800"
                      }`}
                    >
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {device.name || device.id}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        ID: {device.id}
                      </p>
                    </div>
                  </div>

                  <Badge variant={isOnline ? "success" : "neutral"} dot pulse={isOnline}>
                    {device.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location & Wi-Fi */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{device.location || "Unspecified Location"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>
                        {device.wifiRssi} dBm · {rssiQuality(device.wifiRssi)}
                      </span>
                    </div>
                  </div>

                  {/* Latest Telemetry Preview Pill */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/60 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Temperature
                      </span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        {device.latestReading
                          ? `${formatNumber(device.latestReading.temperatureC)} °C`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Last Active
                      </span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-xs">
                        {relativeTime(device.lastSeen)}
                      </span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/devices/${encodeURIComponent(device.id)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                    >
                      <span>Inspect Diagnostics</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href="/settings"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                      title="Adjust Thresholds"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No devices found"
          description="No registered nodes matched the search query."
        />
      )}
    </div>
  );
}
