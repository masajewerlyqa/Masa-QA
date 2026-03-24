"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";

export type PromoActionResult = { ok: boolean; error?: string };

export async function createPromoCode(formData: FormData): Promise<PromoActionResult> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return { ok: false, error: "Unauthorized" };

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "percentage").trim();
  const valueRaw = formData.get("value");
  const value = type === "percentage" ? Number(valueRaw) : Number(valueRaw);
  const storeId = String(formData.get("store_id") ?? "").trim() || null;
  const minOrderAmount = Number(formData.get("min_order_amount")) || 0;
  const usageLimitRaw = formData.get("usage_limit");
  const usageLimit = usageLimitRaw === "" || usageLimitRaw === null ? null : Number(usageLimitRaw);
  const startsAtRaw = formData.get("starts_at");
  const startsAt = startsAtRaw && String(startsAtRaw).trim() ? String(startsAtRaw).trim() : null;
  const expiresAtRaw = formData.get("expires_at");
  const expiresAt = expiresAtRaw && String(expiresAtRaw).trim() ? String(expiresAtRaw).trim() : null;
  const active = formData.get("active") === "on" || formData.get("active") === "true";

  if (!code) return { ok: false, error: "Code is required" };
  if (type !== "percentage" && type !== "fixed") return { ok: false, error: "Type must be percentage or fixed" };
  if (!Number.isFinite(value) || value <= 0) return { ok: false, error: "Value must be a positive number" };
  if (type === "percentage" && value > 100) return { ok: false, error: "Percentage cannot exceed 100" };
  if (minOrderAmount < 0) return { ok: false, error: "Min order amount cannot be negative" };
  if (usageLimit != null && (!Number.isInteger(usageLimit) || usageLimit < 1))
    return { ok: false, error: "Usage limit must be a positive integer or empty" };

  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").insert({
    code,
    type,
    value,
    store_id: storeId || null,
    min_order_amount: minOrderAmount,
    usage_limit: usageLimit,
    starts_at: startsAt || null,
    expires_at: expiresAt || null,
    active,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/promo");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updatePromoActive(promoId: string, active: boolean): Promise<PromoActionResult> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return { ok: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").update({ active }).eq("id", promoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/promo");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deletePromoCode(promoId: string): Promise<PromoActionResult> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return { ok: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").delete().eq("id", promoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/promo");
  revalidatePath("/admin");
  return { ok: true };
}
