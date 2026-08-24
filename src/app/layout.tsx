import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = { title: "Smart Environment Monitoring", description: "IoT environment monitoring and management dashboard" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><AppShell>{children}</AppShell><Toaster richColors position="top-right"/></body></html>; }
