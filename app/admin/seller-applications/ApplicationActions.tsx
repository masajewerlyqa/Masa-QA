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

  async function handleApprove() {
    setError(null);
    setLoading("approve");
    const result = await approveApplication(applicationId);
    setLoading(null);
    if (result.ok) router.refresh();
    else setError(result.error ?? t("seller.reviews.failedApprove"));
  }

  async function handleReject() {
    setError(null);
    setLoading("reject");
    const result = await rejectApplication(applicationId);
    setLoading(null);
    if (result.ok) router.refresh();
    else setError(result.error ?? t("seller.reviews.failedReject"));
  }

  return (
    <div className="flex flex-col gap-1">
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
          onClick={handleReject}
          disabled={!!loading}
        >
          <XCircle className="w-4 h-4 mr-1" />
          {loading === "reject" ? "…" : t("seller.reviews.reject")}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-600 font-sans">{error}</p>
      )}
    </div>
  );
}
