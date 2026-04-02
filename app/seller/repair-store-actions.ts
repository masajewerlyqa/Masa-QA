"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";
import { ensureStoreAndOwnerMembership } from "@/lib/seller/ensure-store-from-application";

/**
 * Self-heal: if role is seller but store row is missing (e.g. approval partially failed),
 * create the store from the approved seller application.
 */
export async function repairSellerStoreAction(): Promise<{ ok: boolean; error?: string }> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data: app, error: appErr } = await supabase
    .from("seller_applications")
    .select(
      "user_id, business_name, business_description, contact_email, contact_phone, store_location, logo_path, social_links, seller_plan"
    )
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  if (appErr) {
    return { ok: false, error: appErr.message };
  }
  if (!app) {
    return { ok: false, error: "No approved seller application found for your account." };
  }

  const service = requireServiceClient();
  const ensured = await ensureStoreAndOwnerMembership(service, app);
  if (!ensured.ok) {
    return { ok: false, error: ensured.error };
  }

  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/seller/settings");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/analytics");
  revalidatePath("/seller/availability");
  return { ok: true };
}
