import "server-only";

import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Ensures a `profiles` row exists for an authenticated Supabase user.
 * Called when auth exists but profile is missing (OAuth edge cases, replication lag).
 */
export async function ensureProfileForAuthUser(user: User): Promise<void> {
  const service = createServiceClient();
  const { data: existing } = await service.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (existing) {
    await enrichProfileFromOAuthMetadata(user);
    return;
  }

  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;
  const phone = typeof meta.phone === "string" && meta.phone.trim() ? meta.phone.trim() : null;
  const newsletterOptIn =
    typeof meta.newsletter_opt_in === "boolean" ? meta.newsletter_opt_in : false;

  const { error } = await service.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
    phone,
    role: "customer",
    newsletter_opt_in: newsletterOptIn,
  });

  if (error) {
    if (error.code === "23505") {
      await enrichProfileFromOAuthMetadata(user);
      return;
    }
    console.error("[profile-sync] insert profile failed:", error.message);
  }
}

/**
 * Enriches profile fields from OAuth metadata when missing (non-destructive).
 */
export async function enrichProfileFromOAuthMetadata(user: User): Promise<void> {
  const service = createServiceClient();
  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;

  const { data: row } = await service.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();
  if (!row) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (!row.full_name?.trim() && fullName) patch.full_name = fullName;
  if (!row.avatar_url?.trim() && avatarUrl) patch.avatar_url = avatarUrl;
  if (Object.keys(patch).length <= 1) return;

  await service.from("profiles").update(patch).eq("id", user.id);
}
