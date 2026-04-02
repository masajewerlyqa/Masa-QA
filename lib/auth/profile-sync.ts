import "server-only";

import type { User } from "@supabase/supabase-js";
import { requireServiceClient } from "@/lib/supabase/service";

/**
 * Ensures a `profiles` row exists for an authenticated Supabase user.
 * Called when auth exists but profile is missing (OAuth edge cases, replication lag).
 */
export async function ensureProfileForAuthUser(user: User): Promise<void> {
  const service = requireServiceClient();
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

  const registrationIntent =
    typeof meta.registration_intent === "string" ? meta.registration_intent : null;
  const role = registrationIntent === "seller" ? "pending_seller" : "customer";

  const signupChannel = typeof meta.signup_channel === "string" ? meta.signup_channel : null;
  const termsMetaOk =
    meta.customer_terms_accepted === "true" &&
    typeof meta.customer_terms_version === "string" &&
    meta.customer_terms_version.trim() !== "";
  const termsAtRaw =
    typeof meta.customer_terms_accepted_at === "string" && meta.customer_terms_accepted_at.trim()
      ? meta.customer_terms_accepted_at
      : null;
  const recordCustomerTerms =
    role === "customer" && signupChannel === "email" && termsMetaOk;

  const merchantMetaOk =
    meta.merchant_terms_accepted === "true" &&
    typeof meta.merchant_terms_version === "string" &&
    String(meta.merchant_terms_version).trim() !== "";
  const merchantAtRaw =
    typeof meta.merchant_terms_accepted_at === "string" && meta.merchant_terms_accepted_at.trim()
      ? meta.merchant_terms_accepted_at
      : null;
  const recordMerchantTerms =
    role === "pending_seller" && signupChannel === "email" && merchantMetaOk;

  const pendingPlanRaw =
    typeof meta.pending_seller_plan === "string" ? meta.pending_seller_plan.trim() : "";
  const pendingSellerPlan =
    role === "pending_seller" && (pendingPlanRaw === "basic" || pendingPlanRaw === "premium")
      ? pendingPlanRaw
      : null;

  const { error } = await service.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
    phone,
    role,
    newsletter_opt_in: newsletterOptIn,
    accepted_terms: recordCustomerTerms,
    accepted_terms_at: recordCustomerTerms ? termsAtRaw ?? new Date().toISOString() : null,
    accepted_terms_version: recordCustomerTerms ? String(meta.customer_terms_version).trim() : null,
    accepted_merchant_terms: recordMerchantTerms,
    accepted_merchant_terms_at: recordMerchantTerms ? merchantAtRaw ?? new Date().toISOString() : null,
    accepted_merchant_terms_version: recordMerchantTerms
      ? String(meta.merchant_terms_version).trim()
      : null,
    pending_seller_plan: pendingSellerPlan,
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
  const service = requireServiceClient();
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
