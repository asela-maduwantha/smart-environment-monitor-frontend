"use client";

import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AreaChart as AreaIcon, LineChart as LineIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { chartTime } from "@/lib/formatters";
import type { ChartReading } from "@/types";

// Custom modern floating tooltip
function CustomTooltip({
  active,
  payload,
  label,
  longRange,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  longRange?: boolean;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95 text-xs">
      <p className="mb-2 font-mono text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        {label ? chartTime(String(label), longRange) : ""}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-4 font-mono"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-sans text-slate-600 dark:text-slate-300">
                {entry.name}:
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentChart({
  data,
  longRange = false,
}: {
  data: ChartReading[];
  longRange?: boolean;
}) {
  const [chartType, setChartType] = useState<"area" | "line">("area");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span>Temperature & Humidity Trends</span>
          </CardTitle>
          <CardDescription>
            Dual-axis temporal telemetry tracking
          </CardDescription>
        </div>

        {/* Chart type toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-slate-800/60">
          <button
            onClick={() => setChartType("area")}
            className={`rounded-md p-1.5 transition ${
              chartType === "area"
                ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-cyan-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            title="Area chart"
            aria-label="Switch to area chart"
          >
            <AreaIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`rounded-md p-1.5 transition ${
              chartType === "line"
                ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-cyan-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            title="Line chart"
            aria-label="Switch to line chart"
          >
            <LineIcon className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Temperature (°C)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Humidity (%)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148, 163, 184, 0.15)"
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(v) => chartTime(v, longRange)}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="temp"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  yAxisId="hum"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={<CustomTooltip longRange={longRange} />}
                />
                <Area
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperatureC"
                  name="Temperature"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
                <Area
                  yAxisId="hum"
                  type="monotone"
                  dataKey="humidityPercent"
                  name="Humidity"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#humGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148, 163, 184, 0.15)"
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(v) => chartTime(v, longRange)}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="temp"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  yAxisId="hum"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={<CustomTooltip longRange={longRange} />}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperatureC"
                  name="Temperature"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#3b82f6" }}
                />
                <Line
                  yAxisId="hum"
                  type="monotone"
                  dataKey="humidityPercent"
                  name="Humidity"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#06b6d4" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function LightChart({
  data,
  longRange = false,
}: {
  data: ChartReading[];
  longRange?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle>Ambient Light Intensity</CardTitle>
        <CardDescription>
          Photodiode raw sensor telemetry values (0–1023)
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Raw Sensor Light Level
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(148, 163, 184, 0.15)"
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) => chartTime(v, longRange)}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={<CustomTooltip longRange={longRange} />}
              />
              <Area
                type="monotone"
                dataKey="lightValue"
                name="Light Level"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#lightGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
