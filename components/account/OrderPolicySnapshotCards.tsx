import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerOrder } from "@/lib/customer";
import type { Language } from "@/lib/language";
import { t } from "@/lib/i18n";
import {
  buyerReturnExchangeEligibility,
  publicPolicyFromSnapshot,
  type StorePolicySnapshot,
} from "@/lib/store-policy";
import { OrderReturnExchangeClient } from "./OrderReturnExchangeClient";

function formatDeadline(iso: string | null, locale: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function OrderPolicySnapshotCards({
  order,
  language,
  storeNames,
}: {
  order: CustomerOrder;
  language: Language;
  storeNames: Record<string, string>;
}) {
  const storeIds = [...new Set(order.items.map((i) => i.store_id).filter(Boolean))];
  if (storeIds.length === 0) return null;

  const locale = language === "ar" ? "ar-QA" : "en-US";

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle className="font-luxury text-primary text-lg">
          {t(language, "account.orders.policyTitle")}
        </CardTitle>
        <p className="text-sm text-masa-gray font-sans">{t(language, "account.orders.policyIntro")}</p>
      </CardHeader>
      <CardContent className="space-y-8 font-sans text-sm">
        {storeIds.map((storeId) => {
          const snap: StorePolicySnapshot | undefined = order.policy_snapshots[storeId];
          const storeName = storeNames[storeId] ?? t(language, "account.orders.policyUnknownStore");

          const retElig = buyerReturnExchangeEligibility({
            orderStatus: order.status,
            deliveredAt: order.delivered_at,
            snapshot: snap ?? null,
            kind: "return",
          });
          const exElig = buyerReturnExchangeEligibility({
            orderStatus: order.status,
            deliveredAt: order.delivered_at,
            snapshot: snap ?? null,
            kind: "exchange",
          });

          if (!snap) {
            return (
              <div key={storeId} className="rounded-lg border border-primary/10 p-4 bg-masa-light/30">
                <p className="font-medium text-primary">{storeName}</p>
                <p className="text-masa-gray mt-2">{t(language, "account.orders.policySnapshotMissing")}</p>
              </div>
            );
          }

          const pub = publicPolicyFromSnapshot(snap);

          return (
            <div key={storeId} className="rounded-lg border border-primary/10 p-4 bg-masa-light/20">
              <p className="font-medium text-primary mb-3">{storeName}</p>
              <ul className="space-y-2 text-masa-dark list-disc ms-4">
                <li>
                  {pub.returnsEnabled
                    ? t(language, "account.orders.policyReturnsOn").replace(/\{\{n\}\}/g, String(pub.returnPeriodDays))
                    : t(language, "account.orders.policyReturnsOff")}
                </li>
                <li>
                  {pub.exchangesEnabled
                    ? t(language, "account.orders.policyExchangesOn").replace(/\{\{n\}\}/g, String(pub.exchangePeriodDays))
                    : t(language, "account.orders.policyExchangesOff")}
                </li>
                {pub.sameDayDeliveryEnabled && pub.sameDayCutoffLocal && (
                  <li>
                    {t(language, "account.orders.policySameDay")
                      .replace(/\{\{t\}\}/g, pub.sameDayCutoffLocal.slice(0, 5))}
                  </li>
                )}
                {pub.customConditions && (
                  <li className="whitespace-pre-wrap list-none -ms-4 mt-2">
                    <span className="text-masa-gray block text-xs mb-1">
                      {t(language, "account.orders.policyConditions")}
                    </span>
                    {pub.customConditions}
                  </li>
                )}
              </ul>
              {order.status === "delivered" && order.delivered_at && (
                <p className="text-xs text-masa-gray mt-3">
                  {t(language, "account.orders.policyDeliveredAt")}{" "}
                  {formatDeadline(order.delivered_at, locale)}
                </p>
              )}
              <OrderReturnExchangeClient
                language={language}
                orderId={order.id}
                storeId={storeId}
                storeName={storeName}
                returnEligible={retElig.eligible}
                exchangeEligible={exElig.eligible}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
