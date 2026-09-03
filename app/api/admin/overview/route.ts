import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-role";
import { getAdminOrders, getAdminProducts, getAdminStores, getAdminSellers } from "@/lib/admin";

/**
 * Admin list data for the mobile app.
 *
 * A thin shim over the same `lib/admin.ts` readers the web dashboard uses, so
 * both clients share one query definition. These readers run with the service
 * role (they aggregate across every seller and join tables RLS would otherwise
 * filter), which is exactly why mobile cannot query Supabase directly for them
 * and must come through here.
 *
 * `requireAdmin` resolves the role from the database using the id on the
 * verified token, so the role can never be asserted by the client.
 */
export const dynamic = "force-dynamic";

type Section = "orders" | "products" | "stores" | "sellers";

const SECTIONS: readonly Section[] = ["orders", "products", "stores", "sellers"];

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: { section?: string; limit?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // Empty body is fine; the section check below rejects it.
  }

  const section = body.section as Section | undefined;
  if (!section || !SECTIONS.includes(section)) {
    return NextResponse.json(
      { ok: false, error: `section must be one of: ${SECTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  // Bounded so a client cannot ask for an unbounded scan.
  const limit = Math.min(Math.max(Number(body.limit) || 100, 1), 200);

  try {
    switch (section) {
      case "orders":
        return NextResponse.json({ ok: true, rows: await getAdminOrders(limit) });
      case "products":
        return NextResponse.json({ ok: true, rows: await getAdminProducts(limit) });
      case "stores":
        return NextResponse.json({ ok: true, rows: await getAdminStores() });
      case "sellers":
        return NextResponse.json({ ok: true, rows: await getAdminSellers() });
    }
  } catch (e) {
    console.error(`[api/admin/overview] ${section} failed`, e);
    return NextResponse.json(
      { ok: false, error: "Could not load this data. Please try again." },
      { status: 500 }
    );
  }
}
