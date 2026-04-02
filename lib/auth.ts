import "server-only";
/**
 * Server-only auth: get current user and profile.
 * Uses next/headers (cookies) via lib/supabase/server.
 * Only import from Server Components, Route Handlers, or Server Actions.
 */
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForAuthUser } from "@/lib/auth/profile-sync";
import type { Profile, SessionUser } from "@/lib/auth-client";
import { getRedirectPathForRole, getDashboardPathForRole } from "@/lib/auth-client";

export type { Profile } from "@/lib/auth-client";
export { getRedirectPathForRole, getDashboardPathForRole } from "@/lib/auth-client";

export type GetCurrentUserResult = {
  user: SessionUser | null;
  profile: Profile | null;
};

/**
 * Server-only: get current auth user and their profile (role) from the database.
 * Cached per-request so layout + page both calling it only trigger one auth + profile fetch.
 */
const profileSelect =
  "id, role, full_name, avatar_url, email, phone, phone_verified_at, newsletter_opt_in, preferred_language, pending_seller_plan";

async function getCurrentUserWithProfileImpl(): Promise<GetCurrentUserResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    let { data: profile } = await supabase.from("profiles").select(profileSelect).eq("id", user.id).maybeSingle();

    // Missing profile: OAuth lag or rare trigger miss — repair without blocking the session.
    // Rare: trigger missed profile row — repair so layout/nav never see "logged in" without a role.
    if (!profile) {
      await ensureProfileForAuthUser(user);
      const retry = await supabase.from("profiles").select(profileSelect).eq("id", user.id).maybeSingle();
      profile = retry.data;
    }

    const rawPending = (profile as { pending_seller_plan?: string | null }).pending_seller_plan;
    const normalizedProfile =
      profile && typeof profile === "object"
        ? ({
            ...profile,
            newsletter_opt_in: Boolean((profile as { newsletter_opt_in?: boolean }).newsletter_opt_in),
            preferred_language:
              (profile as { preferred_language?: string }).preferred_language === "ar" ? "ar" : "en",
            pending_seller_plan:
              rawPending === "basic" || rawPending === "premium" ? rawPending : null,
          } as Profile)
        : null;

    return {
      user: {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.email_confirmed_at ?? null,
      },
      profile: normalizedProfile,
    };
  } catch (error) {
    // Never crash the entire route tree when auth bootstrap fails in production.
    console.error("[auth] getCurrentUserWithProfile failed:", error);
    return { user: null, profile: null };
  }
}

export const getCurrentUserWithProfile = cache(getCurrentUserWithProfileImpl);
