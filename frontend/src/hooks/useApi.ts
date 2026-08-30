"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Simple data fetching hook. Uses a ref for the fetcher to avoid
 * infinite re-render loops when callers pass inline arrow functions.
 */
export function useApi<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!!fetcher);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const mutate = useCallback(async () => {
    const fn = fetcherRef.current;
    if (!fn) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mutate();
  }, [mutate]);

  return { data, error, isLoading, mutate };
}

/**
 * Polling hook — re-fetches at interval.
 */
export function usePolling<T>(
  fetcher: (() => Promise<T>) | null,
  intervalMs: number = 5000,
  deps: unknown[] = []
) {
  const result = useApi(fetcher, deps);

  useEffect(() => {
    if (!fetcher) return;
    const id = setInterval(() => result.mutate(), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return result;
}
