import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";
import { getPaymentProofSignedUrl } from "@/app/admin/seller-applications/payment-proof";
import { approveApplication, rejectApplication } from "@/app/admin/seller-applications/actions";

/**
 * Admin seller-application detail (read) and approve/reject (write) for the
 * mobile app.
 *
 * "detail" mirrors the query in
 * app/admin/seller-applications/[id]/page.tsx: same columns, same three
 * short-lived signed URLs (payment proof, logo, license) minted the same way,
 * so a stale/expired URL never differs by client. It is not pulled into a
 * shared lib function because the page itself never had one to reuse -- this
 * is a plain read, not business logic with side effects, so the duplication
 * risk here is low.
 *
 * "approve"/"reject" call the same actions the admin dashboard button uses,
 * unchanged.
 */
export const dynamic = "force-dynamic";

const BUCKET_LOGOS = "store-logos";
const BUCKET_LICENSES = "store-licenses";
const SIGNED_URL_EXPIRY = 3600;

type ApplicationDetailRow = {
  id: string;
  user_id: string;
  status: string;
  business_name: string;
  business_description: string | null;
  contact_email: string;
  contact_phone: string | null;
  contact_full_name: string | null;
  store_location: string | null;
  seller_plan: string | null;
  license_path: string | null;
  logo_path: string | null;
  social_links: Record<string, string> | null;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  payment_reference: string | null;
  payment_amount_qar: number | null;
  payment_proof_path: string | null;
  payment_proof_submitted_at: string | null;
  payment_verified_at: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
  reviewer: { full_name: string | null; email: string | null } | null;
};

type Body =
  | { action: "detail"; applicationId: string }
  | { action: "approve"; applicationId: string }
  | { action: "reject"; applicationId: string; reviewNotes: string };

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const options = { actingUserId: auth.user.id };

  try {
    switch (body.action) {
      case "detail": {
        const supabase = await createClient();
        const { data: app, error } = await supabase
          .from("seller_applications")
          .select(
            "id, user_id, status, business_name, business_description, contact_email, contact_phone, " +
              "contact_full_name, store_location, seller_plan, license_path, logo_path, social_links, " +
              "created_at, reviewed_at, review_notes, rejection_reason, " +
              "payment_reference, payment_amount_qar, payment_proof_path, " +
              "payment_proof_submitted_at, payment_verified_at, " +
              "profiles:profiles!seller_applications_user_id_fkey(full_name, email), " +
              "reviewer:profiles!seller_applications_reviewed_by_fkey(full_name, email)"
          )
          .eq("id", body.applicationId)
          .maybeSingle();

        if (error || !app) {
          return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
        }

        const row = app as unknown as ApplicationDetailRow;
        const proofUrl = await getPaymentProofSignedUrl(row.payment_proof_path, options);

        let logoUrl: string | null = null;
        let licenseUrl: string | null = null;
        const service = requireServiceClient();
        if (row.logo_path) {
          const { data: logo } = await service.storage
            .from(BUCKET_LOGOS)
            .createSignedUrl(row.logo_path, SIGNED_URL_EXPIRY);
          logoUrl = logo?.signedUrl ?? null;
        }
        if (row.license_path) {
          const { data: license } = await service.storage
            .from(BUCKET_LICENSES)
            .createSignedUrl(row.license_path, SIGNED_URL_EXPIRY);
          licenseUrl = license?.signedUrl ?? null;
        }

        return NextResponse.json({ ok: true, application: row, proofUrl, logoUrl, licenseUrl });
      }
      case "approve":
        return NextResponse.json(await approveApplication(body.applicationId, options));
      case "reject":
        return NextResponse.json(
          await rejectApplication(body.applicationId, body.reviewNotes, options)
        );
      default:
        return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    console.error("[api/admin/applications] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
