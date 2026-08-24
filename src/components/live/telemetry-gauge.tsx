"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui";

interface TelemetryGaugeProps {
  title: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color?: "blue" | "cyan" | "amber" | "emerald" | "rose";
  statusText?: string;
  icon?: React.ReactNode;
}

export function TelemetryGauge({
  title,
  value,
  min,
  max,
  unit,
  color = "cyan",
  statusText,
  icon,
}: TelemetryGaugeProps) {
  // Clamp value and calculate 0 to 1 ratio
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = Math.min(
    Math.max((clampedValue - min) / Math.max(max - min, 1), 0),
    1
  );

  // SVG Arc Geometry
  // Arc from (20, 68) over the top to (120, 68) with radius R = 50 centered at (70, 68)
  const radius = 50;
  const arcLength = Math.PI * radius; // 157.08
  const strokeDashoffset = arcLength * (1 - percentage);

  const colors = {
    blue: {
      stroke: "#3b82f6",
      text: "text-blue-500 dark:text-blue-400",
      glow: "rgba(59, 130, 246, 0.35)",
    },
    cyan: {
      stroke: "#06b6d4",
      text: "text-cyan-500 dark:text-cyan-400",
      glow: "rgba(6, 182, 212, 0.35)",
    },
    amber: {
      stroke: "#f59e0b",
      text: "text-amber-500 dark:text-amber-400",
      glow: "rgba(245, 158, 11, 0.35)",
    },
    emerald: {
      stroke: "#10b981",
      text: "text-emerald-500 dark:text-emerald-400",
      glow: "rgba(16, 185, 129, 0.35)",
    },
    rose: {
      stroke: "#f43f5e",
      text: "text-rose-500 dark:text-rose-400",
      glow: "rgba(244, 63, 94, 0.35)",
    },
  };

  const theme = colors[color] || colors.cyan;
  const filterId = `gauge-glow-${color}-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <CardContent className="flex flex-col justify-between p-5">
        {/* Card Header: Title & Status Badge */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            {icon && <span className={theme.text}>{icon}</span>}
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {title}
            </span>
          </div>
          {statusText && (
            <span className="shrink-0 rounded-md border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:border-white/5 dark:bg-slate-800 dark:text-slate-300">
              {statusText}
            </span>
          )}
        </div>

        {/* Semi-Circular Radial Gauge Visualizer */}
        <div className="relative mx-auto my-2 flex h-32 w-full max-w-[210px] items-center justify-center">
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 140 85"
          >
            <defs>
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="3"
                  floodColor={theme.glow}
                />
              </filter>
            </defs>

            {/* Background Arc Track */}
            <path
              d="M 20 68 A 50 50 0 0 1 120 68"
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className="stroke-slate-200/70 dark:stroke-slate-800/80"
            />

            {/* Animated Active Value Arc */}
            <path
              d="M 20 68 A 50 50 0 0 1 120 68"
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              stroke={theme.stroke}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              filter={`url(#${filterId})`}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Metric Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 text-center pointer-events-none">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {value}
            </span>
            <span className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {unit}
            </span>
          </div>
        </div>

        {/* Range Min & Max Bounds */}
        <div className="flex w-full items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-mono text-slate-400 dark:border-white/5 dark:text-slate-500 px-1">
          <span>
            {min} {unit}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-sans">
            {Math.round(percentage * 100)}%
          </span>
          <span>
            {max} {unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
