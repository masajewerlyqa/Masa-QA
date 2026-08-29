"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markOrderPaymentCollected } from "@/app/seller/orders/actions";

/**
 * Confirms the courier collected cash or ran the card at the door.
 *
 * Separate from the delivery status on purpose: handing the parcel over and
 * being paid are two different events, and a failed collection must not be
 * hidden by marking the order delivered.
 */
export function MarkPaymentCollected({
  orderId,
  paymentStatus,
  orderStatus,
  collectedAt,
  labels,
}: {
  orderId: string;
  paymentStatus: string | null;
  orderStatus: string;
  collectedAt: string | null;
  labels: {
    paid: string;
    pending: string;
    action: string;
    working: string;
    notYet: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (paymentStatus === "paid") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-800 font-sans">
        <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden />
        <span>
          {labels.paid}
          {collectedAt ? ` · ${new Date(collectedAt).toLocaleString()}` : ""}
        </span>
      </div>
    );
  }

  if (paymentStatus === "refunded" || paymentStatus === "failed") {
    return <p className="text-sm text-masa-gray font-sans">{paymentStatus}</p>;
  }

  const collectable = orderStatus === "out_for_delivery" || orderStatus === "delivered";

  return (
    <div className="space-y-2 font-sans">
      <p className="text-sm text-masa-gray">{labels.pending}</p>
      {collectable ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await markOrderPaymentCollected(orderId);
              if (result.ok) router.refresh();
              else setError(result.error ?? null);
            })
          }
          className="bg-primary hover:bg-primary/90"
        >
          {pending ? labels.working : labels.action}
        </Button>
      ) : (
        <p className="text-xs text-masa-gray">{labels.notYet}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
