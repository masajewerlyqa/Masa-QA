import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth/request-user";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";

/**
 * Permanent account deletion (Google Play "Delete account URL" requirement).
 *
 * Serves both clients: the web account settings page (cookie session) and the
 * mobile app (`Authorization: Bearer`), via the same `getUserFromRequest` used
 * by the other mobile routes.
 *
 * Security model -- the important part:
 *   * The target user is ALWAYS taken from the verified session/token. There is
 *     no user id in the request body and none is read, so a caller cannot
 *     delete somebody else's account by tampering with the payload.
 *   * Unauthenticated callers get 401 before anything runs.
 *   * The service role is used only here on the server, only after that check,
 *     and only to delete this one id. It is never sent to any client.
 *
 * Order of operations matters: the personal data on retained records is erased
 * first (while the caller's session still exists), and the auth user is deleted
 * last, because that delete cascades the profile away and would make the RPC's
 * `auth.uid()` unresolvable.
 */
export const dynamic = "force-dynamic";

/** Buckets laid out as `{user_id}/...`. `product-images` is keyed by store id, so it is deliberately absent: those images belong to the catalogue and are still referenced by retained orders. */
const USER_OWNED_BUCKETS = [
  "avatars",
  "store-logos",
  "store-licenses",
  "seller-payment-proofs",
] as const;

async function removeUserFiles(
  service: ReturnType<typeof requireServiceClient>,
  userId: string
): Promise<void> {
  for (const bucket of USER_OWNED_BUCKETS) {
    try {
      const { data, error } = await service.storage.from(bucket).list(userId);
      if (error || !data?.length) continue;
      await service.storage.from(bucket).remove(data.map((f) => `${userId}/${f.name}`));
    } catch (e) {
      // A failed file cleanup must not abort the account deletion: the account
      // record itself going away is what the user asked for and what Play
      // requires. Logged so leftovers can be swept later.
      console.error("[account/delete] storage cleanup failed", { bucket, error: e });
    }
  }
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "You must be signed in to delete your account." },
      { status: 401 }
    );
  }

  try {
    // 1. Erase personal data from records that are retained (orders, stores,
    //    seller application files). Runs as the caller; the function derives its
    //    target from auth.uid() and accepts no id.
    const supabase = await createClient();
    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) {
      console.error("[account/delete] anonymisation failed", rpcError.message);
      return NextResponse.json(
        { ok: false, error: "We could not complete the deletion. Please try again." },
        { status: 500 }
      );
    }

    const service = requireServiceClient();

    // 2. Remove the user's uploaded files.
    await removeUserFiles(service, user.id);

    // 3. Delete the auth user. This cascades to profiles, and from there to
    //    carts, wishlists, notifications, reviews, store_members,
    //    seller_applications, order ratings and return/exchange requests.
    const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("[account/delete] auth user delete failed", deleteError.message);
      return NextResponse.json(
        { ok: false, error: "We could not complete the deletion. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Never surface the raw error: it can carry ids and internal detail.
    console.error("[account/delete] unexpected failure", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
