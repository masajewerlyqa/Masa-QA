import "server-only";
import type { QatarGoldPricesJson } from "./types";
import { goldScraperLog } from "./logger";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import fallbackStatic from "./fallback-qatar.json";

const CACHE_ROW_ID = "qatar_qar";
const MEMORY_TTL_MS = 10 * 60 * 1000;

type MemoryEntry = { payload: QatarGoldPricesJson; storedAt: number };

let memoryCache: MemoryEntry | null = null;

function isFresh(entry: MemoryEntry): boolean {
  return Date.now() - entry.storedAt < MEMORY_TTL_MS;
}

export function setMemoryGoldCache(payload: QatarGoldPricesJson): void {
  memoryCache = { payload, storedAt: Date.now() };
}

export function getMemoryGoldCache(): QatarGoldPricesJson | null {
  if (!memoryCache || !isFresh(memoryCache)) return null;
  return memoryCache.payload;
}

/** Invalidate in-memory TTL (still may serve from DB). */
export function clearMemoryGoldCache(): void {
  memoryCache = null;
}

function normalizePayload(row: unknown): QatarGoldPricesJson | null {
  if (!row || typeof row !== "object") return null;
  const p = row as Record<string, unknown>;
  const gram = Number(p.gram);
  if (!Number.isFinite(gram) || gram <= 0) return null;
  return row as QatarGoldPricesJson;
}

/**
 * Read persisted row (anon / RLS select). Safe for API routes and RSC.
 */
export async function readGoldPricesFromDatabase(): Promise<QatarGoldPricesJson | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gold_price_cache")
      .select("payload")
      .eq("id", CACHE_ROW_ID)
      .maybeSingle();
    if (error) {
      goldScraperLog.warn("Supabase read gold_price_cache", { error: error.message });
      return null;
    }
    const raw = data?.payload;
    return normalizePayload(raw);
  } catch (e) {
    goldScraperLog.warn("readGoldPricesFromDatabase failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

/**
 * Upsert latest scrape (service role). Returns false if not configured or DB error.
 */
export async function writeGoldPricesToDatabase(payload: QatarGoldPricesJson): Promise<boolean> {
  const client = createServiceClient();
  if (!client) {
    goldScraperLog.warn("writeGoldPricesToDatabase: no service role client");
    return false;
  }
  const { error } = await client.from("gold_price_cache").upsert(
    {
      id: CACHE_ROW_ID,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) {
    goldScraperLog.error("gold_price_cache upsert failed", { message: error.message });
    return false;
  }
  return true;
}

export type CachedGoldResult = {
  data: QatarGoldPricesJson;
  /** true if scrape / DB is older than ideal (e.g. only static fallback) */
  stale: boolean;
  /** memory | supabase | static-fallback */
  source: "memory" | "supabase" | "static-fallback";
};

/**
 * Resolution order: warm memory → Supabase → committed JSON fallback.
 * Does not run network scrapes.
 */
export async function getCachedGoldPrices(): Promise<CachedGoldResult | null> {
  const mem = getMemoryGoldCache();
  if (mem) {
    return { data: mem, stale: false, source: "memory" };
  }

  const db = await readGoldPricesFromDatabase();
  if (db) {
    setMemoryGoldCache(db);
    return { data: db, stale: false, source: "supabase" };
  }

  const fb = normalizePayload(fallbackStatic);
  if (fb) {
    goldScraperLog.warn("Serving static gold fallback (no DB row)");
    return { data: fb, stale: true, source: "static-fallback" };
  }

  return null;
}

/** 24K gram for market-prices integration */
export async function getLatestGram24kQAR(): Promise<number | null> {
  const r = await getCachedGoldPrices();
  return r?.data.gram ?? null;
}

export function pricesChangedMeaningfully(a: QatarGoldPricesJson, b: QatarGoldPricesJson): boolean {
  return Math.abs(a.gram - b.gram) > 0.01 || Math.abs(a.ounce - b.ounce) > 0.5;
}
