"use server";

/**
 * Payment-proof upload for seller plan bank transfers.
 *
 * Every check here is server-side. The client cannot choose the storage path,
 * set the application status, or upload on behalf of another seller: the path
 * is derived from the session user and the status transition is validated
 * against the row we read back, not against anything the browser sent.
 */

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";
import { sendSellerPaymentProofReceivedEmail } from "@/lib/email/transactional";
import { getProfileEmailLanguage } from "@/lib/email/profile-language";

const PROOF_BUCKET = "seller-payment-proofs";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
} as const;

/** Statuses from which submitting (or resubmitting) a proof is meaningful. */
const UPLOADABLE_STATUSES = new Set([
  "pending_payment",
  "payment_proof_submitted",
  "rejected",
]);

export type UploadProofResult = { ok: true } | { ok: false; error: string };

export async function uploadPaymentProofAction(formData: FormData): Promise<UploadProofResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    return { ok: false, error: "Please sign in to upload your payment proof." };
  }

  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file to upload." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "That file is larger than 5 MB. Please upload a smaller file." };
  }

  const extension = ALLOWED[file.type as keyof typeof ALLOWED];
  if (!extension) {
    return { ok: false, error: "Please upload a JPG, PNG, or PDF file." };
  }

  const supabase = await createClient();

  // Read the caller's own application. RLS scopes this to them, so there is no
  // way to attach a proof to somebody else's application.
  const { data: application, error: loadError } = await supabase
    .from("seller_applications")
    .select("id, status, seller_plan, contact_email, payment_reference, payment_amount_qar")
    .eq("user_id", user.id)
    .single();

  if (loadError || !application) {
    return { ok: false, error: "We could not find your seller application." };
  }

  if (!UPLOADABLE_STATUSES.has(application.status)) {
    return {
      ok: false,
      error:
        application.status === "approved"
          ? "Your seller account is already active."
          : "Your payment is already being reviewed. We will email you once it is checked.",
    };
  }

  // Path is derived from the session user; the storage policy also enforces
  // that the first folder segment equals auth.uid().
  const path = `${user.id}/payment-proof-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[seller-payment] proof upload failed", uploadError);
    return { ok: false, error: "We could not upload that file. Please try again." };
  }

  // Status is a decision about the applicant, so it is written server-side with
  // the service client rather than from the caller's session. Ownership and the
  // current status were both checked above, and the update is pinned to that
  // row and status, so this cannot touch anyone else's application.
  const service = requireServiceClient();
  const { data: updated, error: updateError } = await service
    .from("seller_applications")
    .update({
      payment_proof_path: path,
      payment_proof_submitted_at: new Date().toISOString(),
      status: "payment_proof_submitted",
      // Clear any prior rejection so the seller is not shown a stale reason.
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id)
    .eq("user_id", user.id)
    .eq("status", application.status)
    .select("id")
    .maybeSingle();

  if (!updateError && !updated) {
    return { ok: false, error: "Your application changed while uploading. Please refresh." };
  }

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  try {
    const mailResult = await sendSellerPaymentProofReceivedEmail({
      to: application.contact_email,
      language: await getProfileEmailLanguage(user.id),
      paymentReference: application.payment_reference,
      amountQar: application.payment_amount_qar,
    });
    // Reports failure by returning, not throwing.
    if (!mailResult.ok) {
      console.error("[seller-payment] proof received email failed", {
        error: mailResult.error,
        applicationId: application.id,
      });
    }
  } catch (e) {
    // The proof is stored; a failed confirmation email must not fail the upload.
    console.error("[seller-payment] proof received email failed", e);
  }

  revalidatePath("/apply/payment");
  revalidatePath("/account");
  return { ok: true };
}
