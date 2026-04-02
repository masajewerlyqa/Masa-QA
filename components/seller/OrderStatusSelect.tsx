"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getSellerNextStatusOptions, SELLER_STATUS_ORDER } from "@/lib/orders/order-transitions";
import { useI18n } from "@/components/useI18n";
import {
  SELLER_CANCELLATION_REASON_MAX_LEN,
  SELLER_CANCELLATION_REASON_MIN_LEN,
} from "@/app/seller/orders/constants";

const LEGACY_STATUSES = ["confirmed"] as const;

function selectableStatuses(currentStatus: string): string[] {
  const allowed = new Set([currentStatus, ...getSellerNextStatusOptions(currentStatus)]);
  const ordered = [...SELLER_STATUS_ORDER, ...LEGACY_STATUSES];
  const filtered = ordered.filter((s) => allowed.has(s));
  return filtered.length > 0 ? filtered : [currentStatus];
}

function statusLabel(status: string, t: (key: string, fallback?: string) => string): string {
  const normalized = status.toLowerCase();
  return t(`order.statuses.${normalized}`, status.replace(/_/g, " "));
}

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useI18n();
  const options = selectableStatuses(currentStatus);

  function onValueChange(value: string) {
    if (value === currentStatus) return;
    if (value === "cancelled") {
      setCancelReason("");
      setSubmitError(null);
      setCancelOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (result.ok) router.refresh();
    });
  }

  function submitCancellation() {
    const trimmed = cancelReason.trim();
    const minRequired = currentStatus === "awaiting_seller" ? 0 : SELLER_CANCELLATION_REASON_MIN_LEN;
    if (trimmed.length < minRequired) {
      setSubmitError(
        t("seller.orders.cancellationReasonTooShort").replace(
          "{min}",
          String(SELLER_CANCELLATION_REASON_MIN_LEN)
        )
      );
      return;
    }
    if (trimmed.length > SELLER_CANCELLATION_REASON_MAX_LEN) {
      setSubmitError(
        t("seller.orders.cancellationReasonTooLong").replace(
          "{max}",
          String(SELLER_CANCELLATION_REASON_MAX_LEN)
        )
      );
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, "cancelled", trimmed);
      if (result.ok) {
        setCancelOpen(false);
        setCancelReason("");
        router.refresh();
        return;
      }
      if (result.error) {
        let msg = result.error;
        if (msg === "seller.orders.cancellationReasonTooShort") {
          msg = t(msg).replace("{min}", String(SELLER_CANCELLATION_REASON_MIN_LEN));
        } else if (msg === "seller.orders.cancellationReasonTooLong") {
          msg = t(msg).replace("{max}", String(SELLER_CANCELLATION_REASON_MAX_LEN));
        } else if (msg.includes(".")) {
          msg = t(msg, msg);
        }
        setSubmitError(msg);
      }
    });
  }

  return (
    <>
      <Select value={currentStatus} onValueChange={onValueChange} disabled={isPending}>
        <SelectTrigger className="w-[180px] font-sans border-primary/20 bg-masa-light">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((s) => (
            <SelectItem key={s} value={s} className="font-sans">
              {statusLabel(s, t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("seller.orders.cancelOrderTitle")}</DialogTitle>
            <DialogDescription>
              {currentStatus === "awaiting_seller"
                ? t("seller.orders.cancelOptionalHint")
                : t("seller.orders.cancelOrderDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">{t("seller.orders.cancellationReasonLabel")}</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t("seller.orders.cancellationReasonPlaceholder")}
              rows={4}
              maxLength={SELLER_CANCELLATION_REASON_MAX_LEN}
              className="resize-y min-h-[100px] border-primary/20"
              disabled={isPending}
            />
            <p className="text-xs text-masa-gray">
              {t("seller.orders.cancellationReasonHint")
                .replace("{min}", String(SELLER_CANCELLATION_REASON_MIN_LEN))
                .replace("{max}", String(SELLER_CANCELLATION_REASON_MAX_LEN))}
            </p>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)} disabled={isPending}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="button" onClick={submitCancellation} disabled={isPending}>
              {isPending ? t("seller.orders.cancellingOrder") : t("seller.orders.confirmCancellation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
