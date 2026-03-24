"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "./actions";
import { useLanguage } from "@/components/LanguageProvider";
import { normalizeAuthError } from "@/lib/auth-error-messages";

export function ForgotPasswordForm() {
  const { isArabic } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(normalizeAuthError(result.error, isArabic ? "ar" : "en"));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "تحقق من بريدك الإلكتروني" : "Check your email"}</CardTitle>
          <CardDescription className="font-sans">
            {isArabic ? "إذا كان هناك حساب مرتبط بـ" : "If an account exists for"} <strong>{email.trim()}</strong>{isArabic ? " فقد أرسلنا رابطاً آمناً لإعادة تعيين كلمة المرور. تنتهي صلاحية الرابط خلال فترة قصيرة." : ", we sent a secure link to reset your password. The link expires after a short time."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="outline" className="w-full border-primary/20">
              {isArabic ? "العودة إلى تسجيل الدخول" : "Back to sign in"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "إعادة تعيين كلمة المرور" : "Reset password"}</CardTitle>
        <CardDescription className="font-sans">
          {isArabic ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاختيار كلمة مرور جديدة." : "Enter your email and we&apos;ll send you a link to choose a new password."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-sans"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={loading}>
            {loading ? (isArabic ? "جارٍ الإرسال…" : "Sending…") : (isArabic ? "إرسال رابط إعادة التعيين" : "Send reset link")}
          </Button>
        </form>
        <p className="text-center text-sm text-masa-gray font-sans">
          <Link href="/login" className="text-primary hover:underline">
            {isArabic ? "العودة إلى تسجيل الدخول" : "Back to sign in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
