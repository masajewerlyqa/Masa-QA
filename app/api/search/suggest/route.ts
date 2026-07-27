import { NextResponse } from "next/server";
import { getGlobalSearchSuggestions } from "@/lib/global-search-suggest";
import { checkRateLimit, getRateLimitKey, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * JSON suggestions for navbar global search (products, stores, categories).
 * Query: ?q=   (1+ characters after normalize; empty q → empty arrays)
 */
export async function GET(req: Request) {
  const rl = checkRateLimit(`search:${getRateLimitKey(req)}`, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { products: [], stores: [], categories: [] },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ products: [], stores: [], categories: [] });
  }

  try {
    const data = await getGlobalSearchSuggestions(q);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=0, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ products: [], stores: [], categories: [] });
  }
}
