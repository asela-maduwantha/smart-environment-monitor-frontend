"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Droplets,
  Lightbulb,
  Pause,
  Play,
  RefreshCw,
  Thermometer,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { useDevice } from "@/context/device-context";
import { readingsService } from "@/services/readings.service";
import { settingsService } from "@/services/settings.service";
import { isTelemetryFresh, rssiQuality } from "@/lib/utils";
import { fullTimestamp, formatNumber } from "@/lib/formatters";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { ErrorState, PageSkeleton } from "@/components/common/states";
import { TelemetryGauge } from "@/components/live/telemetry-gauge";
import { RadarVisualizer } from "@/components/live/radar-visualizer";
import type { DeviceSettings, SensorReading } from "@/types";

export default function LivePage() {
  const { selectedDeviceId, devices } = useDevice();
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [packetHistory, setPacketHistory] = useState<SensorReading[]>([]);
  const [settings, setSettings] = useState<DeviceSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [packetCount, setPacketCount] = useState(0);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const latest = await readingsService.latest(selectedDeviceId, signal);
        setReading(latest);
        setPacketHistory((prev) => {
          if (prev.length > 0 && prev[0].id === latest.id) return prev;
          return [latest, ...prev.slice(0, 14)];
        });
        setPacketCount((c) => c + 1);
        setError(null);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setError(
            e instanceof Error ? e.message : "Unable to reach monitoring server."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedDeviceId]
  );

  // Initial load
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      load(controller.signal),
      settingsService
        .get(selectedDeviceId, controller.signal)
        .then(setSettings)
        .catch(() => null),
    ]);
    return () => controller.abort();
  }, [selectedDeviceId, load]);

  // 1-second countdown ticker & 5-second polling interval
  useEffect(() => {
    if (isPaused) return;

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void load();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [isPaused, load]);

  const device = devices.find((d) => d.id === selectedDeviceId);
  const state = useMemo(
    () =>
      !device || device.status === "offline"
        ? "Offline"
        : error
        ? "Offline"
        : reading && isTelemetryFresh(reading.timestamp, settings?.publishIntervalSeconds)
        ? "Live Streaming"
        : "Connection Delayed",
    [device, error, reading, settings]
  );

  if ((loading && !reading) || (reading && reading.deviceId !== selectedDeviceId)) {
    return <PageSkeleton />;
  }

  if (!reading) {
    return (
      <ErrorState
        message={error || "No sensor readings available for this device."}
        retry={() => void load()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Mission Control Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Live Mission Control
            </h2>
            <Badge
              variant={
                state === "Live Streaming"
                  ? "success"
                  : state === "Offline"
                  ? "critical"
                  : "warning"
              }
              dot
              pulse={state === "Live Streaming"}
            >
              {state}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            High-frequency telemetry stream synced with ESP32 node via MQTT
          </p>
        </div>

        {/* Polling Stream Controls */}
        <div className="flex items-center gap-2.5">
          {/* 5-second Countdown Indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-slate-900/80 text-xs font-mono">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400">Next sync:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {isPaused ? "Paused" : `${countdown}s`}
            </span>
          </div>

          {/* Pause / Resume Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPaused(!isPaused);
              toast.info(isPaused ? "Resumed live telemetry stream." : "Paused live streaming.");
            }}
            className="h-9 px-3 text-xs"
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </Button>

          {/* Manual Ping / Refresh Now */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void load();
              setCountdown(5);
              toast.success("Telemetry refreshed manually.");
            }}
            className="h-9 px-3 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Now</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
          Showing last known telemetry payload. Server stream temporarily interrupted.
        </div>
      )}

      {/* 4 Arc Gauges */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TelemetryGauge
          title="Ambient Temperature"
          value={Number(formatNumber(reading.temperatureC))}
          min={settings ? settings.lowTemperature - 10 : 0}
          max={settings ? settings.highTemperature + 10 : 50}
          unit="°C"
          color="blue"
          statusText={
            reading.temperatureC > (settings?.highTemperature || 30)
              ? "High"
              : reading.temperatureC < (settings?.lowTemperature || 18)
              ? "Low"
              : "Comfortable"
          }
          icon={<Thermometer className="h-4 w-4" />}
        />

        <TelemetryGauge
          title="Relative Humidity"
          value={Math.round(reading.humidityPercent)}
          min={0}
          max={100}
          unit="%"
          color="cyan"
          statusText={
            reading.humidityPercent > (settings?.highHumidity || 70)
              ? "Humid"
              : reading.humidityPercent < (settings?.lowHumidity || 30)
              ? "Dry"
              : "Balanced"
          }
          icon={<Droplets className="h-4 w-4" />}
        />

        <TelemetryGauge
          title="Room Illumination (LDR)"
          value={reading.lightValue >= 1 ? 100 : 0}
          min={0}
          max={100}
          unit="%"
          color="amber"
          statusText={reading.lightValue >= 1 ? "Lights ON" : "Lights OFF"}
          icon={<Lightbulb className="h-4 w-4" />}
        />

        <TelemetryGauge
          title="Wi-Fi Signal (RSSI)"
          value={reading.wifiRssi}
          min={-100}
          max={-30}
          unit="dBm"
          color="emerald"
          statusText={rssiQuality(reading.wifiRssi)}
          icon={<Wifi className="h-4 w-4" />}
        />
      </div>

      {/* Radar Visualizer for Presence */}
      <RadarVisualizer
        motionDetected={reading.motionDetected}
        totalEventsToday={packetHistory.filter((p) => p.motionDetected).length}
      />

      {/* Interactive Live Presence & Ingestion Timeline Stream */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Live Presence & Telemetry Event Stream</CardTitle>
            <CardDescription>
              Real-time chronological events and telemetry packets captured from {selectedDeviceId}
            </CardDescription>
          </div>
          <Badge variant="glow">
            {packetCount} packets synchronized
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {packetHistory.map((packet, index) => {
              const prev = packetHistory[index + 1];
              const tempDelta = prev
                ? packet.temperatureC - prev.temperatureC
                : 0;
              const isOccupiedPacket = packet.motionDetected;
              const isLightOnPacket = packet.lightValue >= 1;

              return (
                <div
                  key={packet.id + index}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                    index === 0
                      ? "border-cyan-500/30 bg-cyan-500/5 shadow-xs dark:border-cyan-500/20 dark:bg-cyan-500/5"
                      : "border-slate-200/70 bg-white/70 hover:bg-slate-50/80 dark:border-white/5 dark:bg-slate-900/60 dark:hover:bg-white/5"
                  }`}
                >
                  {/* Left: Event Details */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        isOccupiedPacket
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isOccupiedPacket ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {isOccupiedPacket
                            ? "Someone entered / Movement detected in room"
                            : isLightOnPacket
                            ? "Room illuminated · Lights Active"
                            : "Ambient monitoring · Space Vacant"}
                        </p>
                        {index === 0 && (
                          <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            Latest Ingestion
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {fullTimestamp(packet.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Meaningful Telemetry Badges */}
                  <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                    {/* Temperature Pill */}
                    <div className="flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-50/50 px-2.5 py-1 text-xs font-mono font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      <Thermometer className="h-3 w-3" />
                      <span>{formatNumber(packet.temperatureC)}°C</span>
                      {tempDelta > 0.05 ? (
                        <ArrowUp className="h-3 w-3 text-rose-500" />
                      ) : tempDelta < -0.05 ? (
                        <ArrowDown className="h-3 w-3 text-blue-500" />
                      ) : null}
                    </div>

                    {/* Humidity Pill */}
                    <div className="flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-50/50 px-2.5 py-1 text-xs font-mono font-bold text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400">
                      <Droplets className="h-3 w-3" />
                      <span>{formatNumber(packet.humidityPercent, 0)}%</span>
                    </div>

                    {/* Light State */}
                    <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-50/50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
                      <Lightbulb className="h-3 w-3" />
                      <span>{isLightOnPacket ? "Light ON" : "Dim"}</span>
                    </div>

                    {/* Presence State */}
                    <div
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        isOccupiedPacket
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <span>{isOccupiedPacket ? "Occupied" : "Vacant"}</span>
                    </div>

                    {/* WiFi Signal */}
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-mono text-slate-500 dark:border-white/5 dark:text-slate-400">
                      <Wifi className="h-3 w-3 text-emerald-500" />
                      <span>{packet.wifiRssi} dBm</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
