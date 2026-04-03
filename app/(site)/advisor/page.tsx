import { Metadata } from "next";
import { Sparkles, Gem, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/customer";
import { AdvisorClient } from "@/components/advisor/AdvisorClient";
import { DiamondPattern } from "@/components/DiamondPattern";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  return {
    title: language === "ar" ? `مستشار المجوهرات الذكي | ${b}` : `AI Jewelry Advisor | ${b}`,
    description:
      language === "ar"
        ? "دع المستشار الذكي يساعدك في اختيار القطعة المناسبة."
        : "Let our AI Jewelry Advisor help you find the perfect piece based on your preferences, occasion, and budget.",
  };
}

export default async function AdvisorPage() {
  const isArabic = getServerLanguage() === "ar";
  const { user } = await getCurrentUserWithProfile();
  const wishlistIds = user ? await getWishlistProductIds(user.id) : [];

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-16 overflow-hidden">
        <DiamondPattern className="opacity-10" />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">{isArabic ? "توصيات مدعومة بالذكاء الاصطناعي" : "AI-Powered Recommendations"}</span>
          </div>
          <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl mb-4">
            {isArabic ? "المستشار الذكي للمجوهرات" : "AI Jewelry Advisor"}
          </h1>
          <p className="text-secondary max-w-2xl mx-auto text-lg">
            {isArabic
              ? "أخبرنا بتفضيلاتك ودع مستشارنا الذكي يعثر لك على القطع الأنسب من مجموعتنا المنتقاة."
              : "Tell us about your preferences and let our intelligent advisor find the perfect jewelry pieces from our curated marketplace collection."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-content mx-auto">
          <AdvisorClient wishlistIds={wishlistIds} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-masa-light">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-primary" />}
              title={isArabic ? "مطابقة شخصية" : "Personalized Matching"}
              description={isArabic ? "يحلل المستشار تفضيلاتك ليقترح قطعاً تناسب ذوقك واحتياجك فعلاً." : "Our advisor analyzes your preferences to find pieces that truly match your style and needs."}
            />
            <FeatureCard
              icon={<Gem className="w-6 h-6 text-primary" />}
              title={isArabic ? "منتجات حقيقية" : "Real Products"}
              description={isArabic ? "كل التوصيات تأتي من بائعين موثّقين وقطع فاخرة أصلية." : "All recommendations come from our verified marketplace sellers with authentic luxury pieces."}
            />
            <FeatureCard
              icon={<SlidersHorizontal className="w-6 h-6 text-primary" />}
              title={isArabic ? "فلترة ذكية" : "Smart Filtering"}
              description={isArabic ? "نراعي الميزانية والمناسبة ونوع المعدن والأسلوب لإعطائك أفضل تطابق." : "Budget, occasion, metal type, and style are all considered to give you the best matches."}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-luxury text-lg mb-2">{title}</h3>
      <p className="text-masa-gray text-sm">{description}</p>
    </div>
  );
}
