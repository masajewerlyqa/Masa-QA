"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearCartLocalStorage } from "@/lib/cart-local-storage";
import { useI18n } from "@/components/useI18n";

type VerifyStatus = "loading" | "confirmed" | "processing" | "unverified";

export function PaymentSuccessView() {
  const { t, isArabic } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() ?? "";

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>(sessionId ? "loading" : "unverified");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    async function poll() {
      try {
        const res = await fetch(
          `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as {
          status?: string;
          orderId?: string;
        };

        if (cancelled) return;

        if (data.status === "confirmed") {
          setVerifyStatus("confirmed");
          setOrderId(data.orderId ?? null);
          clearCartLocalStorage();
          router.refresh();
          return;
        }

        if (data.status === "payment_failed" || data.status === "invalid") {
          router.replace("/payment/failed");
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          setVerifyStatus("processing");
          window.setTimeout(poll, 2000);
        } else {
          setVerifyStatus("processing");
        }
      } catch {
        if (!cancelled) {
          attempts += 1;
          if (attempts < maxAttempts) {
            window.setTimeout(poll, 2000);
          } else {
            setVerifyStatus("processing");
          }
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  const title =
    verifyStatus === "confirmed"
      ? t("payment.successTitle")
      : verifyStatus === "processing"
        ? t("payment.successProcessingTitle")
        : t("payment.successUnverifiedTitle");

  const description =
    verifyStatus === "confirmed"
      ? t("payment.successConfirmation")
      : verifyStatus === "processing"
        ? t("payment.successProcessingNote")
        : t("payment.successUnverifiedNote");

  const note =
    verifyStatus === "confirmed"
      ? t("payment.successOrderNote")
      : verifyStatus === "processing"
        ? t("payment.successProcessingHint")
        : t("payment.successUnverifiedHint");

  return (
    <div className="min-h-[60vh] px-4 py-12 md:py-16 flex flex-col items-center">
      <Card className="w-full max-w-lg border-primary/15 shadow-md">
        <CardHeader className="text-center space-y-4 pb-2">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border ${
              verifyStatus === "confirmed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-primary/5 text-primary border-primary/15"
            }`}
          >
            {verifyStatus === "loading" ? (
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            )}
          </div>
          <CardTitle className="text-2xl md:text-3xl font-luxury text-primary">{title}</CardTitle>
          <CardDescription className="text-base font-sans text-masa-gray leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-sans">
          <p className="text-sm text-masa-dark leading-relaxed text-center">{note}</p>
          <div className={`flex flex-col sm:flex-row gap-3 ${isArabic ? "sm:flex-row-reverse" : ""}`}>
            <Button asChild className="bg-primary hover:bg-primary/90 flex-1">
              <Link href="/discover">{t("payment.returnToShop")}</Link>
            </Button>
            {verifyStatus === "confirmed" && orderId ? (
              <Button asChild variant="outline" className="border-primary/25 flex-1">
                <Link href={`/account/orders/${orderId}`}>{t("payment.viewOrder")}</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="border-primary/25 flex-1">
                <Link href="/account/orders">{t("payment.viewOrders")}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
