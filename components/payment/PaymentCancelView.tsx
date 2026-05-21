"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/useI18n";

export function PaymentCancelView() {
  const { t } = useI18n();

  return (
    <div className="min-h-[60vh] px-4 py-12 md:py-16 flex flex-col items-center">
      <Card className="w-full max-w-lg border-primary/15 shadow-md">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
            <XCircle className="h-8 w-8" aria-hidden />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-luxury text-primary">
            {t("payment.cancelTitle")}
          </CardTitle>
          <CardDescription className="text-base font-sans text-masa-gray leading-relaxed">
            {t("payment.cancelMessage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="font-sans">
          <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90">
            <Link href="/discover">{t("payment.returnToShop")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
