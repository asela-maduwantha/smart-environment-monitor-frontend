"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Sidebar, NavLinks } from "./sidebar";
import { Header } from "./header";
import { DeviceProvider } from "@/context/device-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DeviceProvider><Sidebar/><div className="min-h-screen lg:pl-64"><Header onMenu={() => setOpen(true)}/><main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main></div>{open && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/30" onClick={() => setOpen(false)} aria-label="Close navigation"/><aside className="relative h-full w-72 bg-white p-5 shadow-xl"><div className="mb-8 flex items-center justify-between"><p className="font-semibold">Smart Environment</p><button onClick={() => setOpen(false)} aria-label="Close navigation"><X/></button></div><NavLinks onNavigate={() => setOpen(false)}/></aside></div>}</DeviceProvider>;
}
