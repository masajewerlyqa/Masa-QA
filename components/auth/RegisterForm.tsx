"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import {
  registerAccountSchema,
  registerCustomerTermsAcceptanceSchema,
  registerMerchantTermsAcceptanceSchema,
} from "@/lib/validations/account";
import { SocialAuthButtons } from "./SocialAuthButtons";
import type { RegisterPath } from "./RegisterPathChoice";
import { useI18n } from "@/components/useI18n";
import { normalizeAuthError } from "@/lib/auth-error-messages";
import { CUSTOMER_TERMS_VERSION } from "@/lib/legal/customer-terms-version";
import { MERCHANT_TERMS_VERSION } from "@/lib/legal/merchant-terms-version";
import { CustomerTermsModal } from "@/components/legal/CustomerTermsModal";
import { MerchantTermsModal } from "@/components/legal/MerchantTermsModal";
import type { SellerPlanId } from "@/lib/seller-plans";

type RegisterFormProps = {
  /** When "seller", after signup redirect to /apply; profile role is pending_seller until admin approves (then seller). */
  intent?: RegisterPath;
  /** Required when intent is seller (chosen on the previous step). Stored as profiles.pending_seller_plan. */
  selectedSellerPlan?: SellerPlanId;
  /** If set, show a back button to return to path choice (used when intent was chosen on same page). */
  onBack?: () => void;
};

export function RegisterForm({ intent, selectedSellerPlan, onBack }: RegisterFormProps) {
  const router = useRouter();
  const { isArabic, t } = useI18n();
  const isCustomer = intent !== "seller";
  const isSeller = intent === "seller";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [acceptMerchantTerms, setAcceptMerchantTerms] = useState(false);
  const [merchantTermsModalOpen, setMerchantTermsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Email confirmation required before a session exists (Supabase “Confirm email”). */
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const baseParsed = registerAccountSchema.safeParse({ fullName, email, phone, password });
    if (!baseParsed.success) {
      const first = baseParsed.error.flatten().fieldErrors;
      const msg =
        first.fullName?.[0] ||
        first.email?.[0] ||
        first.phone?.[0] ||
        first.password?.[0] ||
        t("auth.register.pleaseCheckDetails");
      setError(msg);
      return;
    }

    if (isCustomer) {
      const termsParsed = registerCustomerTermsAcceptanceSchema.safeParse({ acceptTerms });
      if (!termsParsed.success) {
        setError(t("auth.register.terms.validationError"));
        return;
      }
    }

    if (isSeller) {
      const mParsed = registerMerchantTermsAcceptanceSchema.safeParse({ acceptMerchantTerms });
      if (!mParsed.success) {
        setError(t("auth.register.merchantTerms.validationError"));
        return;
      }
      if (!selectedSellerPlan) {
        setError(t("auth.register.sellerPlanRequired"));
        return;
      }
    }

    const parsed = baseParsed;

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(intent === "seller" ? "/apply" : "/account")}`;

      const acceptedAt = new Date().toISOString();
      const userData: Record<string, unknown> = {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        newsletter_opt_in: newsletterOptIn,
        registration_intent: intent === "seller" ? "seller" : "buyer",
      };
      if (isCustomer) {
        userData.signup_channel = "email";
        userData.customer_terms_accepted = "true";
        userData.customer_terms_version = CUSTOMER_TERMS_VERSION;
        userData.customer_terms_accepted_at = acceptedAt;
      }
      if (isSeller) {
        userData.signup_channel = "email";
        userData.merchant_terms_accepted = "true";
        userData.merchant_terms_version = MERCHANT_TERMS_VERSION;
        userData.merchant_terms_accepted_at = acceptedAt;
        userData.pending_seller_plan = selectedSellerPlan;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: userData as {
            full_name: string;
            phone: string;
            newsletter_opt_in: boolean;
            registration_intent: string;
            signup_channel?: string;
            customer_terms_accepted?: string;
            customer_terms_version?: string;
            customer_terms_accepted_at?: string;
            merchant_terms_accepted?: string;
            merchant_terms_version?: string;
            merchant_terms_accepted_at?: string;
            pending_seller_plan?: string;
          },
          emailRedirectTo,
        },
      });

      if (signUpError) {
        const raw = signUpError.message ?? "";
        if (raw.includes("SELLER_PLAN_REQUIRED")) {
          setError(t("auth.register.sellerPlanRequired"));
        } else if (raw.includes("MERCHANT_TERMS_REQUIRED")) {
          setError(t("auth.register.merchantTerms.registrationBlocked"));
        } else if (raw.includes("CUSTOMER_TERMS_REQUIRED")) {
          setError(t("auth.register.terms.registrationBlocked"));
        } else if (raw.toLowerCase().includes("terms")) {
          setError(t("auth.register.terms.registrationBlocked"));
        } else {
          setError(normalizeAuthError(raw, isArabic ? "ar" : "en"));
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // No session until user confirms email (if enabled in Supabase Auth).
        if (!data.session) {
          setAwaitingEmailVerification(true);
          setLoading(false);
          return;
        }

        try {
          await fetch("/api/auth/welcome", { method: "POST" });
        } catch {
          /* non-blocking */
        }
        router.refresh();
        if (intent === "seller") {
          router.push("/apply");
        } else {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          const me = await res.json();
          const redirectPath = me?.redirectPath ?? "/account";
          router.push(redirectPath);
        }
      }
    } catch (err) {
      setError(normalizeAuthError(err instanceof Error ? err.message : null, isArabic ? "ar" : "en"));
    } finally {
      setLoading(false);
    }
  }

  if (awaitingEmailVerification) {
    return (
      <Card className="w-full max-w-md border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-luxury text-primary">{t("auth.register.verifyEmail")}</CardTitle>
          <CardDescription className="font-sans text-left">
            {t("auth.register.sentVerificationTo")} <strong className="text-masa-dark">{email.trim()}</strong>.{" "}
            {t("auth.register.verifyEmailHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-masa-gray font-sans">
            {t("auth.register.didntReceiveEmail")}
          </p>
          <Button variant="outline" className="w-full border-primary/20 font-sans" asChild>
            <Link href="/login?registered=1">{t("auth.register.continueToSignIn")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-primary/10 shadow-sm">
      <CustomerTermsModal open={termsModalOpen} onOpenChange={setTermsModalOpen} />
      <MerchantTermsModal open={merchantTermsModalOpen} onOpenChange={setMerchantTermsModalOpen} />
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-luxury text-primary">
          {intent === "seller" ? t("auth.register.createAccountToApplySeller") : t("auth.register.createAccount")}
        </CardTitle>
        <CardDescription className="font-sans space-y-1">
          {intent === "seller" ? (
            <>
              <span className="block">{t("auth.register.sellerNextStep")}</span>
              {selectedSellerPlan ? (
                <span className="block text-primary font-medium">
                  {t("auth.register.selectedPlanLabel")}:{" "}
                  {selectedSellerPlan === "basic" ? t("sellerOnboarding.basicName") : t("sellerOnboarding.premiumName")}
                </span>
              ) : null}
            </>
          ) : (
            t("auth.register.joinMasa")
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {onBack && (
          <Button type="button" variant="ghost" size="sm" className="text-masa-gray -mt-2" onClick={onBack}>
            {`← ${t("auth.register.changeAccountType")}`}
          </Button>
        )}
        <SocialAuthButtons
          nextPath={intent === "seller" ? "/apply" : "/account"}
          pendingSellerPlan={intent === "seller" ? selectedSellerPlan : undefined}
        />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 text-masa-gray font-sans">{t("auth.register.orRegisterWithEmail")}</span>
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
            <Label htmlFor="name">{isArabic ? "الاسم الكامل" : "Full name"}</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{isArabic ? "رقم الهاتف" : "Phone"}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+974 0000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              autoComplete="tel"
              required
            />
            <p className="text-xs text-masa-gray font-sans">
              {t("auth.register.phoneVerificationHint")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{isArabic ? "كلمة المرور" : "Password"}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-masa-gray font-sans">{t("auth.register.passwordHint")}</p>
          </div>
          {isCustomer ? (
            <div
              className={`rounded-xl border border-primary/15 bg-masa-light/40 px-4 py-3.5 space-y-3 ${isArabic ? "text-right" : "text-left"}`}
              dir={isArabic ? "rtl" : "ltr"}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(v) => setAcceptTerms(v === true)}
                  disabled={loading}
                  className="mt-0.5 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="accept-terms" className="text-sm text-masa-dark font-sans leading-relaxed cursor-pointer select-none">
                  <span className="text-masa-dark/90">{t("auth.register.terms.checkboxLabel")}{" "}</span>
                  <button
                    type="button"
                    className="text-primary font-medium underline underline-offset-2 hover:text-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setTermsModalOpen(true);
                    }}
                  >
                    {t("auth.register.terms.linkLabel")}
                  </button>
                </label>
              </div>
            </div>
          ) : null}
          {isSeller ? (
            <div
              className={`rounded-xl border border-primary/15 bg-masa-light/40 px-4 py-3.5 space-y-3 ${isArabic ? "text-right" : "text-left"}`}
              dir={isArabic ? "rtl" : "ltr"}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-merchant-terms"
                  checked={acceptMerchantTerms}
                  onCheckedChange={(v) => setAcceptMerchantTerms(v === true)}
                  disabled={loading}
                  className="mt-0.5 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="accept-merchant-terms"
                  className="text-sm text-masa-dark font-sans leading-relaxed cursor-pointer select-none"
                >
                  <span className="text-masa-dark/90">{t("auth.register.merchantTerms.checkboxLabel")}{" "}</span>
                  <button
                    type="button"
                    className="text-primary font-medium underline underline-offset-2 hover:text-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setMerchantTermsModalOpen(true);
                    }}
                  >
                    {t("auth.register.merchantTerms.linkLabel")}
                  </button>
                </label>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="newsletter"
              checked={newsletterOptIn}
              onCheckedChange={(v) => setNewsletterOptIn(v === true)}
              disabled={loading}
              className="mt-0.5"
            />
            <label htmlFor="newsletter" className="text-sm text-masa-gray font-sans leading-snug cursor-pointer">
              {t("auth.register.newsletterOptIn")}
            </label>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            disabled={loading}
          >
            {loading ? t("auth.register.creatingAccount") : t("auth.register.createAccountBtn")}
          </Button>
        </form>
        <p className="text-center text-sm text-masa-gray font-sans">
          {t("auth.register.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("auth.register.signIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
