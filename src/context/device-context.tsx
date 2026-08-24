"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { deviceService } from "@/services/device.service";
import type { Device } from "@/types";

interface DeviceContextValue { devices: Device[]; selectedDeviceId: string; setSelectedDeviceId: (id: string) => void; loading: boolean; }
const DeviceContext = createContext<DeviceContextValue | null>(null);
const key = "smart-environment-device";

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const fallback = process.env.NEXT_PUBLIC_DEFAULT_DEVICE_ID || "ESP32_01";
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelected] = useState(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); deviceService.list(controller.signal).then((items) => {
    setDevices(items);
    const saved = localStorage.getItem(key);
    setSelected((current) => {
      const preferred = saved || current;
      return items.some((d) => d.id === preferred) ? preferred : items[0]?.id || fallback;
    });
  }).catch(() => undefined).finally(() => setLoading(false)); return () => controller.abort(); }, [fallback]);
  const setSelectedDeviceId = (id: string) => { setSelected(id); localStorage.setItem(key, id); };
  const value = useMemo(() => ({ devices, selectedDeviceId, setSelectedDeviceId, loading }), [devices, selectedDeviceId, loading]);
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice() { const value = useContext(DeviceContext); if (!value) throw new Error("useDevice must be within DeviceProvider"); return value; }
