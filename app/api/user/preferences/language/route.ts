import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  language: z.enum(["en", "ar"]),
});

/**
 * POST /api/user/preferences/language — persist UI/email locale for signed-in users.
 * Guests get 200 with persisted:false (cookie/localStorage already handled client-side; avoids 401 noise).
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid language" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      preferred_language: parsed.data.language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[preferences/language] update failed:", error.message);
    return NextResponse.json({ ok: false, error: "Could not save preference" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
