"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { repairSellerStoreAction } from "./repair-store-actions";
import { useI18n } from "@/components/useI18n";

export function RepairStoreButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRepair() {
    setError(null);
    setLoading(true);
    try {
      const r = await repairSellerStoreAction();
      if (r.ok) {
        router.refresh();
        return;
      }
      setError(r.error ?? t("seller.overview.repairStoreError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 max-w-md">
      <p className="text-sm text-masa-gray font-sans">{t("seller.overview.repairStoreHint")}</p>
      {error ? (
        <p className="text-sm text-red-700 font-sans" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        className="bg-primary hover:bg-primary/90"
        disabled={loading}
        onClick={onRepair}
      >
        {loading ? t("common.saving") : t("seller.overview.repairStoreButton")}
      </Button>
    </div>
  );
}
