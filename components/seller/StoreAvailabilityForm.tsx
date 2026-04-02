"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/useI18n";
import { saveStoreAvailabilityAction } from "@/app/seller/availability/actions";
import type { StoreLiveStatus } from "@/lib/store-availability";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_INDEX = [0, 1, 2, 3, 4, 5, 6] as const;

type Initial = {
  working_days: number[];
  opening_time: string;
  closing_time: string;
  business_timezone: string;
};

export function StoreAvailabilityForm({
  initial,
  liveStatus,
}: {
  initial: Initial;
  liveStatus: StoreLiveStatus;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [days, setDays] = useState<Set<number>>(new Set(initial.working_days));
  const [open, setOpen] = useState(initial.opening_time);
  const [close, setClose] = useState(initial.closing_time);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleDay(d: number) {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
    setSuccess(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await saveStoreAvailabilityAction({
        working_days: [...days].sort((a, b) => a - b),
        opening_time: open,
        closing_time: close,
        business_timezone: initial.business_timezone || "Asia/Qatar",
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  const statusLabel =
    liveStatus === "open"
      ? t("seller.availability.statusOpenNow")
      : liveStatus === "closed"
        ? t("seller.availability.statusClosedNow")
        : t("seller.availability.statusNotConfigured");

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card className="border-primary/10 shadow-md overflow-hidden">
        <CardHeader className="bg-masa-light/80 border-b border-primary/10">
          <CardTitle className="text-lg font-luxury text-primary flex items-center gap-2">
            <Clock className="w-5 h-5" aria-hidden />
            {t("seller.availability.previewTitle")}
          </CardTitle>
          <CardDescription className="font-sans">{t("seller.availability.previewHint")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div
            className={cn(
              "rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-sans",
              liveStatus === "open"
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
                : liveStatus === "not_configured"
                  ? "border-amber-200 bg-amber-50/90 text-amber-950"
                  : "border-primary/20 bg-white"
            )}
          >
            <span className="font-medium">{statusLabel}</span>
            <span className="text-sm opacity-90">{t("seller.availability.previewBasedOnSaved")}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t("seller.availability.workingDays")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DAY_INDEX.map((idx, i) => {
              const active = days.has(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-sans border transition-colors min-w-[2.75rem]",
                    active
                      ? "bg-primary text-masa-light border-primary"
                      : "bg-masa-light border-primary/15 text-masa-dark hover:border-primary/40"
                  )}
                  aria-pressed={active}
                >
                  {t(`seller.availability.days.${DAY_KEYS[i]}`)}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="open" className="font-sans">
            {t("seller.availability.openingTime")}
          </Label>
          <input
            id="open"
            type="time"
            value={open}
            onChange={(e) => {
              setOpen(e.target.value);
              setSuccess(false);
            }}
            required
            className="flex h-11 w-full rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm font-sans"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="close" className="font-sans">
            {t("seller.availability.closingTime")}
          </Label>
          <input
            id="close"
            type="time"
            value={close}
            onChange={(e) => {
              setClose(e.target.value);
              setSuccess(false);
            }}
            required
            className="flex h-11 w-full rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm font-sans"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-sans flex gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 font-sans flex gap-2 items-center">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
          {t("seller.availability.saveSuccess")}
        </div>
      )}

      <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto min-w-[200px]" disabled={pending}>
        {pending ? t("seller.availability.saving") : t("seller.availability.saveSchedule")}
      </Button>

      <p className="text-xs text-masa-gray font-sans leading-relaxed">{t("seller.availability.timezoneNote")}</p>
    </form>
  );
}
