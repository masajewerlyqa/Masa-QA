"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/useI18n";
import type { OrderExperienceRating } from "@/lib/order-experience-ratings";
import { submitOrderExperienceRating } from "@/app/(site)/account/orders/[id]/actions";

function StarsRow({
  value,
  onChange,
  disabled,
  idPrefix,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  idPrefix: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            id={`${idPrefix}-star-${n}`}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={`p-0.5 rounded transition-colors ${disabled ? "cursor-default" : "cursor-pointer hover:opacity-90"}`}
            aria-label={`${n} stars`}
          >
            <Star className={`w-7 h-7 ${active ? "fill-amber-400 text-amber-500" : "text-masa-gray/40"}`} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "fill-amber-400 text-amber-500" : "text-masa-gray/30"}`}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-2 text-sm font-sans text-masa-dark">{rating}/5</span>
    </div>
  );
}

type Props = {
  orderId: string;
  orderStatus: string;
  existing: OrderExperienceRating | null;
};

export function OrderExperienceRatingCard({ orderId, orderStatus, existing }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [error, setError] = useState<string | null>(null);

  const canRate = orderStatus === "delivered";

  if (!existing && !canRate) {
    return null;
  }

  if (existing) {
    return (
      <Card className="border-primary/10 shadow-sm border-amber-200/40 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="font-luxury text-primary text-lg">{t("account.orders.experienceTitle")}</CardTitle>
          <p className="text-sm text-masa-gray font-sans">{t("account.orders.experienceThanks")}</p>
        </CardHeader>
        <CardContent className="space-y-3 font-sans">
          <StarsDisplay rating={existing.rating} />
          {existing.comment?.trim() ? (
            <p className="text-sm text-masa-dark whitespace-pre-wrap border-t border-primary/10 pt-3">{existing.comment.trim()}</p>
          ) : null}
          {canRate && (
            <form
              className="space-y-3 pt-2 border-t border-primary/10"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                startTransition(async () => {
                  const res = await submitOrderExperienceRating(orderId, rating, comment);
                  if (res.ok) router.refresh();
                  else setError(res.error ? t(res.error, res.error) : t("common.somethingWentWrong"));
                });
              }}
            >
              <div className="space-y-2">
                <Label className="font-sans text-sm">{t("account.orders.updateYourRating")}</Label>
                <StarsRow value={rating} onChange={setRating} disabled={isPending} idPrefix="edit" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-comment-edit" className="font-sans text-sm">
                  {t("account.orders.optionalComment")}
                </Label>
                <Textarea
                  id="exp-comment-edit"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="border-primary/20 font-sans resize-y"
                  disabled={isPending}
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={isPending} variant="outline" className="border-primary/30">
                {isPending ? t("common.loading") : t("account.orders.updateRating")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 shadow-sm border-amber-200/40">
      <CardHeader>
        <CardTitle className="font-luxury text-primary text-lg">{t("account.orders.experienceTitle")}</CardTitle>
        <p className="text-sm text-masa-gray font-sans">{t("account.orders.experienceSubtitle")}</p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            startTransition(async () => {
              const res = await submitOrderExperienceRating(orderId, rating, comment);
              if (res.ok) router.refresh();
              else setError(res.error ? t(res.error, res.error) : t("common.somethingWentWrong"));
            });
          }}
        >
          <div className="space-y-2">
            <Label className="font-sans text-sm text-masa-dark">{t("account.orders.yourExperienceRating")}</Label>
            <StarsRow value={rating} onChange={setRating} disabled={isPending} idPrefix="new" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-comment" className="font-sans text-sm">
              {t("account.orders.optionalComment")}
            </Label>
            <Textarea
              id="exp-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("account.orders.commentPlaceholder")}
              rows={4}
              maxLength={2000}
              className="border-primary/20 font-sans resize-y"
              disabled={isPending}
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isPending}>
            {isPending ? t("common.loading") : t("account.orders.submitExperience")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function OrderExperienceRatingSellerView({ rating }: { rating: OrderExperienceRating }) {
  const { t } = useI18n();
  return (
    <Card className="border-primary/10 shadow-sm border-amber-200/40 bg-amber-50/20">
      <CardHeader>
        <CardTitle className="font-luxury text-primary text-base">{t("seller.orders.buyerExperienceRating")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 font-sans text-sm">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < rating.rating ? "fill-amber-400 text-amber-500" : "text-masa-gray/30"}`}
              strokeWidth={1.5}
            />
          ))}
          <span className="ml-2 text-masa-dark">{rating.rating}/5</span>
        </div>
        {rating.comment?.trim() ? (
          <p className="text-masa-dark whitespace-pre-wrap pt-2 border-t border-primary/10">{rating.comment.trim()}</p>
        ) : (
          <p className="text-masa-gray text-xs">{t("seller.orders.noExperienceComment")}</p>
        )}
      </CardContent>
    </Card>
  );
}
