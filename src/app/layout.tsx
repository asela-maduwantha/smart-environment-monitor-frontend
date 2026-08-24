import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/context/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Environment Monitor | IoT Telemetry & Analytics Hub",
  description:
    "Next-generation IoT environment monitoring, real-time telemetry, threshold management, and analytics console.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080c14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="antialiased selection:bg-cyan-500/20 selection:text-cyan-400">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              className: "glass-card border border-slate-200 dark:border-white/10 text-sm font-medium",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
