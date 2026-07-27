import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the authenticated user from cookies (web) or `Authorization: Bearer` (mobile).
 */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) return null;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;

    const supabase = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
