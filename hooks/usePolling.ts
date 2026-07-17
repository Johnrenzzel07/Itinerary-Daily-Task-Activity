"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs = 10000,
  enabled = true,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await fetcher();
        setData(result);
      } finally {
        setIsLoading(false);
      }
    });
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) {
      refresh();
      return;
    }
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, refresh, ...deps]);

  return { data, isLoading, refresh };
}
