import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function relativeTime(value?: string) {
  if (!value) return "Never";
  const date = parseISO(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "Unknown";
}

export function fullTimestamp(value?: string) {
  if (!value) return "Not available";
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy, h:mm a") : "Unknown";
}

export function chartTime(value: string, longRange = false) {
  const date = parseISO(value);
  if (!isValid(date)) return "";
  return format(date, longRange ? "MMM d" : "h:mm a");
}

export function formatNumber(value: number, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}
