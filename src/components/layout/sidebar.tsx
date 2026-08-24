"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, ChartNoAxesCombined, Cpu, LayoutDashboard, Settings, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live", label: "Live Monitoring", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return <nav className="space-y-1">{navigation.map(({ href, label, icon: Icon }) => {
    const active = href === "/" ? path === "/" : path.startsWith(href);
    return <Link key={href} href={href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950")}><Icon className="h-5 w-5"/>{label}</Link>;
  })}</nav>;
}

export function Sidebar() { return <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex"><div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6"><div className="rounded-xl bg-blue-600 p-2 text-white"><Activity className="h-5 w-5"/></div><div><p className="font-semibold leading-tight text-slate-950">Smart Environment</p><p className="text-xs text-slate-500">Monitoring System</p></div></div><div className="flex-1 p-4"><NavLinks/></div><div className="border-t border-slate-100 p-4"><div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3"><Wifi className="h-5 w-5 text-emerald-600"/><div><p className="text-xs text-slate-500">System Status</p><p className="text-sm font-semibold text-emerald-700">Monitoring active</p></div></div></div></aside>; }
