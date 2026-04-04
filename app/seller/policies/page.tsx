import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore } from "@/lib/seller";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { canEditStorePolicy, orderStatusBlocksPolicyEdit, POLICY_EDIT_COOLDOWN_DAYS } from "@/lib/store-policy";
import { createClient } from "@/lib/supabase/server";
import { SellerStorePolicyForm } from "./SellerStorePolicyForm";

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

export default async function SellerPoliciesPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.policies.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.settings.noStoreYet")}</p>
      </div>
    );
  }

  const [cooldown, blocked] = await Promise.all([
    Promise.resolve(canEditStorePolicy({ storePolicyUpdatedAt: store.store_policy_updated_at })),
    storeHasOrdersBlockingPolicyEdit(store.id),
  ]);

  const nextEditAtIso = cooldown.ok ? null : cooldown.nextEditAtIso;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.policies.title")}</h1>
      <p className="text-masa-gray font-sans mb-8">{t(language, "seller.policies.subtitle")}</p>

      <SellerStorePolicyForm
        store={{
          returns_enabled: store.returns_enabled,
          exchanges_enabled: store.exchanges_enabled,
          return_period_days: store.return_period_days,
          exchange_period_days: store.exchange_period_days,
          policy_custom_conditions: store.policy_custom_conditions ?? "",
          same_day_delivery_enabled: store.same_day_delivery_enabled,
          same_day_cutoff_local: store.same_day_cutoff_local ?? "14:00:00",
          store_policy_updated_at: store.store_policy_updated_at,
        }}
        cooldownDays={POLICY_EDIT_COOLDOWN_DAYS}
        policyLockedUntilIso={nextEditAtIso}
        activeOrdersBlock={blocked}
      />
    </div>
  );
}
