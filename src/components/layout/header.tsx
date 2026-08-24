"use client";
import { usePathname } from "next/navigation";
import { Menu, Wifi, WifiOff } from "lucide-react";
import { useDevice } from "@/context/device-context";
import { relativeTime } from "@/lib/formatters";

const titles: Record<string, string> = { "/": "Environment Overview", "/live": "Live Monitoring", "/analytics": "Analytics", "/alerts": "Alerts", "/devices": "Devices", "/settings": "Settings" };
export function Header({ onMenu }: { onMenu: () => void }) {
  const path = usePathname(); const { devices, selectedDeviceId, setSelectedDeviceId } = useDevice();
  const device = devices.find((d) => d.id === selectedDeviceId);
  const title = path.startsWith("/devices/") ? "Device Details" : titles[path] || "Smart Environment";
  return <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8"><button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5"/></button><div className="min-w-0 flex-1"><h1 className="truncate text-lg font-semibold text-slate-950">{title}</h1><p className="hidden text-xs text-slate-500 sm:block">{device ? `Updated ${relativeTime(device.lastSeen)}` : "Select a monitoring device"}</p></div><select aria-label="Selected device" value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} className="max-w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium sm:max-w-52">{devices.length ? devices.map((d) => <option key={d.id} value={d.id}>{d.name || d.id}</option>) : <option value={selectedDeviceId}>{selectedDeviceId}</option>}</select><div className="hidden items-center gap-2 sm:flex">{device?.status === "online" ? <Wifi className="h-4 w-4 text-emerald-600"/> : <WifiOff className="h-4 w-4 text-slate-400"/>}<span className="text-sm font-medium capitalize">{device?.status || "Unknown"}</span></div></div></header>;
}
