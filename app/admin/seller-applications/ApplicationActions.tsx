"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { approveApplication, rejectApplication } from "./actions";
import { useI18n } from "@/components/useI18n";

type ApplicationActionsProps = {
  applicationId: string;
};

export function ApplicationActions({ applicationId }: ApplicationActionsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  async function handleApprove() {
    setError(null);
    setLoading("approve");
    const result = await approveApplication(applicationId);
    setLoading(null);
    if (result.ok) router.refresh();
    else setError(result.error ?? t("seller.reviews.failedApprove"));
  }

  async function handleReject() {
    const trimmed = reason.trim();
    // The seller is emailed this text and has to act on it, so it is required.
    if (!trimmed) {
      setShowReason(true);
      setError("Please give a reason so the seller knows what to correct.");
      return;
    }
    setError(null);
    setLoading("reject");
    const result = await rejectApplication(applicationId, trimmed);
    setLoading(null);
    if (result.ok) {
      setShowReason(false);
      setReason("");
      router.refresh();
    } else {
      setError(result.error ?? t("seller.reviews.failedReject"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
          disabled={!!loading}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {loading === "approve" ? "…" : t("seller.reviews.approve")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
          onClick={() => (showReason ? handleReject() : setShowReason(true))}
          disabled={!!loading}
        >
          <XCircle className="w-4 h-4 mr-1" />
          {loading === "reject" ? "…" : t("seller.reviews.reject")}
        </Button>
      </div>

      {showReason && (
        <div className="flex flex-col gap-1">
          <label htmlFor="reject-reason" className="text-xs text-masa-gray font-sans">
            Reason (sent to the seller)
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. The transfer amount does not match the registration fee."
            className="w-full rounded border border-primary/20 p-2 text-sm font-sans focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
    </div>
  );
}
