import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore, getSellerReviews } from "@/lib/seller";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { formatShortDate } from "@/lib/date-format";

function StatusBadge({ status, language }: { status: string; language: "en" | "ar" }) {
  if (status === "approved") return <Badge variant="default">{t(language, "seller.reviews.approved")}</Badge>;
  if (status === "rejected") return <Badge variant="secondary">{t(language, "seller.reviews.rejected")}</Badge>;
  return <Badge variant="outline">{t(language, "seller.reviews.pending")}</Badge>;
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

export default async function SellerReviewsPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") redirect("/login");

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.reviews.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.reviews.noStoreYet")}</p>
      </div>
    );
  }

  const reviews = await getSellerReviews(store.id);
  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const rejected = reviews.filter((r) => r.status === "rejected");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.reviews.title")}</h1>
        <p className="text-masa-gray font-sans">
          {t(language, "seller.reviews.subtitle")}
        </p>
      </div>

      {pending.length > 0 && (
        <Card className="border-primary/10 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t(language, "seller.reviews.pending")} ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.map((review) => (
                <div key={review.id} className="flex flex-col md:flex-row gap-4 p-4 border border-primary/10 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link href={`/product/${review.product_id}`} className="font-medium text-primary hover:underline">
                        {review.product_name}
                      </Link>
                      <StatusBadge status={review.status} language={language} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-masa-gray">{t(language, "seller.reviews.byCustomer").replace("{name}", review.customer_name ?? t(language, "seller.reviews.customerFallback"))}</span>
                    </div>
                    {review.title && <p className="font-medium text-masa-dark mb-1">{review.title}</p>}
                    {review.body && <p className="text-sm text-masa-gray">{review.body}</p>}
                    <p className="text-xs text-masa-gray mt-2">{formatShortDate(review.created_at, language)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t(language, "seller.reviews.approved")} ({approved.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approved.length === 0 ? (
            <p className="text-masa-gray font-sans text-sm">{t(language, "seller.reviews.noApprovedYet")}</p>
          ) : (
            <div className="space-y-4">
              {approved.map((review) => (
                <div key={review.id} className="flex flex-col md:flex-row gap-4 p-4 border border-primary/10 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link href={`/product/${review.product_id}`} className="font-medium text-primary hover:underline">
                        {review.product_name}
                      </Link>
                      <StatusBadge status={review.status} language={language} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-masa-gray">{t(language, "seller.reviews.byCustomer").replace("{name}", review.customer_name ?? t(language, "seller.reviews.customerFallback"))}</span>
                    </div>
                    {review.title && <p className="font-medium text-masa-dark mb-1">{review.title}</p>}
                    {review.body && <p className="text-sm text-masa-gray">{review.body}</p>}
                    <p className="text-xs text-masa-gray mt-2">{formatShortDate(review.created_at, language)}</p>
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
            <CardTitle className="font-luxury text-primary">{t(language, "seller.reviews.rejected")} ({rejected.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejected.map((review) => (
                <div key={review.id} className="flex flex-col md:flex-row gap-4 p-4 border border-primary/10 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link href={`/product/${review.product_id}`} className="font-medium text-primary hover:underline">
                        {review.product_name}
                      </Link>
                      <StatusBadge status={review.status} language={language} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-masa-gray">{t(language, "seller.reviews.byCustomer").replace("{name}", review.customer_name ?? t(language, "seller.reviews.customerFallback"))}</span>
                    </div>
                    {review.title && <p className="font-medium text-masa-dark mb-1">{review.title}</p>}
                    {review.body && <p className="text-sm text-masa-gray">{review.body}</p>}
                    <p className="text-xs text-masa-gray mt-2">{formatShortDate(review.created_at, language)}</p>
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
