"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/useI18n";

type Props = {
  email: string;
};

/**
 * Only rendered when Supabase reports email not yet confirmed (rare if “Confirm email” is strict).
 * Lets the user enter the 6-digit code emailed by Supabase, or request a fresh one.
 */
export function ResendVerificationEmail({ email }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setVerifyError(null);
    setVerifying(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: trimmed,
        type: "signup",
      });
      if (error) {
        setVerifyError(t("auth.register.invalidCode"));
        return;
      }
      router.refresh();
    } catch {
      setVerifyError(t("auth.register.invalidCode"));
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    setResendMsg(null);
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      setResendMsg(error ? error.message : t("auth.register.codeResent"));
    } catch (e) {
      setResendMsg(e instanceof Error ? e.message : t("common.somethingWentWrong"));
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-2 text-sm font-sans">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t("auth.register.verificationCodePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          disabled={verifying}
          className="sm:w-32 text-center tracking-[0.3em]"
        />
        <Button type="submit" size="sm" disabled={verifying || code.trim().length === 0}>
          {verifying ? t("auth.register.verifyingCode") : t("auth.register.verifyCode")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/20 w-fit"
          onClick={() => void resend()}
          disabled={resending}
        >
          {resending ? t("auth.register.resendingCode") : t("auth.register.resendCode")}
        </Button>
      </div>
      {verifyError && (
        <span role="alert" className="text-red-700">
          {verifyError}
        </span>
      )}
      {resendMsg && <span className="text-masa-gray">{resendMsg}</span>}
    </form>
  );
}
