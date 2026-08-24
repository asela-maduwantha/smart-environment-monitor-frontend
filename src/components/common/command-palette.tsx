"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  Cpu,
  LayoutDashboard,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useDevice } from "@/context/device-context";
import { useTheme } from "@/context/theme-context";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Devices" | "Actions" | "Theme";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { devices, selectedDeviceId, setSelectedDeviceId } = useDevice();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-dashboard",
      title: "Go to Dashboard Overview",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => router.push("/"),
      keywords: ["home", "overview", "metrics", "sensors"],
    },
    {
      id: "nav-live",
      title: "Go to Live Telemetry Room",
      category: "Navigation",
      icon: Activity,
      action: () => router.push("/live"),
      keywords: ["realtime", "live", "stream", "motion", "radar"],
    },
    {
      id: "nav-analytics",
      title: "Go to Environmental Analytics",
      category: "Navigation",
      icon: ChartNoAxesCombined,
      action: () => router.push("/analytics"),
      keywords: ["charts", "stats", "averages", "history", "export"],
    },
    {
      id: "nav-alerts",
      title: "Go to Environmental Alerts",
      category: "Navigation",
      icon: Bell,
      action: () => router.push("/alerts"),
      keywords: ["incidents", "warnings", "critical", "resolve"],
    },
    {
      id: "nav-devices",
      title: "Go to Registered Devices",
      category: "Navigation",
      icon: Cpu,
      action: () => router.push("/devices"),
      keywords: ["nodes", "hardware", "esp32", "fleet"],
    },
    {
      id: "nav-settings",
      title: "Go to Thresholds & Device Settings",
      category: "Navigation",
      icon: Settings,
      action: () => router.push("/settings"),
      keywords: ["threshold", "temperature", "humidity", "interval", "mqtt"],
    },
    // Theme
    {
      id: "theme-dark",
      title: "Switch to Dark Theme (Cyber Obsidian)",
      category: "Theme",
      icon: Moon,
      action: () => setTheme("dark"),
      keywords: ["dark", "black", "night", "neon"],
    },
    {
      id: "theme-light",
      title: "Switch to Light Theme (Clean Slate)",
      category: "Theme",
      icon: Sun,
      action: () => setTheme("light"),
      keywords: ["light", "white", "day"],
    },
    // Devices
    ...devices.map((device) => ({
      id: `device-${device.id}`,
      title: `Select Device: ${device.name || device.id} (${device.location})`,
      category: "Devices" as const,
      icon: Cpu,
      action: () => {
        setSelectedDeviceId(device.id);
      },
      keywords: [device.id, device.name, device.location, "esp32", "node"],
    })),
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (cmd: CommandItem) => {
    cmd.action();
    onClose();
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:pt-28">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Command Box */}
      <div
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
        onKeyDown={handleKeyNav}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-white/5">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or device name..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching commands or devices found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                const isCurrentDevice =
                  cmd.id === `device-${selectedDeviceId}`;

                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className={`rounded-lg p-1.5 ${
                          isSelected
                            ? "bg-white/20 text-white dark:text-cyan-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium truncate">{cmd.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrentDevice && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-500">
                          Active
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-white/20 text-white dark:text-cyan-200"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        }`}
                      >
                        {cmd.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-400 dark:border-white/5 dark:bg-slate-900/50 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                ↑
              </kbd>{" "}
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
              ESC
            </kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
