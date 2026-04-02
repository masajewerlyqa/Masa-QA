"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { notifyAdminsNewSellerApplication } from "@/lib/notifications";
import { finalizeSellerApplicationSchema, socialLinksFromForm } from "@/lib/validations/seller-application";
import { parseSellerPlanId, type SellerPlanId } from "@/lib/seller-plans";
import { sendSellerApplicationReceivedEmail } from "@/lib/email/transactional";

export type NotifyResult = { ok: boolean; error?: string };

const planSchema = z.enum(["basic", "premium"]);

export type SavePlanResult = { ok: true } | { ok: false; error: string };

export type FinalizeApplicationResult =
  | { ok: true; planId: SellerPlanId }
  | { ok: false; error: string; code?: "SELECT_PLAN_FIRST" };

/** Call after a new seller application is submitted; notifies all admins. */
export async function notifyAdminsNewSellerApplicationAction(): Promise<NotifyResult> {
  try {
    await notifyAdminsNewSellerApplication();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to notify admins" };
  }
}

/** Persists draft plan choice before the application form (profiles.pending_seller_plan). */
export async function savePendingSellerPlanAction(planId: string): Promise<SavePlanResult> {
  const parsed = planSchema.safeParse(planId);
  if (!parsed.success) {
    return { ok: false, error: "Invalid plan" };
  }
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    return { ok: false, error: "Not signed in" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ pending_seller_plan: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Saves the seller application with `seller_plan` from the server (not client).
 * Call after license/logo uploads; clears draft plan on success.
 */
export async function finalizeSellerApplicationAction(raw: unknown): Promise<FinalizeApplicationResult> {
  const parsed = finalizeSellerApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) {
    return { ok: false, error: "Not signed in" };
  }

  const supabase = await createClient();

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("pending_seller_plan")
    .eq("id", user.id)
    .single();

  if (profErr || !prof) {
    return { ok: false, error: profErr?.message ?? "Could not load profile" };
  }

  const planId = parseSellerPlanId((prof as { pending_seller_plan?: string | null }).pending_seller_plan);
  if (!planId) {
    return { ok: false, error: "Please choose a plan before submitting your application.", code: "SELECT_PLAN_FIRST" };
  }

  const data = parsed.data;
  const socialLinks = socialLinksFromForm(data);

  const { error: upsertError } = await supabase.from("seller_applications").upsert(
    {
      user_id: user.id,
      status: "pending",
      business_name: data.brand_store_name,
      business_description: data.store_description || null,
      contact_email: data.email,
      contact_phone: data.phone || null,
      contact_full_name: data.contact_full_name,
      store_location: data.store_location,
      license_path: data.license_path,
      logo_path: data.logo_path,
      social_links: socialLinks,
      seller_plan: planId,
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    return { ok: false, error: upsertError.message };
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      full_name: data.contact_full_name,
      pending_seller_plan: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileUpdateError) {
    return { ok: false, error: profileUpdateError.message };
  }

  try {
    await notifyAdminsNewSellerApplication(planId);
  } catch (e) {
    console.error("[apply] notify admins failed", e);
  }

  const to = profile?.email ?? user.email ?? "";
  if (to) {
    try {
      await sendSellerApplicationReceivedEmail(to, planId, data.contact_full_name?.trim() || null, profile?.preferred_language ?? "en");
    } catch (e) {
      console.error("[apply] confirmation email failed", e);
    }
  }

  return { ok: true, planId };
}
