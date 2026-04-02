"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/useI18n";

export function SellerApplicationExistingBlock({ status }: { status: string }) {
  const { isArabic } = useI18n();
  const isPending = status === "pending";

  return (
    <Card className="w-full max-w-xl border-primary/10 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-luxury text-primary">
          {isArabic ? "طلب البائع" : "Seller application"}
        </CardTitle>
        <CardDescription className="font-sans">
          {isArabic ? "لقد قمت بإرسال طلب سابقًا." : "You have already submitted an application."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 font-sans">
        <p className="text-masa-gray">
          {isArabic ? "الحالة:" : "Status:"}{" "}
          <span className="font-medium text-masa-dark capitalize">{status.replace(/_/g, " ")}</span>
        </p>
        <p className="text-sm text-masa-gray">
          {isPending
            ? isArabic
              ? "سيقوم المشرف بمراجعة طلبك، وسيصلك إشعار عند اتخاذ القرار."
              : "An admin will review your application. You will be notified once a decision is made."
            : isArabic
              ? "إذا كانت لديك أسئلة، يرجى التواصل مع الدعم."
              : "If you have questions, please contact support."}
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">{isArabic ? "العودة للرئيسية" : "Back to home"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
