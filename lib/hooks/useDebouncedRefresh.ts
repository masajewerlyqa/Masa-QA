"use client";

import { useRouter } from "next/navigation";
import { useRef, useCallback, useEffect } from "react";

/** Batches rapid server-action results into a single Next.js refresh (navbar counts, RSC). */
export function useDebouncedRefresh(delayMs = 320) {
  const router = useRouter();
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);

  return useCallback(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      router.refresh();
      t.current = null;
    }, delayMs);
  }, [router, delayMs]);
}
