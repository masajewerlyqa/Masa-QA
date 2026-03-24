"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateStoreStatusAction } from "@/lib/admin";
import { useI18n } from "@/components/useI18n";

type StoreRow = { id: string; name: string; slug: string; status: string; location: string | null; product_count: number; created_at: string };

export function StoreActions({ store }: { store: StoreRow }) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function approve() {
    startTransition(async () => {
      const result = await updateStoreStatusAction(store.id, "approved");
      if (result?.ok) router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await updateStoreStatusAction(store.id, "rejected");
      if (result?.ok) router.refresh();
    });
  }

  const isPendingStatus = store.status === "pending";

  return (
    <div className="flex items-center gap-2">
      {isPendingStatus && (
        <>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={approve} disabled={isPending}>
            {t("admin.reviews.approve")}
          </Button>
          <Button size="sm" variant="outline" onClick={reject} disabled={isPending}>
            {t("admin.reviews.reject")}
          </Button>
        </>
      )}
      {store.status === "approved" && (
        <Button size="sm" variant="outline" onClick={reject} disabled={isPending}>
          {t("admin.reviews.reject")}
        </Button>
      )}
      {store.status === "rejected" && (
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={approve} disabled={isPending}>
          {t("admin.reviews.approve")}
        </Button>
      )}
    </div>
  );
}
