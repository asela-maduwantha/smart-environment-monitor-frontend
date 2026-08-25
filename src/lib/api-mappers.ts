import type { Alert, Analytics, AnalyticsRange, ChartReading, Device, DeviceSettings, SensorReading } from "@/types";

type RawReading = {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  light: number;
  motion: boolean;
  motionCount?: number;
  wifiSignal: number;
  recordedAt: string;
};

type RawDevice = {
  id: string;
  deviceId: string;
  name: string;
  location: string;
  status: string;
  lastSeenAt: string;
  latestReading?: RawReading | null;
};

type RawAlert = {
  id: string;
  deviceId: string;
  type: string;
  severity: string;
  message: string;
  value: number | string | null;
  status: string;
  triggeredAt: string;
  resolvedAt?: string | null;
};

type RawChartReading = {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
  isForecast?: boolean;
};
type RawAnalytics = {
  temperature: Analytics["temperature"];
  humidity: Analytics["humidity"];
  light: Analytics["light"];
  motion: { events: number };
};

export function mapReading(reading: RawReading): SensorReading {
  return {
    id: reading.id,
    deviceId: reading.deviceId,
    timestamp: reading.recordedAt,
    temperatureC: reading.temperature,
    humidityPercent: reading.humidity,
    lightValue: reading.light,
    motionDetected: reading.motion,
    wifiRssi: reading.wifiSignal,
  };
}

export function mapDevice(device: RawDevice): Device {
  return {
    id: device.deviceId,
    name: device.name,
    location: device.location,
    status: device.status.toLowerCase() === "online" ? "online" : "offline",
    lastSeen: device.lastSeenAt,
    wifiRssi: device.latestReading?.wifiSignal ?? -100,
    latestReading: device.latestReading ? mapReading(device.latestReading) : undefined,
  };
}

export function mapAlert(alert: RawAlert): Alert {
  const supportedTypes = ["temperature", "humidity", "light", "device", "motion"] as const;
  const normalizedType = alert.type.toLowerCase().split("_")[0];
  return {
    id: alert.id,
    deviceId: alert.deviceId,
    title: alert.message || alert.type.replaceAll("_", " "),
    type: supportedTypes.includes(normalizedType as (typeof supportedTypes)[number]) ? normalizedType as Alert["type"] : "device",
    severity: alert.severity.toLowerCase() === "critical" ? "critical" : alert.severity.toLowerCase() === "warning" ? "warning" : "info",
    value: alert.value ?? "—",
    status: alert.status.toLowerCase() === "resolved" ? "resolved" : "active",
    triggeredAt: alert.triggeredAt,
    resolvedAt: alert.resolvedAt,
  };
}

export function mapChartReading(reading: RawChartReading): ChartReading {
  return {
    timestamp: reading.timestamp,
    temperatureC: reading.temperature,
    humidityPercent: reading.humidity,
    lightValue: reading.light,
    isForecast: reading.isForecast ?? false,
  };
}

export function mapAnalytics(raw: RawAnalytics, range: AnalyticsRange, readings: ChartReading[]): Analytics {
  return { range, temperature: raw.temperature, humidity: raw.humidity, light: raw.light, totalMotionEvents: raw.motion.events, readings };
}

export type { RawAlert, RawAnalytics, RawChartReading, RawDevice, RawReading };
export type RawSettings = DeviceSettings & { id?: string; deviceId?: string; createdAt?: string; updatedAt?: string };

