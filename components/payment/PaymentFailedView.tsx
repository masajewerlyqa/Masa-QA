"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/useI18n";

export function PaymentFailedView() {
  const { t } = useI18n();

  return (
    <div className="min-h-[60vh] px-4 py-12 md:py-16 flex flex-col items-center">
      <Card className="w-full max-w-lg border-primary/15 shadow-md">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-200/80">
            <AlertCircle className="h-8 w-8" aria-hidden />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-luxury text-primary">
            {t("payment.failedTitle")}
          </CardTitle>
          <CardDescription className="text-base font-sans text-masa-gray leading-relaxed">
            {t("payment.failedMessage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-sans">
          <p className="text-sm text-masa-dark text-center leading-relaxed">{t("payment.failedHint")}</p>
          <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90">
            <Link href="/cart">{t("payment.backToCart")}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11 border-primary/25">
            <Link href="/discover">{t("payment.returnToShop")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
