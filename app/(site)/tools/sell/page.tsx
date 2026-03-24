import { Metadata } from "next";
import { Coins } from "lucide-react";
import { DiamondPattern } from "@/components/DiamondPattern";
import { SellGoldCalculatorClient } from "@/components/tools/SellGoldCalculatorClient";
import { getGoldPrice } from "@/lib/market-prices";
import { getServerLanguage } from "@/lib/language-server";

export const metadata: Metadata = {
  title: "Sell Gold Calculator | MASA",
  description:
    "Estimate the current market value of your gold jewelry based on weight, karat, and live gold prices.",
};

export default async function SellGoldCalculatorPage() {
  const isArabic = getServerLanguage() === "ar";
  const gold = await getGoldPrice();

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-16 overflow-hidden">
        <DiamondPattern className="opacity-10" />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Coins className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">{isArabic ? "أداة تقييم الذهب" : "Gold Valuation Tool"}</span>
          </div>
          <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl mb-4">
            {isArabic ? "حاسبة بيع الذهب" : "Sell Gold Calculator"}
          </h1>
          <p className="text-secondary max-w-2xl mx-auto text-lg">
            {isArabic
              ? "احصل على تقدير فوري للقيمة السوقية لمجوهراتك الذهبية بناءً على السعر الحالي ونقاء الذهب."
              : "Get an instant estimate of your gold jewelry&apos;s market value based on current gold prices and purity."}
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-content mx-auto">
          <SellGoldCalculatorClient latestGoldPriceQAR={gold.price24KPerGramQAR} />
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 bg-masa-light">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-luxury text-2xl mb-6 text-center">{isArabic ? "نصائح البيع" : "Selling Tips"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TipCard
                title={isArabic ? "اعرف عيارك" : "Know Your Karat"}
                description={isArabic ? "تحقق من ختم العيار على المجوهرات لتحديد العيار. من الأختام الشائعة: 750 (18K)، 585 (14K)، 916 (22K)." : "Check the hallmark stamp on your jewelry to identify the karat. Common stamps include 750 (18K), 585 (14K), and 916 (22K)."}
              />
              <TipCard
                title={isArabic ? "زِن بدقة" : "Weigh Accurately"}
                description={isArabic ? "استخدم ميزان مجوهرات لقياس دقيق. أزل أي أجزاء غير ذهبية مثل الأحجار قبل الوزن." : "Use a jewelry scale for precise measurements. Remove any non-gold components like gemstones before weighing."}
              />
              <TipCard
                title={isArabic ? "قارن العروض" : "Compare Offers"}
                description={isArabic ? "احصل على أكثر من عرض من مشترين مختلفين. قد تختلف الأسعار بشكل كبير بين التجار." : "Get multiple quotes from different buyers. Prices can vary significantly between dealers."}
              />
              <TipCard
                title={isArabic ? "توقيت السوق" : "Market Timing"}
                description={isArabic ? "أسعار الذهب تتغير يومياً. راقب اتجاهات السوق عند اختيار أفضل وقت للبيع." : "Gold prices fluctuate daily. Consider market trends when deciding the best time to sell."}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 p-6">
      <h3 className="font-luxury text-lg text-masa-dark mb-2">{title}</h3>
      <p className="text-masa-gray text-sm leading-relaxed">{description}</p>
    </div>
  );
}
