import "server-only";

import { getCurrentUserWithProfileOrActing } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PROOF_BUCKET = "seller-payment-proofs";
/** Short-lived: long enough to open the document, short enough not to be shareable. */
const SIGNED_URL_TTL_SECONDS = 300;

/**
 * Mints a temporary URL for a payment proof.
 *
 * The bucket is private, so this is the only way to view one. Admin role is
 * re-checked here rather than trusted from the caller, because a signed URL
 * bypasses RLS once issued. `actingUserId` (verified Bearer token) lets the
 * mobile admin API route call this the same way `getSellerStore` does --
 * see getCurrentUserWithProfileOrActing in lib/auth.ts.
 */
export async function getPaymentProofSignedUrl(
  path: string | null,
  options?: { actingUserId?: string }
): Promise<string | null> {
  if (!path) return null;

  const { user, profile } = await getCurrentUserWithProfileOrActing(options?.actingUserId);
  if (!user || profile?.role !== "admin") return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[admin] could not sign payment proof url", error);
    return null;
  }
  return data.signedUrl;
}
