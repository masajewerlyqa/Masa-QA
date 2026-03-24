import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminPromoCodes, getAdminStores } from "@/lib/admin";
import { CreatePromoForm } from "./CreatePromoForm";
import { PromoActions } from "./PromoActions";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function getPromoStatus(promo: {
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
}, language: "en" | "ar"): { label: string; variant: "default" | "secondary" | "outline"; className?: string } {
  const now = Date.now();
  const startsAt = promo.starts_at ? new Date(promo.starts_at).getTime() : null;
  const expiresAt = promo.expires_at ? new Date(promo.expires_at).getTime() : null;
  const isScheduled = startsAt != null && !Number.isNaN(startsAt) && startsAt > now;
  const isExpired = expiresAt != null && !Number.isNaN(expiresAt) && expiresAt <= now;
  const limitReached = promo.usage_limit != null && Number(promo.used_count) >= Number(promo.usage_limit);

  if (isExpired) return { label: t(language, "admin.promo.statusExpired"), variant: "outline", className: "text-red-600 border-red-600" };
  if (limitReached) return { label: t(language, "admin.promo.statusLimitReached"), variant: "outline", className: "text-orange-600 border-orange-600" };
  if (!promo.active) return { label: t(language, "admin.promo.statusInactive"), variant: "secondary" };
  if (isScheduled) return { label: t(language, "admin.promo.statusScheduled"), variant: "outline", className: "text-blue-600 border-blue-600" };
  return { label: t(language, "admin.promo.statusActive"), variant: "default" };
}

export default async function AdminPromoPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const [promos, stores] = await Promise.all([getAdminPromoCodes(200), getAdminStores()]);
  const storeOptions = stores.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.promo.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.promo.subtitle")}</p>
      </div>

      <CreatePromoForm stores={storeOptions} />

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t(language, "admin.promo.allPromoCodes").replace("{count}", String(promos.length))}</CardTitle>
        </CardHeader>
        <CardContent>
          {promos.length === 0 ? (
            <p className="text-masa-gray font-sans text-sm py-6">{t(language, "admin.promo.noPromoYet")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.code")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.type")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.value")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.storeBrand")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.minOrder")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.usageLimitOptional")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.used")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.overview.status")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.promo.expires")}</th>
                    <th className="text-right py-3">{t(language, "admin.promo.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => {
                    const status = getPromoStatus(promo, language);
                    return (
                    <tr key={promo.id} className="border-b border-primary/10 last:border-0">
                      <td className="py-3 pr-4 font-medium text-primary">{promo.code}</td>
                      <td className="py-3 pr-4 text-masa-gray">{promo.type}</td>
                      <td className="py-3 pr-4">
                        {promo.type === "percentage" ? `${promo.value}%` : <FormattedPrice usd={Number(promo.value)} />}
                      </td>
                      <td className="py-3 pr-4 text-masa-gray">{promo.store_name ?? "—"}</td>
                      <td className="py-3 pr-4"><FormattedPrice usd={Number(promo.min_order_amount)} /></td>
                      <td className="py-3 pr-4">{promo.usage_limit ?? "—"}</td>
                      <td className="py-3 pr-4">{promo.used_count}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={status.variant} className={status.className}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-masa-gray">{formatDate(promo.expires_at)}</td>
                      <td className="py-3 text-right">
                        <PromoActions promo={promo} />
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
