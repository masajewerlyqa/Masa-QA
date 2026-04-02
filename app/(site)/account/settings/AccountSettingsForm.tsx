"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/useI18n";
import type { Profile } from "@/lib/auth-client";
import type { PhoneVerificationPolicy } from "@/lib/auth/phone-verification";
import { updateProfileAction, updateNewsletterOptInAction } from "./actions";

type Props = {
  profile: Profile;
  email: string | undefined;
  phonePolicy: PhoneVerificationPolicy;
};

export function AccountSettingsForm({ profile, email, phonePolicy }: Props) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newsletterMsg, setNewsletterMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newsletterOptIn, setNewsletterOptIn] = useState(profile.newsletter_opt_in);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setNewsletterOptIn(profile.newsletter_opt_in);
  }, [profile.newsletter_opt_in]);

  function saveNewsletter(next: boolean) {
    setNewsletterMsg(null);
    startTransition(async () => {
      const result = await updateNewsletterOptInAction(next);
      if (!result.ok) {
        setNewsletterOptIn(!next);
        setNewsletterMsg({ type: "err", text: result.error });
        return;
      }
      setNewsletterOptIn(next);
      setNewsletterMsg({ type: "ok", text: t("account.preferenceSaved") });
    });
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const prev = { fullName, phone };
    startTransition(async () => {
      const result = await updateProfileAction({ fullName, phone });
      if (!result.ok) {
        setFullName(prev.fullName);
        setPhone(prev.phone);
        setMessage({ type: "err", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: t("account.profileSaved") });
    });
  }

  const phoneVerified = Boolean(profile.phone_verified_at);
  const hasPhone = Boolean(profile.phone?.trim());

  return (
    <div className="space-y-6">
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-luxury text-primary">{t("account.personalDetails")}</CardTitle>
          <CardDescription className="font-sans">
            {t("account.personalDetailsHint")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
            {message && (
              <div
                role="status"
                className={
                  message.type === "ok"
                    ? "rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm text-masa-dark font-sans"
                    : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-sans"
                }
              >
                {message.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input id="email" type="email" value={email ?? ""} disabled className="bg-masa-light/80" />
              <p className="text-xs text-masa-gray font-sans">
                {t("account.emailHint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("common.fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={pending}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="phone">{t("common.phone")}</Label>
                {hasPhone && (
                  <span
                    className={`text-xs font-sans px-2 py-0.5 rounded ${
                      phoneVerified ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {phoneVerified ? t("common.verified") : t("common.notVerifiedYet")}
                  </span>
                )}
              </div>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={pending}
                autoComplete="tel"
                placeholder={t("account.phonePlaceholder")}
              />
              {phonePolicy.enforcementRequested && phonePolicy.warning && (!hasPhone || !phoneVerified) && (
                <p className="text-xs text-primary font-sans font-medium">{phonePolicy.warning}</p>
              )}
              <p className="text-xs text-masa-gray font-sans">{phonePolicy.hint}</p>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={pending}>
              {pending ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl font-luxury text-primary">{t("account.preferences")}</CardTitle>
            <LanguageSwitcher className="flex items-center gap-2" />
          </div>
          <CardDescription className="font-sans">{t("account.preferencesHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-w-lg">
          {newsletterMsg && (
            <div
              role="status"
              className={
                newsletterMsg.type === "ok"
                  ? "rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm text-masa-dark font-sans"
                  : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-sans"
              }
            >
              {newsletterMsg.text}
            </div>
          )}
          <div className="flex items-start gap-3">
            <Checkbox
              id="settings-newsletter"
              checked={newsletterOptIn}
              onCheckedChange={(v) => {
                const next = v === true;
                setNewsletterOptIn(next);
                saveNewsletter(next);
              }}
              disabled={pending}
              className="mt-0.5"
            />
            <label htmlFor="settings-newsletter" className="text-sm text-masa-dark font-sans leading-snug cursor-pointer">
              {t("account.newsletterOptIn")}
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-luxury text-primary">{t("account.accountSecurity")}</CardTitle>
          <CardDescription className="font-sans">{t("account.accountSecurityHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-sans text-sm text-masa-dark">
          <p>
            <span className="text-masa-gray">{t("account.emailStatus")} </span>
            {t("account.signedInWithEmail")}
          </p>
          <p className="text-masa-gray">
            {t("account.passwordResetHint")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
