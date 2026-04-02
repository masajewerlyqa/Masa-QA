"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/useI18n";

/** Shown when an unauthenticated user opens Become a Seller flows. */
export function SellerApplySignInCard() {
  const { isArabic } = useI18n();

  return (
    <Card className="w-full max-w-xl border-primary/10 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-luxury text-primary">
          {isArabic ? "انضم كبائع" : "Become a seller"}
        </CardTitle>
        <CardDescription className="font-sans">
          {isArabic ? "سجّل الدخول لاختيار خطة وإرسال طلب البائع." : "Sign in to choose a plan and submit your seller application."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 font-sans">
        <Button asChild className="w-full bg-primary hover:bg-primary/90" size="lg">
          <Link href="/login">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link>
        </Button>
        <p className="text-center text-sm text-masa-gray">
          {isArabic ? "ليس لديك حساب؟" : "Don&apos;t have an account?"}{" "}
          <Link href="/register?intent=seller" className="text-primary hover:underline">
            {isArabic ? "إنشاء حساب" : "Register"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
