import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function rssiQuality(rssi: number) {
  if (rssi >= -50) return "Excellent";
  if (rssi >= -60) return "Good";
  if (rssi >= -70) return "Fair";
  return "Weak";
}

export function isTelemetryFresh(timestamp: string, publishIntervalSeconds = 5) {
  const age = Date.now() - new Date(timestamp).getTime();
  return Number.isFinite(age) && age <= Math.max(15, publishIntervalSeconds * 2) * 1000;
}
