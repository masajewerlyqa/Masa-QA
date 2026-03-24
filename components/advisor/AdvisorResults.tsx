"use client";

import Link from "next/link";
import { Store, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageProvider";
import type { Product } from "@/lib/types";
import type { AdvisorResponse, ProductRecommendation } from "@/lib/advisor-types";

type AdvisorResultsProps = {
  response: AdvisorResponse;
  products: Product[];
  recommendations: ProductRecommendation[];
  wishlistIds: string[];
  onReset: () => void;
};

export function AdvisorResults({
  response,
  products,
  recommendations,
  wishlistIds,
  onReset,
}: AdvisorResultsProps) {
  const { isArabic } = useLanguage();
  const recommendationMap = new Map(
    recommendations.map((r) => [r.productId, r])
  );

  return (
    <div className="space-y-8">
      {/* Summary */}
      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-luxury text-xl mb-2">{isArabic ? "توصياتك الشخصية" : "Your Personalized Recommendations"}</h2>
              <p className="text-masa-gray">{response.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div>
          <h3 className="font-luxury text-xl mb-4">{isArabic ? "القطع الموصى بها" : "Recommended Pieces"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => {
              const rec = recommendationMap.get(product.id);
              return (
                <div key={product.id} className="relative">
                  {index === 0 && (
                    <Badge className="absolute -top-2 -left-2 z-10 bg-primary text-white border-0">
                      {isArabic ? "أفضل تطابق" : "Best Match"}
                    </Badge>
                  )}
                  <ProductCard
                    product={product}
                    isInWishlist={wishlistIds.includes(product.id)}
                    priority={index < 4}
                  />
                  {rec && rec.matchReasons.length > 0 && (
                    <div className="mt-3 p-3 bg-masa-light rounded-lg">
                      <p className="text-xs font-medium text-masa-dark mb-2">
                        {isArabic ? "لماذا نوصي بهذه القطعة:" : "Why we recommend this:"}
                      </p>
                      <ul className="space-y-1">
                        {rec.matchReasons.slice(0, 3).map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-masa-gray">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState onReset={onReset} isArabic={isArabic} />
      )}

      {/* Store Recommendations */}
      {response.stores.length > 0 && (
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="font-luxury text-lg flex items-center gap-2">
              <Store className="w-5 h-5" />
              {isArabic ? "متاجر مناسبة لذوقك" : "Featured Stores for Your Style"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {response.stores.map((store) => (
                <Link
                  key={store.storeId}
                  href={`/store/${store.storeSlug}`}
                  className="group p-4 rounded-lg border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-masa-dark group-hover:text-primary transition-colors">
                        {store.storeName}
                      </h4>
                      <p className="text-xs text-masa-gray mt-1">{store.matchReason}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-masa-gray group-hover:text-primary transition-colors ${isArabic ? "rotate-180" : ""}`} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button variant="outline" onClick={onReset}>
          {isArabic ? "ابدأ من جديد" : "Start Over"}
        </Button>
        <Button asChild>
          <Link href="/discover">
            {isArabic ? "تصفح كل المجوهرات" : "Browse All Jewelry"}
            <ArrowRight className={`w-4 h-4 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ onReset, isArabic }: { onReset: () => void; isArabic: boolean }) {
  return (
    <Card className="border-primary/10 border-dashed">
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 bg-masa-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-masa-gray" />
        </div>
        <h3 className="font-luxury text-xl mb-2">{isArabic ? "لم نعثر على تطابق تام" : "No Exact Matches Found"}</h3>
        <p className="text-masa-gray max-w-md mx-auto mb-6">
          {isArabic
            ? "لم نجد منتجات تطابق جميع معاييرك بدقة. جرّب تعديل التفضيلات أو تصفح المجموعة كاملة."
            : "We couldn&apos;t find products that perfectly match all your criteria. Try adjusting your preferences or explore our full collection."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={onReset}>
            {isArabic ? "عدّل التفضيلات" : "Adjust Preferences"}
          </Button>
          <Button asChild>
            <Link href="/discover">{isArabic ? "تصفح كل المجوهرات" : "Browse All Jewelry"}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
