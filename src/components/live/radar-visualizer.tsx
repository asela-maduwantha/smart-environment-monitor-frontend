"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";

interface RadarVisualizerProps {
  motionDetected: boolean;
  totalEventsToday?: number;
}

export function RadarVisualizer({
  motionDetected,
  totalEventsToday = 0,
}: RadarVisualizerProps) {
  const [blips, setBlips] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (motionDetected) {
      // Add a randomized blip on the radar screen within a realistic sensor arc
      const angle = Math.random() * Math.PI * 2;
      const distance = 25 + Math.random() * 50; // percentage from center
      const x = 50 + Math.cos(angle) * (distance / 2);
      const y = 50 + Math.sin(angle) * (distance / 2);

      setBlips((prev) => [
        { id: Date.now(), x, y },
        ...prev.slice(0, 4),
      ]);
    }
  }, [motionDetected]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span>PIR Motion Radar Scanner</span>
          </CardTitle>
          <CardDescription>
            360° spatial infrared activity detection field
          </CardDescription>
        </div>
        <Badge
          variant={motionDetected ? "critical" : "success"}
          dot
          pulse={motionDetected}
        >
          {motionDetected ? "Motion Active" : "Area Clear"}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-around gap-6 py-2">
          {/* Radar Screen Visualizer */}
          <div className="relative flex h-60 w-60 sm:h-68 sm:w-68 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-slate-950 shadow-2xl shadow-emerald-500/10 overflow-hidden">
            {/* Concentric rings */}
            <div className="absolute h-4/5 w-4/5 rounded-full border border-emerald-500/20" />
            <div className="absolute h-3/5 w-3/5 rounded-full border border-emerald-500/20" />
            <div className="absolute h-2/5 w-2/5 rounded-full border border-emerald-500/20" />
            <div className="absolute h-1/5 w-1/5 rounded-full border border-emerald-500/30 bg-emerald-500/5" />

            {/* Crosshairs */}
            <div className="absolute h-full w-[1px] bg-emerald-500/20" />
            <div className="absolute h-[1px] w-full bg-emerald-500/20" />

            {/* Rotating Radar Sweep Beam */}
            <div
              className="absolute inset-0 origin-center animate-radar pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.4) 0deg, rgba(16, 185, 129, 0) 60deg, transparent 60deg)",
              }}
            />

            {/* Center Node */}
            <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            {/* Motion Blips */}
            {blips.map((blip) => (
              <div
                key={blip.id}
                className="absolute z-10 flex items-center justify-center"
                style={{ top: `${blip.y}%`, left: `${blip.x}%` }}
              >
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white" />
                </span>
              </div>
            ))}

            {/* Range markers */}
            <span className="absolute bottom-2 text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">
              Range: 7m / 120°
            </span>
          </div>

          {/* Radar Metrics & Status Sidebar */}
          <div className="w-full max-w-xs space-y-4">
            <div
              className={`rounded-2xl border p-4 transition-colors ${
                motionDetected
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  : "border-slate-200/80 bg-slate-50/60 dark:border-white/5 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    motionDetected
                      ? "bg-rose-500 text-white"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {motionDetected ? (
                    <ShieldAlert className="h-5 w-5 animate-pulse" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Detection State
                  </p>
                  <p className="text-base font-bold">
                    {motionDetected ? "PIR Sensor Triggered" : "No Motion Detected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-white/5 dark:bg-slate-900/40">
                <p className="text-[11px] font-medium text-slate-400">
                  Total Events Today
                </p>
                <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {totalEventsToday}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-white/5 dark:bg-slate-900/40">
                <p className="text-[11px] font-medium text-slate-400">
                  Sensor Sensitivity
                </p>
                <p className="mt-1 text-xl font-bold font-mono text-cyan-500">
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
