import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with SERVICE_ROLE key for server-only use.
 * Use in Server Actions or API routes when you need to bypass RLS
 * (e.g. admin operations, background jobs, service-to-service).
 * Never expose this client to the browser or use in Client Components.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
