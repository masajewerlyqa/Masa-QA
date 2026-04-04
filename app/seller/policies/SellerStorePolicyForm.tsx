"use client";

import { useState } from "react";
import { useI18n } from "@/components/useI18n";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSellerStorePolicy, type StorePolicyFormPayload } from "./actions";

type Props = {
  store: {
    returns_enabled: boolean;
    exchanges_enabled: boolean;
    return_period_days: number;
    exchange_period_days: number;
    policy_custom_conditions: string;
    same_day_delivery_enabled: boolean;
    same_day_cutoff_local: string;
    store_policy_updated_at: string | null;
  };
  cooldownDays: number;
  policyLockedUntilIso: string | null;
  activeOrdersBlock: boolean;
};

function cutoffForInput(isoOrTime: string): string {
  const s = isoOrTime.trim();
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  const m = /^(\d{2}:\d{2})/.exec(s);
  return m ? m[1]! : "14:00";
}

export function SellerStorePolicyForm({
  store,
  cooldownDays,
  policyLockedUntilIso,
  activeOrdersBlock,
}: Props) {
  const { t } = useI18n();
  const [returnsEnabled, setReturnsEnabled] = useState(store.returns_enabled);
  const [exchangesEnabled, setExchangesEnabled] = useState(store.exchanges_enabled);
  const [returnDays, setReturnDays] = useState(String(store.return_period_days));
  const [exchangeDays, setExchangeDays] = useState(String(store.exchange_period_days));
  const [conditions, setConditions] = useState(store.policy_custom_conditions);
  const [sameDay, setSameDay] = useState(store.same_day_delivery_enabled);
  const [cutoff, setCutoff] = useState(cutoffForInput(store.same_day_cutoff_local));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const locked = policyLockedUntilIso != null;
  const disabled = saving || locked || activeOrdersBlock;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const payload: StorePolicyFormPayload = {
      returns_enabled: returnsEnabled,
      exchanges_enabled: exchangesEnabled,
      return_period_days: Number(returnDays),
      exchange_period_days: Number(exchangeDays),
      policy_custom_conditions: conditions,
      same_day_delivery_enabled: sameDay,
      same_day_cutoff_local: cutoff,
    };
    const res = await updateSellerStorePolicy(payload);
    setSaving(false);
    if (res.ok) {
      setMessage({ type: "ok", text: t("seller.policies.saved") });
    } else {
      const key = res.error;
      const map: Record<string, string> = {
        "seller.policies.badReturnDays": t("seller.policies.badReturnDays"),
        "seller.policies.badExchangeDays": t("seller.policies.badExchangeDays"),
        "seller.policies.conditionsTooLong": t("seller.policies.conditionsTooLong"),
        "seller.policies.cooldownActive": t("seller.policies.cooldownActive"),
        "seller.policies.activeOrdersBlock": t("seller.policies.activeOrdersBlock"),
      };
      setMessage({ type: "err", text: map[key] ?? key });
    }
  }

  const lockDate =
    policyLockedUntilIso != null
      ? new Date(policyLockedUntilIso).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

  return (
    <form onSubmit={onSubmit} className="space-y-8 font-sans">
      {activeOrdersBlock && (
        <div className="rounded-lg border border-amber-200/90 bg-amber-50/50 p-4 text-sm">
          <p className="font-medium text-primary font-luxury">{t("seller.policies.activeOrdersTitle")}</p>
          <p className="text-masa-dark mt-1">{t("seller.policies.activeOrdersBody")}</p>
        </div>
      )}

      {locked && lockDate && (
        <div className="rounded-lg border border-primary/15 bg-masa-light p-4 text-sm">
          <p className="font-medium text-primary font-luxury">{t("seller.policies.lockedTitle")}</p>
          <p className="text-masa-dark mt-1">
            {t("seller.policies.lockedBody")
              .replace(/\{\{date\}\}/g, lockDate)
              .replace(/\{\{days\}\}/g, String(cooldownDays))}
          </p>
        </div>
      )}

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === "err"
              ? "border-red-200 bg-red-50/50 text-red-900"
              : "border-primary/15 bg-masa-light text-masa-dark"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="font-luxury text-primary text-lg">{t("seller.policies.returnsExchanges")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="returns-enabled">{t("seller.policies.returnsEnabled")}</Label>
              <p className="text-sm text-masa-gray mt-1">{t("seller.policies.returnsEnabledHint")}</p>
            </div>
            <Checkbox
              id="returns-enabled"
              checked={returnsEnabled}
              onCheckedChange={(v) => setReturnsEnabled(v === true)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="exchanges-enabled">{t("seller.policies.exchangesEnabled")}</Label>
              <p className="text-sm text-masa-gray mt-1">{t("seller.policies.exchangesEnabledHint")}</p>
            </div>
            <Checkbox
              id="exchanges-enabled"
              checked={exchangesEnabled}
              onCheckedChange={(v) => setExchangesEnabled(v === true)}
              disabled={disabled}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="return-days">{t("seller.policies.returnPeriodDays")}</Label>
              <select
                id="return-days"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={returnDays}
                onChange={(e) => setReturnDays(e.target.value)}
                disabled={disabled}
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <p className="text-xs text-masa-gray mt-1">{t("seller.policies.periodFromDelivery")}</p>
            </div>
            <div>
              <Label htmlFor="exchange-days">{t("seller.policies.exchangePeriodDays")}</Label>
              <select
                id="exchange-days"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={exchangeDays}
                onChange={(e) => setExchangeDays(e.target.value)}
                disabled={disabled}
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <p className="text-xs text-masa-gray mt-1">{t("seller.policies.periodFromDelivery")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="font-luxury text-primary text-lg">{t("seller.policies.conditionsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="conditions">{t("seller.policies.customConditions")}</Label>
          <Textarea
            id="conditions"
            className="mt-2 min-h-[120px]"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            disabled={disabled}
            placeholder={t("seller.policies.customConditionsPlaceholder")}
          />
          <p className="text-xs text-masa-gray mt-2">{t("seller.policies.customConditionsHint")}</p>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="font-luxury text-primary text-lg">{t("seller.policies.sameDayTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="same-day">{t("seller.policies.sameDayEnabled")}</Label>
              <p className="text-sm text-masa-gray mt-1">{t("seller.policies.sameDayHint")}</p>
            </div>
            <Checkbox
              id="same-day"
              checked={sameDay}
              onCheckedChange={(v) => setSameDay(v === true)}
              disabled={disabled}
            />
          </div>
          {sameDay && (
            <div>
              <Label htmlFor="cutoff">{t("seller.policies.cutoffTime")}</Label>
              <input
                id="cutoff"
                type="time"
                className="mt-2 w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cutoff}
                onChange={(e) => setCutoff(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-masa-gray mt-1">{t("seller.policies.cutoffHint")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border border-primary/10 bg-masa-light/50 p-4 text-sm text-masa-gray">
        <p>{t("seller.policies.rulesReminder").replace(/\{\{days\}\}/g, String(cooldownDays))}</p>
      </div>

      <Button type="submit" className="bg-primary" disabled={disabled}>
        {saving ? t("seller.policies.saving") : t("seller.policies.save")}
      </Button>
    </form>
  );
}
