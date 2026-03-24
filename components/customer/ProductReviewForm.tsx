"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProductReview } from "@/lib/reviews";
import { submitReview } from "@/app/(site)/product/[id]/actions";
import { useI18n } from "@/components/useI18n";

export function ProductReviewForm({
  productId,
  existingReview,
}: {
  productId: string;
  existingReview: ProductReview | null;
}) {
  const { t } = useI18n();
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 5);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    if (!rating) return;
    setError(null);
    formData.set("rating", String(rating));
    formData.set("productId", productId);
    startTransition(async () => {
      const result = await submitReview(formData);
      if (result?.ok) {
        router.refresh();
      } else if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600 font-sans">{error}</p>
      )}
      <div className="space-y-2">
        <Label className="font-sans text-sm text-masa-dark">{t("common.rating", "Your rating")}</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const active = value <= rating;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="p-0.5"
                aria-label={`${value} ${t("common.stars", "stars")}`}
              >
                <Star
                  className={`w-5 h-5 ${
                    active ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewTitle" className="font-sans">
          {t("common.titleOptional", "Title (optional)")}
        </Label>
        <Input
          id="reviewTitle"
          name="title"
          placeholder={t("common.reviewTitlePlaceholder", "A beautiful piece of jewelry")}
          defaultValue={existingReview?.title ?? ""}
          className="font-sans border-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewBody" className="font-sans">
          {t("common.commentOptional", "Comment (optional)")}
        </Label>
        <Textarea
          id="reviewBody"
          name="body"
          placeholder={t("common.reviewBodyPlaceholder", "Share details about the craftsmanship, fit or experience.")}
          defaultValue={existingReview?.body ?? ""}
          rows={4}
          className="font-sans border-primary/20"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !rating}
        className="bg-primary hover:bg-primary/90 font-sans"
      >
        {existingReview ? t("common.updateReview", "Update review") : t("common.submitReview", "Submit review")}
      </Button>
    </form>
  );
}

