"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/useI18n";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "warning" | "success"> = {
  pending: "outline",
  accepted: "secondary",
  processing: "secondary",
  shipped: "secondary",
  delivered: "success",
  cancelled: "warning",
  refunded: "outline",
  // legacy
  confirmed: "secondary",
};

function formatLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderStatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANTS[status.toLowerCase()] ?? "outline";
  const { t } = useI18n();
  const normalized = status.toLowerCase();
  const label = t(`order.statuses.${normalized}`, formatLabel(status));
  return (
    <Badge variant={variant} className="font-sans capitalize">
      {label}
    </Badge>
  );
}
