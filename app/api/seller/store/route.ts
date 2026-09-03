import { NextResponse } from "next/server";
import { getSellerStore, getSellerStats } from "@/lib/seller";
import { getUserFromRequest } from "@/lib/auth/request-user";

/**
 * Seller store + stats for the mobile app.
 *
 * A thin shim over the same getSellerStore the web dashboard uses, so both
 * clients share one definition of "is this an active seller". That matters
 * because getSellerStore also repairs an approved seller whose stores row is
 * missing, and that repair needs the service role, which must never ship in the
 * app bundle. Mobile previously queried `stores` directly and therefore had no
 * role check and no repair -- an approved seller with no store row saw
 * "No store yet" forever while the web dashboard worked.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Identity comes only from the verified token, never the request body.
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in to continue" }, { status: 401 });
  }

  try {
    const store = await getSellerStore({ actingUser: { id: user.id } });
    if (!store) {
      // Not an error: the caller is authenticated but is not an active seller.
      return NextResponse.json({ ok: true, store: null, stats: null });
    }

    const stats = await getSellerStats(store.id);
    return NextResponse.json({
      ok: true,
      store: { id: store.id, name: store.name, status: store.status },
      stats,
    });
  } catch (e) {
    // Surfaced rather than swallowed, so the app can tell "no store" apart from
    // "the lookup failed".
    console.error("[api/seller/store] lookup failed", e);
    return NextResponse.json(
      { ok: false, error: "Could not load your store. Please try again." },
      { status: 500 }
    );
  }
}
