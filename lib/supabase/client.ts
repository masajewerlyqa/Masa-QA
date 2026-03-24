import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for browser / Client Components.
 * Use this in components marked with "use client".
 * Handles auth state and cookies automatically.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
    );
  }

  return createBrowserClient(url, anonKey);
}
