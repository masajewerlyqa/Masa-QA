import type { Metadata } from "next";
import Link from "next/link";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  return {
    title: language === "ar" ? `دليل المقاسات | ${b}` : `Size Guide | ${b} Luxury Jewelry`,
    description:
      language === "ar"
        ? `دليل المقاسات للمجوهرات الفاخرة على ${b} في قطر.`
        : `Find the right fit for rings, bracelets, and necklaces. ${b} size guide for luxury jewelry in Qatar.`,
  };
}

/* Inline SVGs to avoid lucide-react in Server Component (can cause undefined type error) */
const IconRing = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconBracelet = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 8h12M6 16h12M8 6v2a4 4 0 0 0 8 0V6M8 18v2a4 4 0 0 0 8 0v-2" />
  </svg>
);
const IconNecklace = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconRuler = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 6H3M21 12H3M21 18H3M4 6v12M8 6v12M12 6v12M16 6v12M20 6v12" />
  </svg>
);

export default function SizeGuidePage() {
  const isArabic = getServerLanguage() === "ar";
  return (
    <div>
      {/* Hero */}
      <section
        className="relative py-20 md:py-28 bg-white overflow-hidden"
        aria-labelledby="size-guide-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "اعثر على المقاس المناسب" : "Find your fit"}
          </p>
          <h1
            id="size-guide-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-6"
          >
            {isArabic ? "دليل المقاسات" : "Size Guide"}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? "اختر المقاس المناسب للخواتم والأساور والقلائد. قد تختلف المقاسات قليلًا حسب التصميم."
              : "Choose the right size for rings, bracelets, and necklaces. Sizes may vary slightly by designer—when in doubt, contact the seller."}
          </p>
        </div>
      </section>

      {/* Ring sizes */}
      <section
        className="py-16 md:py-20 bg-masa-light/40 border-t border-primary/10"
        aria-labelledby="ring-sizes-heading"
      >
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/15 text-primary">
                <IconRing />
              </span>
              <h2 id="ring-sizes-heading" className="font-luxury text-2xl md:text-3xl text-primary">
                {isArabic ? "مقاسات الخواتم" : "Ring sizes"}
              </h2>
            </div>
            <p className="font-sans text-masa-gray text-sm mb-6">
              {isArabic
                ? "قس المحيط الداخلي لخاتم ترتديه أو محيط الإصبع بالملليمتر، ثم قارن بالجدول."
                : "Measure the inner circumference of a ring you already wear, or the circumference of your finger in mm. Compare to the table below."}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-sm">
              <table className="w-full font-sans text-sm" role="table">
                <thead>
                  <tr className="bg-masa-light/80 border-b border-primary/10">
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">US</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">UK</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">EU</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "المحيط (مم)" : "Circumference (mm)"}</th>
                  </tr>
                </thead>
                <tbody className="text-masa-gray">
                  {[
                    [5, "J½", 52, 49.3],
                    [6, "L½", 54, 52.0],
                    [7, "O", 54.5, 54.4],
                    [8, "Q", 57, 57.0],
                    [9, "S", 59, 59.6],
                    [10, "U", 60.5, 62.2],
                  ].map(([us, uk, eu, circ]) => (
                    <tr key={String(us)} className="border-b border-primary/5 last:border-0 hover:bg-masa-light/30 transition-colors">
                      <td className="py-4 px-5">{us}</td>
                      <td className="py-4 px-5">{uk}</td>
                      <td className="py-4 px-5">{eu}</td>
                      <td className="py-4 px-5">{circ}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Bracelet lengths */}
      <section
        className="py-16 md:py-20 bg-white"
        aria-labelledby="bracelet-heading"
      >
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/15 text-primary">
                <IconBracelet />
              </span>
              <h2 id="bracelet-heading" className="font-luxury text-2xl md:text-3xl text-primary">
                {isArabic ? "أطوال الأساور" : "Bracelet lengths"}
              </h2>
            </div>
            <p className="font-sans text-masa-gray text-sm mb-6">
              {isArabic ? "قس المعصم وأضف الطول المقترح حسب درجة الاتساع المطلوبة." : "Measure your wrist and add the suggested length for the fit you want."}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-primary/10 bg-masa-light/30 shadow-sm">
              <table className="w-full font-sans text-sm" role="table">
                <thead>
                  <tr className="bg-masa-light/80 border-b border-primary/10">
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "المقاس" : "Fit"}</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "الطول (سم)" : "Length (cm)"}</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "مناسب لـ" : "Suitable for"}</th>
                  </tr>
                </thead>
                <tbody className="text-masa-gray">
                  <tr className="border-b border-primary/5 hover:bg-white/50 transition-colors"><td className="py-4 px-5">{isArabic ? "مشدود" : "Snug"}</td><td className="py-4 px-5">14 – 15</td><td className="py-4 px-5">{isArabic ? "معصم صغير" : "Small wrist, bangle-style"}</td></tr>
                  <tr className="border-b border-primary/5 hover:bg-white/50 transition-colors"><td className="py-4 px-5">{isArabic ? "قياسي" : "Standard"}</td><td className="py-4 px-5">16 – 18</td><td className="py-4 px-5">{isArabic ? "معظم البالغين" : "Most adults"}</td></tr>
                  <tr className="border-b border-primary/5 last:border-0 hover:bg-white/50 transition-colors"><td className="py-4 px-5">{isArabic ? "واسع" : "Loose"}</td><td className="py-4 px-5">19 – 21</td><td className="py-4 px-5">{isArabic ? "مظهر طبقات / معصم أكبر" : "Layered look, larger wrist"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Necklace lengths */}
      <section
        className="py-16 md:py-20 bg-masa-light/40 border-t border-primary/10"
        aria-labelledby="necklace-heading"
      >
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/15 text-primary">
                <IconNecklace />
              </span>
              <h2 id="necklace-heading" className="font-luxury text-2xl md:text-3xl text-primary">
                {isArabic ? "أطوال القلائد" : "Necklace lengths"}
              </h2>
            </div>
            <p className="font-sans text-masa-gray text-sm mb-6">
              {isArabic ? "يُقاس الطول على امتداد السلسلة عند فردها. اختر حسب الأسلوب وشكل الياقة." : "Length is measured along the chain or strand when laid flat. Choose by style and neckline."}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-sm">
              <table className="w-full font-sans text-sm" role="table">
                <thead>
                  <tr className="bg-masa-light/80 border-b border-primary/10">
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "الطول (إنش)" : "Length (inches)"}</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "الطول (سم)" : "Length (cm)"}</th>
                    <th className="text-left py-4 px-5 font-medium text-masa-dark">{isArabic ? "النمط" : "Style"}</th>
                  </tr>
                </thead>
                <tbody className="text-masa-gray">
                  <tr className="border-b border-primary/5 hover:bg-masa-light/30 transition-colors"><td className="py-4 px-5">14 – 16</td><td className="py-4 px-5">35 – 40</td><td className="py-4 px-5">{isArabic ? "تشوكر / طوق" : "Choker, collar"}</td></tr>
                  <tr className="border-b border-primary/5 hover:bg-masa-light/30 transition-colors"><td className="py-4 px-5">18 – 20</td><td className="py-4 px-5">45 – 50</td><td className="py-4 px-5">{isArabic ? "برنسس / ماتينيه" : "Princess, matinee"}</td></tr>
                  <tr className="border-b border-primary/5 hover:bg-masa-light/30 transition-colors"><td className="py-4 px-5">22 – 24</td><td className="py-4 px-5">55 – 60</td><td className="py-4 px-5">Opera</td></tr>
                  <tr className="border-b border-primary/5 last:border-0 hover:bg-masa-light/30 transition-colors"><td className="py-4 px-5">28 – 36</td><td className="py-4 px-5">70 – 90</td><td className="py-4 px-5">{isArabic ? "طويل / حبل" : "Rope, long"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How to measure + CTA */}
      <section className="py-16 md:py-24 bg-white border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/15 text-primary mb-6">
              <IconRuler />
            </span>
            <h2 className="font-luxury text-2xl text-primary mb-4">
              {isArabic ? "تحتاج مساعدة في القياس؟" : "Need help measuring?"}
            </h2>
            <p className="font-sans text-masa-gray text-sm mb-8 leading-relaxed">
              {isArabic
                ? "قد تختلف المقاسات بين العلامات. عند الشك، تواصل مع البائع أو فريق الدعم."
                : "Sizes can vary by brand. When in doubt, contact the seller or our support team for help choosing the right size."}
            </p>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center rounded-md border border-primary bg-transparent px-8 text-sm font-medium text-primary transition-colors hover:bg-masa-light focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isArabic ? "تواصل مع الدعم" : "Contact support"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
