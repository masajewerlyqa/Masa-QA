"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";
import { notifyApplicantApplicationApproved, notifyApplicantApplicationRejected } from "@/lib/notifications";

export type ActionResult = { ok: boolean; error?: string };
type SellerApplicationApproveRow = {
  user_id: string;
  status: string;
  business_name: string | null;
  business_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_location: string | null;
  logo_path: string | null;
  social_links: unknown;
  seller_plan: string | null;
};
type SellerApplicationRejectRow = {
  user_id: string;
  status: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50) || "store";
}

function uniqueSlug(base: string): string {
  return `${slugify(base)}-${Date.now().toString(36)}`;
}

/** Build public URL for a file in store-logos bucket (bucket must be public). */
function storeLogoPublicUrl(logoPath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  const path = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
  return `${base}/storage/v1/object/public/store-logos/${path}`;
}

export async function approveApplication(applicationId: string): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("seller_applications")
    .select(
      "user_id, status, business_name, business_description, contact_email, contact_phone, " +
        "store_location, logo_path, social_links, seller_plan"
    )
    .eq("id", applicationId)
    .single();

  const app = (data as SellerApplicationApproveRow | null);
  if (fetchError || !app) {
    return { ok: false, error: "Application not found" };
  }
  if (app.status !== "pending") {
    return { ok: false, error: "Application is not pending" };
  }

  const { error: updateAppError } = await supabase
    .from("seller_applications")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: null,
    })
    .eq("id", applicationId);

  if (updateAppError) {
    return { ok: false, error: updateAppError.message };
  }

  const service = requireServiceClient();

  const { error: profileError } = await service
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", app.user_id);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { data: existingStore } = await service
    .from("stores")
    .select("id")
    .eq("owner_id", app.user_id)
    .limit(1)
    .maybeSingle();

  if (!existingStore) {
    const slug = uniqueSlug(app.business_name ?? "store");
    const logoUrl =
      app.logo_path != null && String(app.logo_path).trim() !== ""
        ? storeLogoPublicUrl(String(app.logo_path).trim())
        : null;
    const socialLinks =
      app.social_links != null && typeof app.social_links === "object" ? app.social_links : null;

    const plan =
      app.seller_plan === "premium" || app.seller_plan === "basic" ? app.seller_plan : "basic";

    const { data: newStore, error: storeError } = await service
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

    if (storeError) {
      return { ok: false, error: storeError.message };
    }
    if (newStore) {
      const { error: memberError } = await service.from("store_members").insert({
        store_id: newStore.id,
        user_id: app.user_id,
        role: "owner",
      });
      if (memberError) {
        return { ok: false, error: memberError.message };
      }
    }
  }

  await notifyApplicantApplicationApproved(app.user_id);

  revalidatePath("/admin/seller-applications");
  revalidatePath("/admin/seller-applications/[id]");
  revalidatePath("/admin");
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/analytics");
  revalidatePath("/seller/settings");
  return { ok: true };
}

export async function rejectApplication(
  applicationId: string,
  reviewNotes?: string
): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("seller_applications")
    .select("status, user_id")
    .eq("id", applicationId)
    .single();

  const app = (data as SellerApplicationRejectRow | null);
  if (fetchError || !app) {
    return { ok: false, error: "Application not found" };
  }
  if (app.status !== "pending") {
    return { ok: false, error: "Application is not pending" };
  }

  const { error: updateError } = await supabase
    .from("seller_applications")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
    })
    .eq("id", applicationId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const service = requireServiceClient();
  await service
    .from("profiles")
    .update({ role: "customer", updated_at: new Date().toISOString() })
    .eq("id", app.user_id);

  await notifyApplicantApplicationRejected(app.user_id, reviewNotes);

  revalidatePath("/admin/seller-applications");
  revalidatePath("/admin");
  return { ok: true };
}
