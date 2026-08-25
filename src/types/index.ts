export interface ApiResponse<T> { success: boolean; data: T; message?: string }
export type DeviceStatus = "online" | "offline";
export type AlertStatus = "active" | "resolved";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = "temperature" | "humidity" | "light" | "device" | "motion";

export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  lightValue: number;
  motionDetected: boolean;
  wifiRssi: number;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  lastSeen: string;
  wifiRssi: number;
  latestReading?: SensorReading;
}

export interface Alert {
  id: string;
  deviceId: string;
  title: string;
  type: AlertType;
  severity: AlertSeverity;
  value: number | string;
  unit?: string;
  status: AlertStatus;
  triggeredAt: string;
  resolvedAt?: string | null;
}

export interface DeviceSettings {
  highTemperature: number;
  lowTemperature: number;
  highHumidity: number;
  lowHumidity: number;
  lowLight: number;
  highLight: number;
  samplingIntervalSeconds: number;
  publishIntervalSeconds: number;
}

export interface ChartReading {
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  lightValue: number;
  isForecast?: boolean;
}

export interface MetricStats { average: number; minimum: number; maximum: number }
export interface Analytics {
  range: string;
  temperature: MetricStats;
  humidity: MetricStats;
  light: MetricStats;
  totalMotionEvents: number;
  readings: ChartReading[];
}

export interface ComfortAnalysis {
  feelsLikeC: number;
  dewPointC: number;
  comfortStatus: "Optimal Comfort" | "Slightly Humid" | "Warm & Stuffy" | "Cool & Dry" | "Heat Stress Risk";
  comfortScore: number;
  summary: string;
}

export interface MoldRiskAnalysis {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  condensationRisk: boolean;
  deltaToDewPoint: number;
  recommendation: string;
}

export interface ForecastTrajectory {
  currentTempC: number;
  currentHumidity: number;
  tempTrend: "rising" | "falling" | "stable";
  tempVelocityPerHour: number;
  humidityTrend: "rising" | "falling" | "stable";
  humidityVelocityPerHour: number;
  forecast1h: {
    temperatureC: number;
    humidityPercent: number;
  };
  forecast3h: {
    temperatureC: number;
    humidityPercent: number;
  };
  timeToThreshold?: {
    metric: "temperature" | "humidity";
    thresholdType: "HIGH" | "LOW";
    thresholdValue: number;
    estimatedMinutes: number;
    message: string;
  };
}

export interface HourlyOccupancy {
  hour: number;
  label: string;
  eventCount: number;
  occupancyIntensity: number;
}

export interface OccupancyProfile {
  currentPresence: "Someone in the room" | "Room Empty";
  isOccupied: boolean;
  totalVisitsToday: number;
  peakHourLabel: string;
  hourlyDistribution: HourlyOccupancy[];
}

export interface EnergyEfficiencyAudit {
  illuminatedHours: number;
  occupiedIlluminatedHours: number;
  wastedLightingHours: number;
  efficiencyScore: number;
  alertMessage?: string;
}

export interface PredictiveInsights {
  comfort: ComfortAnalysis;
  moldRisk: MoldRiskAnalysis;
  forecast: ForecastTrajectory;
  occupancy: OccupancyProfile;
  energy: EnergyEfficiencyAudit;
  smartRecommendations: string[];
}

export interface DashboardSummary {
  device: Device;
  latestReading: SensorReading;
  settings: DeviceSettings;
  alerts: Alert[];
  chartReadings: ChartReading[];
  recentReadings: SensorReading[];
  motionEventsToday: number;
  environmentStatus?: "normal" | "attention";
  predictions?: PredictiveInsights;
}

export type ChartRange = "1h" | "24h" | "7d" | "30d";
export type AnalyticsRange = "24h" | "7d" | "30d";

