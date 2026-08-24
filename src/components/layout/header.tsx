"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Moon,
  Radio,
  Search,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useDevice } from "@/context/device-context";
import { useTheme } from "@/context/theme-context";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Environment Overview",
    subtitle: "Real-time vital stats and telemetry trends",
  },
  "/live": {
    title: "Live Monitoring Station",
    subtitle: "High-frequency 5-second sensor polling and radar scanner",
  },
  "/analytics": {
    title: "Environmental Analytics",
    subtitle: "Aggregated metrics, long-term trends, and data exports",
  },
  "/alerts": {
    title: "Incident Command & Alerts",
    subtitle: "Active anomaly alerts and threshold breach resolution",
  },
  "/devices": {
    title: "IoT Node Fleet",
    subtitle: "Manage and inspect connected sensor devices",
  },
  "/settings": {
    title: "Threshold Studio & Settings",
    subtitle: "Configure alarm limits, telemetry intervals, and MQTT sync",
  },
};

export function Header({
  onMenu,
  onOpenCommand,
}: {
  onMenu: () => void;
  onOpenCommand: () => void;
}) {
  const path = usePathname();
  const { devices, selectedDeviceId, setSelectedDeviceId } = useDevice();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const device = devices.find((d) => d.id === selectedDeviceId);
  const routeMeta = path.startsWith("/devices/")
    ? {
        title: "Device Diagnostics",
        subtitle: `Inspecting Node: ${decodeURIComponent(
          path.replace("/devices/", "")
        )}`,
      }
    : titles[path] || {
        title: "Smart Environment",
        subtitle: "IoT Monitoring Console",
      };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/80">
      <div className="flex min-h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
        {/* Left: Mobile Menu + Page Header */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onMenu}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              {routeMeta.title}
            </h1>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block truncate">
              {routeMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions & Device Selector */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Real-time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-mono text-slate-600 dark:border-white/5 dark:bg-slate-900/60 dark:text-slate-300">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span>{currentTime}</span>
          </div>

          {/* Search Trigger button */}
          <button
            onClick={onOpenCommand}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-200"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] text-slate-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Device Quick Selector Dropdown */}
          <div className="relative">
            <select
              aria-label="Selected IoT Device"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="h-9.5 max-w-40 sm:max-w-56 cursor-pointer rounded-xl border border-slate-200/80 bg-white px-3 pr-8 text-xs font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-white/20"
            >
              {devices.length ? (
                devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name ? `${d.name} (${d.id})` : d.id}
                  </option>
                ))
              ) : (
                <option value={selectedDeviceId}>{selectedDeviceId}</option>
              )}
            </select>
          </div>

          {/* Wi-Fi / Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            {device?.status === "online" ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="text-xs font-medium capitalize text-slate-700 dark:text-slate-300">
              {device?.status || "Unknown"}
            </span>
            {device?.wifiRssi && (
              <span className="text-[10px] text-slate-400 font-mono">
                {device.wifiRssi}dBm
              </span>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-white/5"
            aria-label="Toggle theme"
            title={`Switch to ${
              resolvedTheme === "dark" ? "light" : "dark"
            } mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
