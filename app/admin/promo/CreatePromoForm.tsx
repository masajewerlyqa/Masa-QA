"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPromoCode } from "./actions";
import { useI18n } from "@/components/useI18n";

type StoreOption = { id: string; name: string };

export function CreatePromoForm({ stores }: { stores: StoreOption[] }) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createPromoCode(formData);
      if (result.ok) {
        form.reset();
        router.refresh();
      } else {
        alert(result.error ?? t("admin.promo.failedCreate"));
      }
    });
  }

  return (
    <Card className="border-primary/10 shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="font-luxury text-primary">{t("admin.promo.create")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">{t("admin.promo.code")}</Label>
              <Input
                id="promo-code"
                name="code"
                placeholder="SAVE10"
                required
                className="font-sans border-primary/20 uppercase"
                maxLength={32}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-type">{t("admin.promo.type")}</Label>
              <select
                id="promo-type"
                name="type"
                className="flex h-9 w-full rounded-md border border-primary/20 bg-masa-light px-3 py-1 text-sm font-sans"
              >
                <option value="percentage">{t("admin.promo.percentage")}</option>
                <option value="fixed">{t("admin.promo.fixedAmount")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-value">{t("admin.promo.value")}</Label>
              <Input
                id="promo-value"
                name="value"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder={undefined}
                className="font-sans border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-store">{t("admin.promo.storeOptional")}</Label>
              <select
                id="promo-store"
                name="store_id"
                className="flex h-9 w-full rounded-md border border-primary/20 bg-masa-light px-3 py-1 text-sm font-sans"
              >
                <option value="">{t("admin.promo.platformWide")}</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-min">{t("admin.promo.minOrder")}</Label>
              <Input
                id="promo-min"
                name="min_order_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="font-sans border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-limit">{t("admin.promo.usageLimitOptional")}</Label>
              <Input
                id="promo-limit"
                name="usage_limit"
                type="number"
                min="1"
                placeholder={t("admin.promo.unlimited")}
                className="font-sans border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-starts">{t("admin.promo.startsAtOptional")}</Label>
              <Input
                id="promo-starts"
                name="starts_at"
                type="datetime-local"
                className="font-sans border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-expires">{t("admin.promo.expiresAtOptional")}</Label>
              <Input
                id="promo-expires"
                name="expires_at"
                type="datetime-local"
                className="font-sans border-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="promo-active"
              name="active"
              value="on"
              defaultChecked
              className="rounded border-primary/20"
            />
            <Label htmlFor="promo-active" className="font-normal">{t("admin.promo.active")}</Label>
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isPending}>
            {isPending ? t("admin.promo.creating") : t("admin.promo.create")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
