"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { useI18n } from "@/components/useI18n";
import { normalizeAuthError } from "@/lib/auth-error-messages";

export function LoginForm() {
  const router = useRouter();
  const { language, isArabic, t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(normalizeAuthError(signInError.message, language));
        setLoading(false);
        return;
      }

      try {
        await fetch("/api/auth/welcome", { method: "POST" });
      } catch {
        /* welcome is idempotent; non-blocking */
      }

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      const redirectPath = data?.redirectPath ?? "/";
      router.refresh();
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? normalizeAuthError(err.message, language) : t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "مرحباً بعودتك" : "Welcome back"}</CardTitle>
        <CardDescription className="font-sans">{isArabic ? "سجّل الدخول إلى حسابك في MASA" : "Sign in to your MASA account"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialAuthButtons />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 text-masa-gray font-sans">{isArabic ? "أو عبر البريد الإلكتروني" : "or email"}</span>
          </div>
        </div>
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
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={isArabic ? "you@example.com" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label htmlFor="password">{isArabic ? "كلمة المرور" : "Password"}</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-sans">
                {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            disabled={loading}
          >
            {loading ? (isArabic ? "جارٍ تسجيل الدخول…" : "Signing in…") : isArabic ? "تسجيل الدخول" : "Sign in"}
          </Button>
        </form>
        <div className="text-center text-sm text-masa-gray font-sans space-y-2">
          <p>
            {t("auth.login.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t("auth.login.registerToShop")}
            </Link>
          </p>
          <p>
            <Link href="/register?intent=seller" className="text-primary hover:underline font-medium">
              {t("auth.login.registerToSell")}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
