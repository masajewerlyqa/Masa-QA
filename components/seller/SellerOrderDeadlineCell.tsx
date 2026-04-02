"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/useI18n";
import { msUntilSellerDeadline } from "@/lib/orders/seller-sla";

function formatRemaining(ms: number, t: (k: string, f?: string) => string): string {
  if (ms <= 0) return t("seller.orders.overdue");
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function SellerOrderDeadlineCell({
  status,
  deadlineIso,
}: {
  status: string;
  deadlineIso: string | null;
}) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status !== "awaiting_seller" || !deadlineIso) return;
    const id = window.setInterval(() => setTick((x) => x + 1), 30000);
    return () => window.clearInterval(id);
  }, [status, deadlineIso]);

  if (status !== "awaiting_seller" || !deadlineIso) {
    return <span className="text-masa-gray text-sm">—</span>;
  }

  const ms = msUntilSellerDeadline(deadlineIso);
  const urgent = ms != null && ms > 0 && ms < 30 * 60 * 1000;

  return (
    <span
      className={`text-xs font-sans ${urgent ? "text-amber-800 font-semibold" : "text-masa-gray"}`}
    >
      {ms != null && ms > 0 ? (
        <>
          {t("seller.orders.timeRemaining")}: {formatRemaining(ms, t)}
        </>
      ) : (
        t("seller.orders.overdue")
      )}
    </span>
  );
}
