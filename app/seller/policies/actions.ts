"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore } from "@/lib/seller";
import { createClient } from "@/lib/supabase/server";
import { canEditStorePolicy, orderStatusBlocksPolicyEdit } from "@/lib/store-policy";

export type StorePolicyFormPayload = {
  returns_enabled: boolean;
  exchanges_enabled: boolean;
  return_period_days: number;
  exchange_period_days: number;
  policy_custom_conditions: string;
  same_day_delivery_enabled: boolean;
  same_day_cutoff_local: string;
};

export type PolicyActionResult = { ok: true } | { ok: false; error: string };

const CONDITIONS_MAX = 8000;

function normalizeCutoffLocal(s: string): string {
  const t = s.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  return "14:00:00";
}

async function storeHasOrdersBlockingPolicyEdit(storeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("id").eq("store_id", storeId);
  const pids = (products ?? []).map((p) => p.id);
  if (pids.length === 0) return false;
  const { data: items } = await supabase.from("order_items").select("order_id").in("product_id", pids);
  const oids = [...new Set((items ?? []).map((i) => i.order_id))];
  if (oids.length === 0) return false;
  const { data: orders } = await supabase.from("orders").select("status").in("id", oids);
  return (orders ?? []).some((o) => orderStatusBlocksPolicyEdit(o.status));
}

export async function updateSellerStorePolicy(payload: StorePolicyFormPayload): Promise<PolicyActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    return { ok: false, error: "Unauthorized" };
  }

  const store = await getSellerStore();
  if (!store) {
    return { ok: false, error: "Store not found" };
  }

  const ret = Math.round(Number(payload.return_period_days));
  const ex = Math.round(Number(payload.exchange_period_days));
  if (!Number.isFinite(ret) || ret < 1 || ret > 14) {
    return { ok: false, error: "seller.policies.badReturnDays" };
  }
  if (!Number.isFinite(ex) || ex < 1 || ex > 14) {
    return { ok: false, error: "seller.policies.badExchangeDays" };
  }

  const conditions = (payload.policy_custom_conditions ?? "").trim();
  if (conditions.length > CONDITIONS_MAX) {
    return { ok: false, error: "seller.policies.conditionsTooLong" };
  }

  const cooldown = canEditStorePolicy({ storePolicyUpdatedAt: store.store_policy_updated_at });
  if (!cooldown.ok) {
    return { ok: false, error: "seller.policies.cooldownActive" };
  }

  const blocked = await storeHasOrdersBlockingPolicyEdit(store.id);
  if (blocked) {
    return { ok: false, error: "seller.policies.activeOrdersBlock" };
  }

  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("stores")
    .update({
      returns_enabled: payload.returns_enabled,
      exchanges_enabled: payload.exchanges_enabled,
      return_period_days: ret,
      exchange_period_days: ex,
      policy_custom_conditions: conditions || null,
      same_day_delivery_enabled: payload.same_day_delivery_enabled,
      same_day_cutoff_local: normalizeCutoffLocal(payload.same_day_cutoff_local || "14:00"),
      store_policy_updated_at: nowIso,
    })
    .eq("id", store.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/seller/policies");
  revalidatePath(`/store/${store.slug}`);
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/account/orders");
  return { ok: true };
}
