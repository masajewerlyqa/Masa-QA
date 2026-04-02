"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";
import { notifyApplicantApplicationApproved, notifyApplicantApplicationRejected } from "@/lib/notifications";
import { sendSellerApplicationApprovedEmail } from "@/lib/email/transactional";
import { resolveEmailLanguage } from "@/lib/email/email-language";
import { ensureStoreAndOwnerMembership } from "@/lib/seller/ensure-store-from-application";

export type ActionResult = { ok: boolean; error?: string };
type SellerApplicationApproveRow = {
  user_id: string;
  status: string;
  business_name: string | null;
  business_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_location: string | null;
  logo_path: string | null;
  social_links: unknown;
  seller_plan: string | null;
};
type SellerApplicationRejectRow = {
  user_id: string;
  status: string;
};

export async function approveApplication(applicationId: string): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("seller_applications")
    .select(
      "user_id, status, business_name, business_description, contact_email, contact_phone, " +
        "store_location, logo_path, social_links, seller_plan"
    )
    .eq("id", applicationId)
    .single();

  const app = (data as SellerApplicationApproveRow | null);
  if (fetchError || !app) {
    return { ok: false, error: "Application not found" };
  }
  if (app.status !== "pending") {
    return { ok: false, error: "Application is not pending" };
  }

  const { error: updateAppError } = await supabase
    .from("seller_applications")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: null,
    })
    .eq("id", applicationId);

  if (updateAppError) {
    return { ok: false, error: updateAppError.message };
  }

  const service = requireServiceClient();

  const { error: profileError } = await service
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", app.user_id);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const ensured = await ensureStoreAndOwnerMembership(service, app);
  if (!ensured.ok) {
    return { ok: false, error: ensured.error };
  }

  await notifyApplicantApplicationApproved(app.user_id);

  const { data: applicantProfile } = await service
    .from("profiles")
    .select("email, preferred_language, full_name")
    .eq("id", app.user_id)
    .maybeSingle();
  const prof = applicantProfile as { email?: string | null; preferred_language?: string | null; full_name?: string | null } | null;
  const mailTo = (prof?.email ?? app.contact_email ?? "").trim();
  if (mailTo) {
    const storeDisplayName = (app.business_name ?? "").trim() || null;
    const contactName = (prof?.full_name ?? "").trim() || null;
    try {
      await sendSellerApplicationApprovedEmail(
        mailTo,
        contactName,
        storeDisplayName,
        resolveEmailLanguage(prof?.preferred_language)
      );
    } catch (e) {
      console.error("[admin] seller approval email failed", e);
    }
  }

  revalidatePath("/admin/seller-applications");
  revalidatePath("/admin/seller-applications/[id]");
  revalidatePath("/admin");
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/analytics");
  revalidatePath("/seller/settings");
  revalidatePath("/seller/availability");
  return { ok: true };
}

export async function rejectApplication(
  applicationId: string,
  reviewNotes?: string
): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("seller_applications")
    .select("status, user_id")
    .eq("id", applicationId)
    .single();

  const app = (data as SellerApplicationRejectRow | null);
  if (fetchError || !app) {
    return { ok: false, error: "Application not found" };
  }
  if (app.status !== "pending") {
    return { ok: false, error: "Application is not pending" };
  }

  const { error: updateError } = await supabase
    .from("seller_applications")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
    })
    .eq("id", applicationId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const service = requireServiceClient();
  await service
    .from("profiles")
    .update({ role: "customer", updated_at: new Date().toISOString() })
    .eq("id", app.user_id);

  await notifyApplicantApplicationRejected(app.user_id, reviewNotes);

  revalidatePath("/admin/seller-applications");
  revalidatePath("/admin");
  return { ok: true };
}
