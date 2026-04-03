"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { useI18n } from "@/components/useI18n";
import { normalizeAuthError } from "@/lib/auth-error-messages";

async function notifyPasswordChanged(): Promise<void> {
  await fetch("/api/auth/security-notice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "password_changed" }) });
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const { isArabic } = useLanguage();
  const { t } = useI18n();
  const brand = t("common.brand");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(isArabic ? "استخدم 8 أحرف على الأقل." : "Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError(isArabic ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(normalizeAuthError(updateError.message, isArabic ? "ar" : "en"));
        setLoading(false);
        return;
      }
      try {
        await notifyPasswordChanged();
      } catch {
        /* optional email */
      }
      router.refresh();
      router.push("/account?password=updated");
    } catch (err) {
      setError(normalizeAuthError(err instanceof Error ? err.message : null, isArabic ? "ar" : "en"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "كلمة مرور جديدة" : "New password"}</CardTitle>
        <CardDescription className="font-sans">
          {isArabic ? `اختر كلمة مرور قوية لحسابك في ${brand}.` : `Choose a strong password for your ${brand} account.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="password">{isArabic ? "كلمة المرور الجديدة" : "New password"}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">{isArabic ? "تأكيد كلمة المرور" : "Confirm password"}</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={loading}>
            {loading ? (isArabic ? "جارٍ الحفظ…" : "Saving…") : (isArabic ? "تحديث كلمة المرور" : "Update password")}
          </Button>
        </form>
        <p className="text-center text-sm text-masa-gray font-sans mt-4">
          <Link href="/login" className="text-primary hover:underline">
            {isArabic ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
