"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useApiResource<T>(loader: (signal: AbortSignal) => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const version = useRef(0);
  const dependencyKey = JSON.stringify(deps);

  const load = useCallback(async (signal?: AbortSignal) => {
    const request = ++version.current;
    const controller = signal ? null : new AbortController();
    setLoading(true); setError(null);
    try {
      const result = await loader(signal || controller!.signal);
      if (request === version.current) setData(result);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (request === version.current) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (request === version.current) setLoading(false);
    }
  // dependencyKey deliberately represents the caller's resource identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);

  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  return { data, error, loading, retry: () => void load() };
}
