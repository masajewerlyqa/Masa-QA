"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateReviewStatus } from "./actions";
import { useI18n } from "@/components/useI18n";

export function ReviewActions({ reviewId, status }: { reviewId: string; status: string }) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function approve() {
    startTransition(async () => {
      const result = await updateReviewStatus(reviewId, "approved");
      if (result?.ok) router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await updateReviewStatus(reviewId, "rejected");
      if (result?.ok) router.refresh();
    });
  }

  const isPendingStatus = status === "pending";

  return (
    <div className="flex items-center gap-2">
      {(isPendingStatus || status === "rejected") && (
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={approve} disabled={isPending}>
          {t("seller.reviews.approve")}
        </Button>
      )}
      {(isPendingStatus || status === "approved") && (
        <Button size="sm" variant="outline" onClick={reject} disabled={isPending}>
          {t("seller.reviews.reject")}
        </Button>
      )}
    </div>
  );
}
