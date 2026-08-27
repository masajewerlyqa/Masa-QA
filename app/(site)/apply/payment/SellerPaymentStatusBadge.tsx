/**
 * Status badge for the seller application payment state machine.
 * Shared vocabulary with the admin view so both sides describe a row the same way.
 */

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending_payment: {
    label: "Awaiting payment",
    className: "bg-amber-50 text-amber-900 border-amber-200",
  },
  payment_proof_submitted: {
    label: "Proof submitted",
    className: "bg-blue-50 text-blue-900 border-blue-200",
  },
  under_review: {
    label: "Under review",
    className: "bg-blue-50 text-blue-900 border-blue-200",
  },
  approved: {
    label: "Active",
    className: "bg-green-50 text-green-900 border-green-200",
  },
  rejected: {
    label: "Action required",
    className: "bg-red-50 text-red-900 border-red-200",
  },
  expired: {
    label: "Expired",
    className: "bg-neutral-100 text-neutral-700 border-neutral-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-neutral-100 text-neutral-700 border-neutral-300",
  },
  // Applications created before the payment flow existed.
  pending: {
    label: "Submitted",
    className: "bg-neutral-100 text-neutral-700 border-neutral-300",
  },
};

export function SellerPaymentStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className={`inline-block text-xs font-sans px-2.5 py-1 rounded border ${style.className}`}
    >
      {style.label}
    </span>
  );
}
