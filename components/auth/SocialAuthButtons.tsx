"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

type Provider = "google" | "apple";

function providerLabel(p: Provider, isArabic: boolean): string {
  switch (p) {
    case "google":
      return isArabic ? "المتابعة عبر Google" : "Continue with Google";
    case "apple":
      return isArabic ? "المتابعة عبر Apple" : "Continue with Apple";
    default:
      return isArabic ? "متابعة" : "Continue";
  }
}

export function SocialAuthButtons({ nextPath = "/account" }: { nextPath?: string }) {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: Provider) {
    setError(null);
    setLoading(provider);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(null);
        return;
      }
      // Ensure navigation (some browsers/extensions block assign inside async)
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        setError(
          isArabic
            ? "تعذر بدء تسجيل الدخول. فعّل Google/Apple في Supabase وأضف رابط إعادة التوجيه."
            : "Could not start sign-in. Enable Google/Apple in Supabase and add your redirect URL."
        );
        setLoading(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : isArabic ? "فشل تسجيل الدخول" : "Sign-in failed");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-sans"
        >
          {error}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full border-primary/20 font-sans"
        disabled={loading !== null}
        onClick={() => signIn("google")}
      >
        {loading === "google" ? (isArabic ? "جارٍ التحويل..." : "Redirecting…") : providerLabel("google", isArabic)}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full border-primary/20 font-sans"
        disabled={loading !== null}
        onClick={() => signIn("apple")}
      >
        {loading === "apple" ? (isArabic ? "جارٍ التحويل..." : "Redirecting…") : providerLabel("apple", isArabic)}
      </Button>
      <p className="text-xs text-center text-masa-gray font-sans">
        {isArabic
          ? "يعتمد تسجيل الدخول عبر Apple وGoogle على اسمك وبريدك لدى المزوّد. يمكنك إضافة رقم هاتفك من إعدادات الحساب في أي وقت."
          : "Apple and Google sign-in use your provider name and email. You can add your phone in account settings anytime."}
      </p>
    </div>
  );
}
