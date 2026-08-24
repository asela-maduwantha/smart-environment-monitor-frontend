"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  Cpu,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDevice } from "@/context/device-context";

export const navigation = [
  { href: "/", label: "Overview Hub", icon: LayoutDashboard, badge: "Live" },
  { href: "/live", label: "Live Telemetry", icon: Activity },
  { href: "/analytics", label: "Analytics & Trends", icon: ChartNoAxesCombined },
  { href: "/alerts", label: "Incidents & Alerts", icon: Bell },
  { href: "/devices", label: "Fleet & Devices", icon: Cpu },
  { href: "/settings", label: "Threshold Studio", icon: Settings },
];

export function NavLinks({
  onNavigate,
  onOpenCommand,
}: {
  onNavigate?: () => void;
  onOpenCommand?: () => void;
}) {
  const path = usePathname();

  return (
    <div className="space-y-4">
      {/* Quick search button */}
      {onOpenCommand && (
        <button
          onClick={onOpenCommand}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-100/70 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-800 dark:border-white/5 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search anything...</span>
          </div>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Navigation items */}
      <nav className="space-y-1">
        {navigation.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150",
                active
                  ? "text-blue-600 font-semibold dark:text-cyan-400"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-blue-50/80 border border-blue-200/60 dark:bg-cyan-500/10 dark:border-cyan-500/30"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 transition-transform duration-200",
                    active
                      ? "text-blue-600 dark:text-cyan-400 scale-105"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                />
                <span>{label}</span>
              </div>

              {badge && (
                <span className="relative z-10 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const { devices, selectedDeviceId } = useDevice();
  const activeDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:flex">
      {/* Brand Header */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6 dark:border-white/5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 dark:from-cyan-500 dark:to-blue-500">
          <Activity className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950" />
          </span>
        </div>
        <div>
          <p className="font-bold tracking-tight text-slate-950 dark:text-white">
            Smart Environment
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-cyan-500" />
            IoT Telemetry Hub
          </p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks onOpenCommand={onOpenCommand} />
      </div>

      {/* Fleet & System Status Widget */}
      <div className="border-t border-slate-100 p-4 dark:border-white/5 space-y-3">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/5 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                MQTT Stream
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
              Connected
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-white/5">
            <span>Active Nodes</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {devices.length || 1} online
            </span>
          </div>
        </div>

        {/* Active Node Chip */}
        {activeDevice && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
            <span className="truncate">Node: {activeDevice.name || activeDevice.id}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
