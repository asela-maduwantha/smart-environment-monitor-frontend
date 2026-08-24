"use client";

import { useMemo, useState } from "react";
import {
  Building,
  Check,
  Flame,
  Leaf,
  Radio,
  RotateCcw,
  Save,
  Server,
  Sparkles,
  Warehouse,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useDevice } from "@/context/device-context";
import { useApiResource } from "@/hooks/use-api-resource";
import { settingsService } from "@/services/settings.service";
import { validateSettings, type SettingsErrors } from "@/lib/settings-validation";
import type { DeviceSettings } from "@/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input } from "@/components/ui";
import { ErrorState, PageSkeleton } from "@/components/common/states";

const PRESETS: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    values: DeviceSettings;
  }
> = {
  office: {
    name: "Office Workplace",
    icon: Building,
    description: "Standard human comfort range (20–24°C, 35–60% RH)",
    values: {
      highTemperature: 24,
      lowTemperature: 20,
      highHumidity: 60,
      lowHumidity: 35,
      lowLight: 100,
      highLight: 800,
      samplingIntervalSeconds: 5,
      publishIntervalSeconds: 10,
    },
  },
  server_room: {
    name: "Server Room / Lab",
    icon: Server,
    description: "High-frequency precision cooling (18–22°C, 40–55% RH)",
    values: {
      highTemperature: 22,
      lowTemperature: 18,
      highHumidity: 55,
      lowHumidity: 40,
      lowLight: 50,
      highLight: 600,
      samplingIntervalSeconds: 2,
      publishIntervalSeconds: 5,
    },
  },
  greenhouse: {
    name: "Greenhouse / Plants",
    icon: Leaf,
    description: "High humidity and sun tolerance (18–28°C, 50–80% RH)",
    values: {
      highTemperature: 28,
      lowTemperature: 18,
      highHumidity: 80,
      lowHumidity: 50,
      lowLight: 200,
      highLight: 950,
      samplingIntervalSeconds: 10,
      publishIntervalSeconds: 20,
    },
  },
  warehouse: {
    name: "Warehouse Storage",
    icon: Warehouse,
    description: "Wide industrial tolerance with power saving intervals",
    values: {
      highTemperature: 30,
      lowTemperature: 10,
      highHumidity: 70,
      lowHumidity: 20,
      lowLight: 20,
      highLight: 900,
      samplingIntervalSeconds: 15,
      publishIntervalSeconds: 30,
    },
  },
};

export default function SettingsPage() {
  const { selectedDeviceId } = useDevice();
  const resource = useApiResource(
    (signal) => settingsService.get(selectedDeviceId, signal),
    [selectedDeviceId]
  );

  if (resource.loading) return <PageSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} retry={resource.retry} />;
  if (!resource.data) return null;

  return (
    <SettingsStudio
      key={selectedDeviceId}
      deviceId={selectedDeviceId}
      initial={resource.data}
    />
  );
}

function SettingsStudio({
  deviceId,
  initial,
}: {
  deviceId: string;
  initial: DeviceSettings;
}) {
  const [values, setValues] = useState<DeviceSettings>(initial);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setValues(preset.values);
    setActivePreset(key);
    setErrors({});
    toast.success(`Applied ${preset.name} preset.`);
  };

  const handleFieldChange = (key: keyof DeviceSettings, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setActivePreset(null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateSettings(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      toast.error("Please fix threshold validation errors before saving.");
      return;
    }

    setSaving(true);
    try {
      const result = await settingsService.update(deviceId, values);
      setValues(result);
      toast.success(
        `Device thresholds saved and queued for MQTT broadcast to ${deviceId}.`
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unable to save device configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  // Estimated daily telemetry volume
  const packetsPerDay = Math.round(
    86400 / Math.max(values.publishIntervalSeconds, 1)
  );

  // MQTT JSON Payload preview
  const mqttPayload = useMemo(() => {
    return JSON.stringify(
      {
        deviceId,
        action: "CONFIG_UPDATE",
        thresholds: {
          temp: { min: values.lowTemperature, max: values.highTemperature },
          humidity: { min: values.lowHumidity, max: values.highHumidity },
          light: { min: values.lowLight, max: values.highLight },
        },
        intervals: {
          sampling_sec: values.samplingIntervalSeconds,
          publish_sec: values.publishIntervalSeconds,
        },
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }, [deviceId, values]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Threshold Studio & Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure safety thresholds, telemetry sampling intervals, and MQTT broadcast for {deviceId}
          </p>
        </div>

        <Badge variant="glow" dot>
          Synchronized with Node: {deviceId}
        </Badge>
      </div>

      {/* 1-Click Environment Presets */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          1-Click Environment Presets
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const Icon = preset.icon;
            const isSelected = activePreset === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/10 dark:border-cyan-400"
                    : "border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-slate-900/60 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-slate-950">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  {preset.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Left 2 Columns: Threshold Configuration Controls */}
          <div className="space-y-6 xl:col-span-2">
            {/* Temperature Thresholds */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-blue-500" />
                  <CardTitle>Temperature Thresholds (°C)</CardTitle>
                </div>
                <CardDescription>
                  Define minimum and maximum operational temperature boundaries
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Visual Safe-Zone Bar */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-900/50">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                    <span>Low Limit: {values.lowTemperature}°C</span>
                    <span className="font-semibold text-emerald-500">
                      Safe Zone: {values.highTemperature - values.lowTemperature}°C Span
                    </span>
                    <span>High Limit: {values.highTemperature}°C</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-blue-500/20 overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: "25%" }} />
                    <div className="h-full bg-emerald-500" style={{ width: "50%" }} />
                    <div className="h-full bg-rose-500" style={{ width: "25%" }} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Low Temperature (°C)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={values.lowTemperature}
                      onChange={(e) =>
                        handleFieldChange("lowTemperature", Number(e.target.value))
                      }
                      aria-invalid={Boolean(errors.lowTemperature)}
                    />
                    {errors.lowTemperature && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {errors.lowTemperature}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      High Temperature (°C)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={values.highTemperature}
                      onChange={(e) =>
                        handleFieldChange("highTemperature", Number(e.target.value))
                      }
                      aria-invalid={Boolean(errors.highTemperature)}
                    />
                    {errors.highTemperature && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {errors.highTemperature}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Humidity Thresholds */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Relative Humidity Boundaries (%)</CardTitle>
                <CardDescription>
                  Define alarm boundaries for low and excess humidity
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Low Humidity (%)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={values.lowHumidity}
                      onChange={(e) =>
                        handleFieldChange("lowHumidity", Number(e.target.value))
                      }
                      aria-invalid={Boolean(errors.lowHumidity)}
                    />
                    {errors.lowHumidity && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {errors.lowHumidity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      High Humidity (%)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={values.highHumidity}
                      onChange={(e) =>
                        handleFieldChange("highHumidity", Number(e.target.value))
                      }
                      aria-invalid={Boolean(errors.highHumidity)}
                    />
                    {errors.highHumidity && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {errors.highHumidity}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Light & Telemetry Interval Controls */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Light Thresholds */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Light Limits (0–1023)</CardTitle>
                  <CardDescription>Raw photodiode limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Low Light (Dark)
                    </label>
                    <Input
                      type="number"
                      value={values.lowLight}
                      onChange={(e) =>
                        handleFieldChange("lowLight", Number(e.target.value))
                      }
                      aria-invalid={Boolean(errors.lowLight)}
                    />
                    {errors.lowLight && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.lowLight}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      High Light (Bright)
                    </label>
                    <Input
                      type="number"
                      value={values.highLight}
                      onChange={(e) =>
                        handleFieldChange("highLight", Number(e.target.value))
                      }
                      aria-invalid={Boolean(errors.highLight)}
                    />
                    {errors.highLight && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.highLight}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Intervals */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Device Intervals (sec)</CardTitle>
                  <CardDescription>Sampling & MQTT broadcast</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Sampling Interval (sec)
                    </label>
                    <Input
                      type="number"
                      value={values.samplingIntervalSeconds}
                      onChange={(e) =>
                        handleFieldChange(
                          "samplingIntervalSeconds",
                          Number(e.target.value)
                        )
                      }
                      aria-invalid={Boolean(errors.samplingIntervalSeconds)}
                    />
                    {errors.samplingIntervalSeconds && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.samplingIntervalSeconds}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Publish Interval (sec)
                    </label>
                    <Input
                      type="number"
                      value={values.publishIntervalSeconds}
                      onChange={(e) =>
                        handleFieldChange(
                          "publishIntervalSeconds",
                          Number(e.target.value)
                        )
                      }
                      aria-invalid={Boolean(errors.publishIntervalSeconds)}
                    />
                    {errors.publishIntervalSeconds && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.publishIntervalSeconds}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Telemetry Estimator & MQTT Preview */}
          <div className="space-y-6">
            {/* Bandwidth & Battery Profiler */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <CardTitle>Telemetry Profiler</CardTitle>
                </div>
                <CardDescription>
                  Network & battery workload estimation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-slate-900/60 font-mono">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Telemetry Rate:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      1 msg / {values.publishIntervalSeconds}s
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-200/50 dark:border-white/5">
                    <span className="text-slate-500">Daily Packet Total:</span>
                    <span className="font-bold text-cyan-500">
                      {packetsPerDay.toLocaleString()} msgs/day
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-200/50 dark:border-white/5">
                    <span className="text-slate-500">Monthly Ingestion:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(packetsPerDay * 30).toLocaleString()} msgs
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MQTT JSON Payload Preview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-500" />
                  <CardTitle>MQTT Sync Payload</CardTitle>
                </div>
                <CardDescription>
                  Broadcast schema sent to ESP32 node
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="max-h-64 overflow-y-auto rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-cyan-300 border border-cyan-500/20">
                  {mqttPayload}
                </pre>
              </CardContent>
            </Card>

            {/* Submit / Reset Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValues(initial);
                  setErrors({});
                  setActivePreset(null);
                  toast.info("Reset thresholds to last saved values.");
                }}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              <Button
                type="submit"
                variant="glow"
                loading={saving}
                className="gap-2 px-6"
              >
                <Save className="h-4 w-4" />
                <span>Save Configuration</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
