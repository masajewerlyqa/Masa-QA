"use client";

import { Star } from "lucide-react";
import { useI18n } from "@/components/useI18n";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-masa-gold" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-current" />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const { isArabic, t } = useI18n();
  const brand = t("common.brand");
  const staticReviews = [
    {
      quote: isArabic
        ? `سهّلت ${brand} العثور على القطعة المناسبة لذكرى زواجنا. المستشار الذكي فهم تماماً ما أبحث عنه.`
        : `${brand} made finding the right piece for our anniversary so easy. The AI advisor understood exactly what I was looking for.`,
      author: "Sarah M.",
      role: isArabic ? "عميلة" : "Customer",
      rating: 5,
    },
    {
      quote: isArabic
        ? `بعت ذهبي عبر متجر موثّق في ${brand}. تسعير شفاف وعملية سلسة. أوصي بها جداً.`
        : `I sold my gold through a verified store on ${brand}. Transparent pricing and smooth process. Highly recommend.`,
      author: "Ahmed K.",
      role: isArabic ? "بائع ومشتري" : "Seller & Buyer",
      rating: 5,
    },
    {
      quote: isArabic
        ? "أخيراً سوق مجوهرات فاخر في قطر يمكنني الوثوق به. قطع جميلة وبائعون محترفون."
        : "Finally a luxury jewelry marketplace in Qatar I trust. Beautiful pieces and professional sellers.",
      author: "Layla H.",
      role: isArabic ? "عميلة" : "Customer",
      rating: 5,
    },
  ];
  return (
    <section
      className="py-16 md:py-24 bg-masa-light"
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <header className="text-center mb-12 md:mb-16">
          <h2
            id="reviews-heading"
            className="font-luxury text-3xl md:text-4xl text-primary mb-4"
          >
            {isArabic ? "تجارب العملاء" : "Customer Experiences"}
          </h2>
          <p className="text-masa-gray max-w-2xl mx-auto font-sans">
            {isArabic
              ? `تعرف على آراء المشترين والبائعين حول تجربتهم في ${brand}.`
              : `See what buyers and sellers say about their experience on ${brand}.`}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {staticReviews.map((review) => (
            <blockquote
              key={review.author}
              className="bg-white rounded-xl border border-primary/10 p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <StarRating count={review.rating} />
              <p className="text-masa-dark font-sans mt-4 mb-4 leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </p>
              <footer className="text-sm text-masa-gray font-sans">
                <cite className="not-italic font-medium text-primary">
                  {review.author}
                </cite>
                <span> — {review.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
