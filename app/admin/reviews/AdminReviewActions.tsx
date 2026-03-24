"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateReviewStatusByAdmin } from "./actions";
import { useI18n } from "@/components/useI18n";

interface AdminReviewActionsProps {
  reviewId: string;
  status: "pending" | "approved" | "rejected";
}

export function AdminReviewActions({ reviewId, status }: AdminReviewActionsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onModerate(nextStatus: "approved" | "rejected") {
    startTransition(async () => {
      const result = await updateReviewStatusByAdmin(reviewId, nextStatus);
      if (result.ok) {
        router.refresh();
      } else {
        // Silent failure; admin can retry. Toast could be added later.
        // Keeping UI simple to avoid redesign.
        console.error(result.error);
      }
    });
  }

  const canApprove = status !== "approved";
  const canReject = status !== "rejected";

  return (
    <div className="flex items-center gap-2">
      {canApprove && (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90"
          disabled={isPending}
          onClick={() => onModerate("approved")}
        >
          {t("admin.reviews.approve")}
        </Button>
      )}
      {canReject && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => onModerate("rejected")}
        >
          {t("admin.reviews.reject")}
        </Button>
      )}
    </div>
  );
}

