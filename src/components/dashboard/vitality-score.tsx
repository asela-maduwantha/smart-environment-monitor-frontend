"use client";

import { useMemo } from "react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { Alert, DeviceSettings, SensorReading } from "@/types";

interface VitalityScoreProps {
  reading: SensorReading;
  settings: DeviceSettings;
  alerts: Alert[];
}

export function VitalityScore({ reading, settings, alerts }: VitalityScoreProps) {
  const { score, status, statusColor, description, breakdown } = useMemo(() => {
    let tempScore = 100;
    let humScore = 100;
    let lightScore = 100;
    let alertScore = 100;

    // Temperature score (Ideal: halfway between low and high)
    const midTemp = (settings.lowTemperature + settings.highTemperature) / 2;
    const tempRange = Math.max((settings.highTemperature - settings.lowTemperature) / 2, 4);
    const tempDiff = Math.abs(reading.temperatureC - midTemp);
    tempScore = Math.max(0, Math.round(100 - (tempDiff / tempRange) * 50));

    // Humidity score (Ideal: halfway between low and high)
    const midHum = (settings.lowHumidity + settings.highHumidity) / 2;
    const humRange = Math.max((settings.highHumidity - settings.lowHumidity) / 2, 10);
    const humDiff = Math.abs(reading.humidityPercent - midHum);
    humScore = Math.max(0, Math.round(100 - (humDiff / humRange) * 50));

    // Light score
    if (reading.lightValue < settings.lowLight) {
      lightScore = 75;
    } else if (reading.lightValue > settings.highLight) {
      lightScore = 85;
    } else {
      lightScore = 100;
    }

    // Active alert penalties
    const activeAlerts = alerts.filter((a) => a.status === "active");
    const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
    const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;
    alertScore = Math.max(0, 100 - criticalCount * 35 - warningCount * 15);

    const totalScore = Math.round(
      tempScore * 0.35 + humScore * 0.35 + lightScore * 0.15 + alertScore * 0.15
    );

    let statusText = "Optimal Comfort";
    let color = "emerald";
    let desc = "All environmental parameters are within target ranges.";

    if (totalScore >= 88) {
      statusText = "Optimal Comfort";
      color = "emerald";
      desc = "Temperature, humidity, and lighting levels are well-balanced.";
    } else if (totalScore >= 70) {
      statusText = "Good Environment";
      color = "cyan";
      desc = "Environmental metrics are stable with minor fluctuations.";
    } else if (totalScore >= 50) {
      statusText = "Attention Needed";
      color = "amber";
      desc = "One or more metrics are approaching threshold limits.";
    } else {
      statusText = "Critical Threshold Breach";
      color = "rose";
      desc = "Active warnings or critical threshold violations detected.";
    }

    return {
      score: totalScore,
      status: statusText,
      statusColor: color,
      description: desc,
      breakdown: {
        temp: tempScore,
        hum: humScore,
        light: lightScore,
        alerts: alertScore,
      },
    };
  }, [reading, settings, alerts]);

  // Circumference calculation for SVG ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strokeColors = {
    emerald: { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
    cyan: { stroke: "#06b6d4", glow: "rgba(6, 182, 212, 0.4)" },
    amber: { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
    rose: { stroke: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)" },
  };

  const currentTheme = strokeColors[statusColor as keyof typeof strokeColors] || strokeColors.emerald;
  const activeAlertCount = alerts.filter((a) => a.status === "active").length;

  return (
    <Card className="overflow-hidden border border-slate-200/80 dark:border-white/10">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Score ring & status */}
          <div className="flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100">
                <defs>
                  <filter id="vitality-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={currentTheme.glow} />
                  </filter>
                </defs>
                {/* Background Track Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-200/70 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Value Ring starting at 12 o'clock */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={currentTheme.stroke}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 50 50)"
                  filter="url(#vitality-glow)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Center score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  {score}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  Index
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Environmental Vitality
                </h3>
                <Badge
                  variant={
                    statusColor === "emerald"
                      ? "success"
                      : statusColor === "cyan"
                      ? "info"
                      : statusColor === "amber"
                      ? "warning"
                      : "critical"
                  }
                  dot
                  pulse={statusColor === "rose" || statusColor === "amber"}
                >
                  {status}
                </Badge>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {description}
              </p>
            </div>
          </div>

          {/* Right: Parameter breakdown bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:min-w-[340px]">
            <MetricPill label="Temp Stability" value={`${breakdown.temp}%`} color="blue" />
            <MetricPill label="Humidity Balance" value={`${breakdown.hum}%`} color="cyan" />
            <MetricPill label="Light Adequacy" value={`${breakdown.light}%`} color="amber" />
            <MetricPill
              label="Active Alerts"
              value={activeAlertCount === 0 ? "None" : `${activeAlertCount} active`}
              color={activeAlertCount === 0 ? "emerald" : "rose"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "cyan" | "amber" | "emerald" | "rose";
}) {
  const borderColors = {
    blue: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20",
    cyan: "border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/20",
    amber: "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20",
    emerald: "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20",
    rose: "border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20",
  };

  const textColors = {
    blue: "text-blue-600 dark:text-blue-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
  };

  return (
    <div
      className={`rounded-xl border p-2.5 text-center transition-colors ${borderColors[color]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold font-mono ${textColors[color]}`}>
        {value}
      </p>
    </div>
  );
}
