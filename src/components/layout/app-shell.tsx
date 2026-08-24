"use client";

import { useState } from "react";
import { Activity, X } from "lucide-react";
import { Sidebar, NavLinks } from "./sidebar";
import { Header } from "./header";
import { DeviceProvider } from "@/context/device-context";
import { CommandPalette } from "@/components/common/command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <DeviceProvider>
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-60 dark:opacity-40" />

      {/* Desktop Sidebar */}
      <Sidebar onOpenCommand={() => setCommandPaletteOpen(true)} />

      {/* Main Content Area */}
      <div className="relative min-h-screen lg:pl-64 flex flex-col">
        <Header
          onMenu={() => setMobileMenuOpen(true)}
          onOpenCommand={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative flex h-full w-72 flex-col bg-white p-6 shadow-2xl transition-transform dark:bg-slate-950 dark:border-r dark:border-white/10">
            {/* Mobile Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">
                    Smart Environment
                  </p>
                  <p className="text-xs text-slate-400">IoT Monitoring</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav */}
            <div className="flex-1 overflow-y-auto">
              <NavLinks
                onNavigate={() => setMobileMenuOpen(false)}
                onOpenCommand={() => {
                  setMobileMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </DeviceProvider>
  );
}
