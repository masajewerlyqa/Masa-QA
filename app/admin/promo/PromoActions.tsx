"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updatePromoActive, deletePromoCode } from "./actions";
import type { AdminPromoRow } from "@/lib/admin";
import { useI18n } from "@/components/useI18n";

export function PromoActions({ promo }: { promo: AdminPromoRow }) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleActive() {
    startTransition(async () => {
      const result = await updatePromoActive(promo.id, !promo.active);
      if (result?.ok) router.refresh();
    });
  }

  function remove() {
    if (!confirm(t("admin.promo.deleteConfirm").replace("{code}", promo.code))) return;
    startTransition(async () => {
      const result = await deletePromoCode(promo.id);
      if (result?.ok) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={toggleActive}
        disabled={isPending}
      >
        {promo.active ? t("admin.promo.deactivate") : t("admin.promo.activate")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={remove}
        disabled={isPending}
      >
        {t("admin.promo.delete")}
      </Button>
    </div>
  );
}
