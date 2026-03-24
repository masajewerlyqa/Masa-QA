import { Metadata } from "next";
import { Calculator } from "lucide-react";
import { DiamondPattern } from "@/components/DiamondPattern";
import { ZakatCalculatorClient } from "@/components/tools/ZakatCalculatorClient";
import { getGoldPrice } from "@/lib/market-prices";
import { getServerLanguage } from "@/lib/language-server";

export const metadata: Metadata = {
  title: "Zakat Calculator | MASA",
  description:
    "Calculate your annual zakat obligation on gold and jewelry holdings according to Islamic guidelines.",
};

export default async function ZakatCalculatorPage() {
  const isArabic = getServerLanguage() === "ar";
  const gold = await getGoldPrice();

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-16 overflow-hidden">
        <DiamondPattern className="opacity-10" />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">{isArabic ? "أداة مالية إسلامية" : "Islamic Finance Tool"}</span>
          </div>
          <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl mb-4">
            {isArabic ? "حاسبة الزكاة" : "Zakat Calculator"}
          </h1>
          <p className="text-secondary max-w-2xl mx-auto text-lg">
            {isArabic
              ? "احسب زكاة الذهب والمجوهرات السنوية وفق الأحكام الشرعية وأسعار الذهب الحالية."
              : "Calculate your annual zakat obligation on gold and jewelry holdings according to Islamic guidelines and current gold prices."}
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-content mx-auto">
          <ZakatCalculatorClient latestGoldPriceQAR={gold.price24KPerGramQAR} />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-masa-light">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-luxury text-2xl mb-6 text-center">{isArabic ? "حول زكاة الذهب" : "About Gold Zakat"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                title={isArabic ? "حد النصاب" : "Nisab Threshold"}
                description={isArabic ? "تجب زكاة الذهب عندما يبلغ الذهب لديك 85 غراماً أو أكثر (حوالي 2.73 أونصة تروي)." : "Zakat on gold becomes obligatory when you possess gold equal to or exceeding 85 grams (approximately 2.73 troy ounces)."}
              />
              <InfoCard
                title={isArabic ? "معدل الزكاة" : "Zakat Rate"}
                description={isArabic ? "معدل زكاة الذهب هو 2.5% من إجمالي قيمة الذهب المملوك فوق النصاب." : "The zakat rate for gold is 2.5% of the total value of gold owned above the nisab threshold."}
              />
              <InfoCard
                title={isArabic ? "الوجوب" : "Eligibility"}
                description={isArabic ? "تجب الزكاة إذا بقي الذهب في ملكك سنة قمرية كاملة (حول)." : "Zakat is due if the gold has been in your possession for one complete lunar year (Hawl)."}
              />
              <InfoCard
                title={isArabic ? "الذهب الخالص فقط" : "Pure Gold Only"}
                description={isArabic ? "يُحسب على أساس محتوى الذهب الخالص. في المجوهرات، احسب وزن الذهب الفعلي دون الأحجار." : "Calculate based on the pure gold content. For jewelry, consider the actual gold weight excluding gemstones."}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 p-6">
      <h3 className="font-luxury text-lg text-masa-dark mb-2">{title}</h3>
      <p className="text-masa-gray text-sm leading-relaxed">{description}</p>
    </div>
  );
}
