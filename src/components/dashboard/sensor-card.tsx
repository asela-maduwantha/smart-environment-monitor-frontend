"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface SensorCardProps {
  title: string;
  value: string;
  unit?: string;
  status: string;
  detail?: string;
  icon: LucideIcon;
  color?: "blue" | "cyan" | "amber" | "violet" | "emerald" | "rose";
  rangePercent?: number; // 0 to 100 indicating threshold position
  isAlert?: boolean;
}

export function SensorCard({
  title,
  value,
  unit,
  status,
  detail,
  icon: Icon,
  color = "blue",
  rangePercent,
  isAlert = false,
}: SensorCardProps) {
  const colorThemes = {
    blue: {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      glow: "hover:shadow-blue-500/10 hover:border-blue-500/40",
      bar: "bg-gradient-to-r from-blue-500 to-indigo-500",
      pill: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    },
    cyan: {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
      border: "border-cyan-500/20",
      text: "text-cyan-600 dark:text-cyan-400",
      glow: "hover:shadow-cyan-500/10 hover:border-cyan-500/40",
      bar: "bg-gradient-to-r from-cyan-500 to-teal-500",
      pill: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
    },
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      border: "border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      glow: "hover:shadow-amber-500/10 hover:border-amber-500/40",
      bar: "bg-gradient-to-r from-amber-500 to-orange-500",
      pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    },
    violet: {
      bg: "bg-violet-500/10 dark:bg-violet-500/15",
      border: "border-violet-500/20",
      text: "text-violet-600 dark:text-violet-400",
      glow: "hover:shadow-violet-500/10 hover:border-violet-500/40",
      bar: "bg-gradient-to-r from-violet-500 to-purple-500",
      pill: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    },
    emerald: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "hover:shadow-emerald-500/10 hover:border-emerald-500/40",
      bar: "bg-gradient-to-r from-emerald-500 to-green-500",
      pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    rose: {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      border: "border-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
      glow: "hover:shadow-rose-500/10 hover:border-rose-500/40",
      bar: "bg-gradient-to-r from-rose-500 to-red-500",
      pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    },
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
        theme.glow,
        isAlert && "border-rose-500/50 dark:border-rose-500/50 shadow-rose-500/10"
      )}
    >
      {/* Top ambient status accent bar */}
      <div
        className={cn(
          "h-1.5 w-full",
          isAlert ? "bg-rose-500" : theme.bar
        )}
      />

      <CardContent className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Header row: Title + Icon */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {title}
              </p>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  {value}
                </span>
                {unit && (
                  <span className="text-base font-semibold text-slate-400 dark:text-slate-500 font-sans">
                    {unit}
                  </span>
                )}
              </div>
            </div>

            {/* Metric Icon */}
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border p-2.5 transition-transform duration-200 group-hover:scale-110",
                theme.bg,
                theme.border,
                theme.text
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>

          {/* Optional Range Progress Bar */}
          {typeof rangePercent === "number" && (
            <div className="mt-4 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", theme.bar)}
                  style={{ width: `${Math.min(100, Math.max(0, rangePercent))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status / Detail Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5 text-xs">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold",
              isAlert
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                : theme.pill
            )}
          >
            {status}
          </span>
          {detail && (
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] truncate max-w-[150px]">
              {detail}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
