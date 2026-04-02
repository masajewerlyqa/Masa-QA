import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminReviews } from "@/lib/admin";
import { AdminReviewActions } from "./AdminReviewActions";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { formatShortDate } from "@/lib/date-format";

// Always fetch fresh data from Supabase; no static/cached review list
export const dynamic = "force-dynamic";

function StatusBadge({ status, language }: { status: string; language: "en" | "ar" }) {
  if (status === "approved") return <Badge variant="default">{t(language, "admin.reviews.approved")}</Badge>;
  if (status === "rejected") return <Badge variant="secondary">{t(language, "admin.reviews.rejected")}</Badge>;
  return <Badge variant="outline">{t(language, "admin.reviews.pending")}</Badge>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30"}`}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const reviews = await getAdminReviews(150);
  if (process.env.NODE_ENV === "development") {
    console.log("[AdminReviewsPage] getAdminReviews returned", reviews.length, "rows");
  }

  if (reviews.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.reviews.title")}</h1>
          <p className="text-masa-gray font-sans">
            {t(language, "admin.reviews.subtitle")}
          </p>
        </div>
        <Card className="border-primary/10 shadow-sm">
          <CardContent className="py-12 text-center font-sans">
            <p className="text-masa-gray mb-2">{t(language, "admin.reviews.noReviewsYet")}</p>
            <p className="text-sm text-masa-gray">
              {t(language, "admin.reviews.noReviewsHint")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const rejected = reviews.filter((r) => r.status === "rejected");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.reviews.title")}</h1>
        <p className="text-masa-gray font-sans">
          {t(language, "admin.reviews.subtitle")}
        </p>
      </div>

      {pending.length > 0 && (
        <Card className="border-primary/10 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t(language, "admin.reviews.pending")} ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col md:flex-row gap-4 p-4 border border-primary/10 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        href={`/product/${review.product_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.product_name}
                      </Link>
                      {review.store_name && (
                        <span className="text-xs text-masa-gray">• {review.store_name}</span>
                      )}
                      <StatusBadge status={review.status} language={language} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-masa-gray">
                        {t(language, "admin.reviews.by").replace("{name}", review.customer_name ?? "—")}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-medium text-masa-dark mb-1">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-masa-gray">{review.body}</p>
                    )}
                    <p className="text-xs text-masa-gray mt-2">{formatShortDate(review.created_at, language)}</p>
                  </div>
                  <div className="flex items-start">
                    <AdminReviewActions reviewId={review.id} status={review.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t(language, "admin.reviews.approved")} ({approved.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approved.length === 0 ? (
            <p className="text-masa-gray font-sans text-sm">{t(language, "admin.reviews.noApprovedYet")}</p>
          ) : (
            <div className="space-y-4">
              {approved.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col md:flex-row gap-4 p-4 border border-primary/10 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        href={`/product/${review.product_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.product_name}
                      </Link>
                      {review.store_name && (
                        <span className="text-xs text-masa-gray">• {review.store_name}</span>
                      )}
                      <StatusBadge status={review.status} language={language} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-masa-gray">
                        {t(language, "admin.reviews.by").replace("{name}", review.customer_name ?? "—")}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-medium text-masa-dark mb-1">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-masa-gray">{review.body}</p>
                    )}
                    <p className="text-xs text-masa-gray mt-2">{formatShortDate(review.created_at, language)}</p>
                  </div>
                  <div className="flex items-start">
                    <AdminReviewActions reviewId={review.id} status={review.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {rejected.length > 0 && (
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t(language, "admin.reviews.rejected")} ({rejected.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejected.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col md:flex-row gap-4 p-4 border border-primary/10 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        href={`/product/${review.product_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.product_name}
                      </Link>
                      {review.store_name && (
                        <span className="text-xs text-masa-gray">• {review.store_name}</span>
                      )}
                      <StatusBadge status={review.status} language={language} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-masa-gray">
                        {t(language, "admin.reviews.by").replace("{name}", review.customer_name ?? "—")}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-medium text-masa-dark mb-1">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-masa-gray">{review.body}</p>
                    )}
                    <p className="text-xs text-masa-gray mt-2">{formatShortDate(review.created_at, language)}</p>
                  </div>
                  <div className="flex items-start">
                    <AdminReviewActions reviewId={review.id} status={review.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

