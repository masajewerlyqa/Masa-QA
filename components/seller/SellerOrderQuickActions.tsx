"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { updateOrderStatus } from "@/app/seller/orders/actions";
import { useI18n } from "@/components/useI18n";
import { SELLER_CANCELLATION_REASON_MAX_LEN } from "@/app/seller/orders/constants";

export function SellerOrderQuickActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "accepted");
      if (res.ok) router.refresh();
      else setError(res.error ?? t("common.somethingWentWrong", "Something went wrong."));
    });
  }

  function submitReject() {
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "cancelled", reason.trim() || null);
      if (res.ok) {
        setRejectOpen(false);
        setReason("");
        router.refresh();
        return;
      }
      setError(res.error ?? t("common.somethingWentWrong"));
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button type="button" className="bg-primary hover:bg-primary/90" disabled={pending} onClick={confirm}>
          {t("seller.orders.confirmOrder")}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => setRejectOpen(true)}>
          {t("seller.orders.rejectOrder")}
        </Button>
      </div>
      {error && !rejectOpen && <p className="text-sm text-red-600 font-sans mt-2">{error}</p>}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("seller.orders.rejectOrder")}</DialogTitle>
            <DialogDescription>{t("seller.orders.cancelOptionalHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t("seller.orders.cancellationReasonLabel")}</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={SELLER_CANCELLATION_REASON_MAX_LEN}
              className="border-primary/20"
              disabled={pending}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={pending}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="button" onClick={submitReject} disabled={pending}>
              {t("seller.orders.rejectOrder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
