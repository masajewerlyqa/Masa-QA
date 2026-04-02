import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client with the service role key. Bypasses RLS — use only in trusted
 * server contexts (e.g. cron jobs), never in browser or user-facing code.
 */
export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Alias for readability in gold-scraper and similar modules. */
export const createServiceRoleClient = createServiceClient;
