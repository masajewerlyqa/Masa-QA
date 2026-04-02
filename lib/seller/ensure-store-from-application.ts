import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Fields needed to create or link a store from an approved seller application. */
export type ApprovedApplicationForStore = {
  user_id: string;
  business_name: string | null;
  business_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_location: string | null;
  logo_path: string | null;
  social_links: unknown;
  seller_plan: string | null;
};

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50) || "store"
  );
}

function uniqueSlug(base: string): string {
  return `${slugify(base)}-${Date.now().toString(36)}`;
}

function storeLogoPublicUrl(logoPath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  const path = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
  return `${base}/storage/v1/object/public/store-logos/${path}`;
}

/**
 * Ensures a `stores` row exists for the applicant and an owner `store_members` row.
 * Idempotent: safe to call after approval if store creation failed earlier.
 */
export async function ensureStoreAndOwnerMembership(
  service: SupabaseClient,
  app: ApprovedApplicationForStore
): Promise<{ ok: true; storeId: string } | { ok: false; error: string }> {
  const { data: existingRows, error: existingErr } = await service
    .from("stores")
    .select("id")
    .eq("owner_id", app.user_id)
    .limit(1);

  if (existingErr) {
    return { ok: false, error: existingErr.message };
  }

  const existingId = existingRows?.[0]?.id as string | undefined;
  if (existingId) {
    const { data: memRows, error: memErr } = await service
      .from("store_members")
      .select("user_id")
      .eq("store_id", existingId)
      .eq("user_id", app.user_id)
      .limit(1);

    if (memErr) {
      return { ok: false, error: memErr.message };
    }

    if (!memRows?.length) {
      const { error: insMemErr } = await service.from("store_members").insert({
        store_id: existingId,
        user_id: app.user_id,
        role: "owner",
      });
      if (insMemErr) {
        return { ok: false, error: insMemErr.message };
      }
    }

    return { ok: true, storeId: existingId };
  }

  const slug = uniqueSlug(app.business_name ?? "store");
  const logoUrl =
    app.logo_path != null && String(app.logo_path).trim() !== ""
      ? storeLogoPublicUrl(String(app.logo_path).trim())
      : null;
  const socialLinks =
    app.social_links != null && typeof app.social_links === "object" ? app.social_links : null;

  const plan = app.seller_plan === "premium" || app.seller_plan === "basic" ? app.seller_plan : "basic";

  const { data: inserted, error: storeError } = await service
    .from("stores")
    .insert({
      owner_id: app.user_id,
      name: (app.business_name ?? "").trim() || "My Store",
      slug,
      description: (app.business_description ?? "").trim() || null,
      logo_url: logoUrl,
      location: (app.store_location ?? "").trim() || null,
      contact_email: (app.contact_email ?? "").trim() || null,
      contact_phone: (app.contact_phone ?? "").trim() || null,
      social_links: socialLinks,
      status: "pending",
      seller_plan: plan,
    })
    .select("id")
    .single();

  if (storeError || !inserted?.id) {
    return { ok: false, error: storeError?.message ?? "Failed to create store" };
  }

  const storeId = inserted.id as string;

  const { error: memberError } = await service.from("store_members").insert({
    store_id: storeId,
    user_id: app.user_id,
    role: "owner",
  });

  if (memberError) {
    return { ok: false, error: memberError.message };
  }

  return { ok: true, storeId };
}
