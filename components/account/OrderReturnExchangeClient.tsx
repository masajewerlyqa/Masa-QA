"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitReturnExchangeRequest } from "@/app/(site)/account/orders/[id]/actions";
import type { Language } from "@/lib/language";
import { t } from "@/lib/i18n";

type Props = {
  language: Language;
  orderId: string;
  storeId: string;
  storeName: string;
  returnEligible: boolean;
  exchangeEligible: boolean;
};

export function OrderReturnExchangeClient({
  language,
  orderId,
  storeId,
  storeName,
  returnEligible,
  exchangeEligible,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  if (!returnEligible && !exchangeEligible) {
    return (
      <p className="text-sm text-masa-gray mt-3">
        {t(language, "account.returnExchange.windowClosed")}
      </p>
    );
  }

  async function send(kind: "return" | "exchange") {
    setFeedback(null);
    startTransition(async () => {
      const res = await submitReturnExchangeRequest(orderId, storeId, kind, msg);
      if (res.ok) {
        setFeedback({ ok: true, text: t(language, "account.returnExchange.sent") });
        setMsg("");
        router.refresh();
      } else {
        const key = res.error;
        const map: Record<string, string> = {
          "account.returnExchange.signInRequired": t(language, "account.returnExchange.signInRequired"),
          "account.returnExchange.messageTooLong": t(language, "account.returnExchange.messageTooLong"),
          "account.returnExchange.orderNotFound": t(language, "account.returnExchange.orderNotFound"),
          "account.returnExchange.unauthorized": t(language, "account.returnExchange.unauthorized"),
          "account.returnExchange.storeNotInOrder": t(language, "account.returnExchange.storeNotInOrder"),
          "account.returnExchange.notEligible": t(language, "account.returnExchange.notEligible"),
        };
        setFeedback({ ok: false, text: map[key] ?? key });
      }
    });
  }

  return (
    <div className="mt-4 space-y-3 border-t border-primary/10 pt-4">
      <p className="text-xs text-masa-gray">
        {t(language, "account.returnExchange.intro").replace(/\{\{store\}\}/g, storeName)}
      </p>
      <div>
        <Label htmlFor={`rer-msg-${storeId}`}>{t(language, "account.returnExchange.messageLabel")}</Label>
        <Textarea
          id={`rer-msg-${storeId}`}
          className="mt-1 min-h-[72px]"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          disabled={pending}
          placeholder={t(language, "account.returnExchange.messagePlaceholder")}
        />
      </div>
      {feedback && (
        <p className={`text-sm ${feedback.ok ? "text-green-700" : "text-red-700"}`}>{feedback.text}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {returnEligible && (
          <Button type="button" variant="outline" disabled={pending} onClick={() => send("return")}>
            {pending ? t(language, "account.returnExchange.sending") : t(language, "account.returnExchange.requestReturn")}
          </Button>
        )}
        {exchangeEligible && (
          <Button type="button" variant="outline" disabled={pending} onClick={() => send("exchange")}>
            {pending ? t(language, "account.returnExchange.sending") : t(language, "account.returnExchange.requestExchange")}
          </Button>
        )}
      </div>
    </div>
  );
}
