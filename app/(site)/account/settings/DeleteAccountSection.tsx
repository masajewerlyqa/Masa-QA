"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/useI18n";
import { createClient } from "@/lib/supabase/client";

/**
 * Permanent account deletion, for the Google Play "Delete account URL"
 * requirement.
 *
 * Two-step on purpose: opening the panel is not enough, the user must also type
 * the confirmation word. A single click must never be able to destroy an
 * account.
 *
 * The request carries no user id -- `/api/account/delete` derives the target
 * from the session cookie, so there is nothing here a user could tamper with to
 * delete somebody else.
 */
export function DeleteAccountSection({ ownsStore }: { ownsStore: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const confirmWord = t("account.deleteAccount.confirmWord");
  const canDelete = confirmText.trim().toUpperCase() === confirmWord.toUpperCase();

  async function handleDelete() {
    if (!canDelete || pending) return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!res.ok || !body?.ok) {
        setError(body?.error ?? t("account.deleteAccount.error"));
        setPending(false);
        return;
      }

      // Success. Clear the local session before leaving: the server row is
      // already gone, so a stale cookie would only produce confusing errors.
      setDone(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/delete-account?deleted=1";
    } catch {
      setError(t("account.deleteAccount.error"));
      setPending(false);
    }
  }

  if (done) {
    return (
      <Card className="border-primary/10">
        <CardContent className="py-6">
          <p role="status" className="font-sans text-masa-dark">
            {t("account.deleteAccount.success")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-xl font-luxury text-red-700">
          {t("account.deleteAccount.title")}
        </CardTitle>
        <CardDescription className="font-sans">
          {t("account.deleteAccount.sectionHint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 font-sans">
        {!open ? (
          <Button
            type="button"
            variant="outline"
            className="text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => setOpen(true)}
          >
            {t("account.deleteAccount.buttonLabel")}
          </Button>
        ) : (
          <div className="space-y-4">
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900 space-y-2"
            >
              <p className="flex items-start gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                {t("account.deleteAccount.warningTitle")}
              </p>
              <p className="leading-relaxed">{t("account.deleteAccount.warningBody")}</p>
              {ownsStore ? (
                <p className="leading-relaxed font-medium">
                  {t("account.deleteAccount.sellerWarning")}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 max-w-xs">
              <Label htmlFor="delete-confirm">{t("account.deleteAccount.confirmPrompt")}</Label>
              <Input
                id="delete-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={pending}
                autoComplete="off"
                aria-describedby="delete-confirm-hint"
              />
              <p id="delete-confirm-hint" className="text-xs text-masa-gray">
                {confirmWord}
              </p>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={!canDelete || pending}
                onClick={handleDelete}
              >
                {pending
                  ? t("account.deleteAccount.deleting")
                  : t("account.deleteAccount.confirmCta")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  setConfirmText("");
                  setError(null);
                }}
              >
                {t("account.deleteAccount.cancel")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
