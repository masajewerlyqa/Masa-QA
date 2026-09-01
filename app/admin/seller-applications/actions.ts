"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";
import { notifyApplicantApplicationApproved, notifyApplicantApplicationRejected } from "@/lib/notifications";
import {
  sendSellerApplicationApprovedEmail,
  sendSellerPaymentRejectedEmail,
} from "@/lib/email/transactional";
import { resolveEmailLanguage } from "@/lib/email/email-language";
import { getProfileEmailLanguage } from "@/lib/email/profile-language";
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
  contact_email: string | null;
  contact_full_name: string | null;
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
  // Approving means "we have seen the money arrive", so it is only valid once
  // the seller has actually submitted a proof. "pending" covers applications
  // created before the payment flow existed.
  const APPROVABLE = new Set(["payment_proof_submitted", "under_review", "pending"]);
  if (!APPROVABLE.has(app.status)) {
    return {
      ok: false,
      error:
        app.status === "approved"
          ? "This seller is already active."
          : "This application has no payment proof to verify yet.",
    };
  }

  const reviewedAt = new Date().toISOString();
  const { error: updateAppError } = await supabase
    .from("seller_applications")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: reviewedAt,
      // Attributable record that a human confirmed the transfer landed.
      payment_verified_at: reviewedAt,
      review_notes: null,
      rejection_reason: null,
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
      const mailResult = await sendSellerApplicationApprovedEmail(
        mailTo,
        contactName,
        storeDisplayName,
        resolveEmailLanguage(prof?.preferred_language)
      );
      // Reports failure by returning, not throwing.
      if (!mailResult.ok) {
        console.error("[admin] seller approval email failed", {
          error: mailResult.error,
          applicationId,
        });
      }
    } catch (e) {
      console.error("[admin] seller approval email threw", e);
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

  // A rejection has to tell the seller what to fix, otherwise they cannot act
  // on it. The database enforces this too.
  const reason = reviewNotes?.trim();
  if (!reason) {
    return { ok: false, error: "Please give a reason so the seller knows what to correct." };
  }

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("seller_applications")
    .select("status, user_id, contact_email, contact_full_name")
    .eq("id", applicationId)
    .single();

  const app = (data as SellerApplicationRejectRow | null);
  if (fetchError || !app) {
    return { ok: false, error: "Application not found" };
  }
  if (app.status === "approved") {
    return { ok: false, error: "This seller is already active." };
  }

  const { error: updateError } = await supabase
    .from("seller_applications")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
      rejection_reason: reason,
      // Not verified, so any earlier verification must not linger.
      payment_verified_at: null,
    })
    .eq("id", applicationId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  // Tell the seller why and how to resubmit.
  if (app.contact_email) {
    try {
      const mailResult = await sendSellerPaymentRejectedEmail({
        to: app.contact_email,
        contactName: app.contact_full_name ?? null,
        reason,
        language: await getProfileEmailLanguage(app.user_id),
      });
      // Reports failure by returning, not throwing. The seller cannot act on a
      // rejection they were never told about, so this must not stay silent.
      if (!mailResult.ok) {
        console.error("[admin] seller rejection email failed", {
          error: mailResult.error,
          applicationId,
        });
      }
    } catch (e) {
      console.error("[admin] seller rejection email threw", e);
    }
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
