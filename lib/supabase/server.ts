import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

/** Supabase's SSR auth cookie, e.g. `sb-<ref>-auth-token` (may be chunked `.0`, `.1`). */
const SUPABASE_AUTH_COOKIE = /^sb-.*-auth-token/;

/**
 * Supabase client for Server Components and Route Handlers.
 * Use this in server components, API routes, and server actions when you need
 * the current user's session (anon key, cookie-based auth).
 *
 * The mobile app has no cookies -- it authenticates with `Authorization: Bearer
 * <jwt>`. When there is no cookie session but such a header is present, the
 * token is forwarded to PostgREST so it validates the JWT itself and `auth.uid()`
 * resolves to that user. RLS is therefore enforced exactly as for a browser
 * session; this grants no extra privilege and never uses the service role.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
    );
  }

  // Cookies win when present, so the web path is byte-for-byte unchanged and a
  // stray header can never override a real browser session.
  const hasCookieSession = cookieStore.getAll().some((c) => SUPABASE_AUTH_COOKIE.test(c.name));
  let bearer: string | null = null;
  if (!hasCookieSession) {
    try {
      const authorization = (await headers()).get("authorization");
      if (authorization?.startsWith("Bearer ")) bearer = authorization;
    } catch {
      // headers() is unavailable outside a request scope (e.g. static generation).
      // Cookie-only behaviour is the correct fallback there.
    }
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored in Server Components (read-only in some contexts)
        }
      },
    },
    ...(bearer ? { global: { headers: { Authorization: bearer } } } : {}),
  });
}
