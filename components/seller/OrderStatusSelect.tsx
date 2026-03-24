"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/app/seller/orders/actions";
import { getSellerNextStatusOptions, SELLER_STATUS_ORDER } from "@/lib/orders/order-transitions";
import { useI18n } from "@/components/useI18n";

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
  const router = useRouter();
  const { t } = useI18n();
  const options = selectableStatuses(currentStatus);

  function onValueChange(value: string) {
    if (value === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (result.ok) router.refresh();
    });
  }

  return (
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
  );
}
