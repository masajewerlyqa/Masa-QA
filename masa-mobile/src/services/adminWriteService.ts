import { sitePostJsonAuthed } from '../api/siteApi';

/**
 * Admin mutations and detail reads that need the service role on the server
 * (application approval side effects, payment-proof signed URLs, review
 * moderation, promo codes) route through `/api/admin/*`, calling the same
 * "use server" actions the web admin console uses. See
 * getCurrentUserWithProfileOrActing in lib/auth.ts for how those actions
 * authenticate a Bearer-token caller.
 */

export type ActionResult = { ok: boolean; error?: string };

export type AdminApplicationDetail = {
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
  social_links: Record<string, string> | null;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  payment_reference: string | null;
  payment_amount_qar: number | null;
  payment_proof_submitted_at: string | null;
  payment_verified_at: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
  reviewer: { full_name: string | null; email: string | null } | null;
};

export async function getAdminApplicationDetail(applicationId: string): Promise<
  | { ok: true; application: AdminApplicationDetail; proofUrl: string | null; logoUrl: string | null; licenseUrl: string | null }
  | { ok: false; error: string }
> {
  const result = await sitePostJsonAuthed<{
    ok: boolean;
    error?: string;
    application?: AdminApplicationDetail;
    proofUrl?: string | null;
    logoUrl?: string | null;
    licenseUrl?: string | null;
  }>('/api/admin/applications', { action: 'detail', applicationId });

  if (!result.ok) return { ok: false, error: result.error };
  if (!result.data?.ok || !result.data.application) {
    return { ok: false, error: result.data?.error ?? 'Could not load this application.' };
  }
  return {
    ok: true,
    application: result.data.application,
    proofUrl: result.data.proofUrl ?? null,
    logoUrl: result.data.logoUrl ?? null,
    licenseUrl: result.data.licenseUrl ?? null,
  };
}

export function approveSellerApplication(applicationId: string): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/admin/applications', {
    action: 'approve',
    applicationId,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function rejectSellerApplication(applicationId: string, reviewNotes: string): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/admin/applications', {
    action: 'reject',
    applicationId,
    reviewNotes,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

// ---- Reviews ----

export function updateAdminReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected',
): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/admin/reviews', { reviewId, status }).then((r) =>
    r.ok ? (r.data as ActionResult) : { ok: false, error: r.error },
  );
}

// ---- Promo codes ----

export type AdminPromoRow = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  store_name: string | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

export type CreatePromoPayload = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  usage_limit?: number | null;
  active?: boolean;
};

export function createAdminPromoCode(payload: CreatePromoPayload): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/admin/promo', { action: 'create', payload }).then((r) =>
    r.ok ? (r.data as ActionResult) : { ok: false, error: r.error },
  );
}

export function updateAdminPromoActive(promoId: string, active: boolean): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/admin/promo', {
    action: 'updateActive',
    promoId,
    active,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function deleteAdminPromoCode(promoId: string): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/admin/promo', { action: 'delete', promoId }).then((r) =>
    r.ok ? (r.data as ActionResult) : { ok: false, error: r.error },
  );
}
