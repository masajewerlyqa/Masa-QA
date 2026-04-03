import type { Metadata } from "next";
import Link from "next/link";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  return {
    title: language === "ar" ? `الإرجاع والاسترداد | ${b}` : `Returns & Refunds | ${b} Luxury Jewelry`,
    description:
      language === "ar"
        ? `سياسة الإرجاع والاسترداد لسوق ${b} للمجوهرات الفاخرة.`
        : `Returns and refund policy for ${b} luxury jewelry marketplace. How to return or exchange items.`,
  };
}

export default function ReturnsPage() {
  const isArabic = getServerLanguage() === "ar";
  return (
    <div>
      <section
        className="relative py-20 md:py-28 bg-white overflow-hidden"
        aria-labelledby="returns-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "السياسات" : "Policy"}
          </p>
          <h1
            id="returns-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-6"
          >
            {isArabic ? "الإرجاع والاسترداد" : "Returns & Refunds"}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? "آلية الإرجاع والاسترداد لمشتريات المجوهرات الفاخرة."
              : "Our approach to returns and refunds for luxury jewelry purchases."}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-masa-light/40 border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-12 font-sans">
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "سياسة الإرجاع" : "Return policy"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "شروط الإرجاع يحددها كل بائع وتظهر في صفحات المنتجات والمتاجر. يقبل العديد من البائعين الإرجاع خلال فترة محددة للمنتجات غير المستخدمة وبحالـتها الأصلية. القطع المخصصة أو المحفورة قد لا تكون قابلة للإرجاع."
                  : "Return eligibility is set by each seller and is shown on product and store pages. Many sellers accept returns within a specified period (e.g. 14–30 days) for items in unused, resalable condition with original packaging and documentation. Custom, engraved, or made-to-order pieces may be non-returnable."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "طريقة طلب الإرجاع" : "How to request a return"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "من حسابك > الطلبات، اختر الطلب وقدّم طلب إرجاع أو تواصل مع البائع مع سبب الإرجاع والصور إن لزم. بعد استلام المرتجع والموافقة عليه، تتم معالجة الاسترداد أو الاستبدال وفق سياسة البائع."
                  : "Go to your account → Orders, select the order, and use the option to request a return or contact the seller. Include your reason and any photos if relevant. The seller will respond with instructions (e.g. return address, packaging requirements). Once the seller receives and approves the return, they will process your refund or exchange according to their policy."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "الاسترداد" : "Refunds"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "يتم الاسترداد إلى وسيلة الدفع الأصلية. تختلف مدة الإرجاع حسب مزوّد الدفع وعادة تستغرق عدة أيام عمل."
                  : "Refunds are issued by the seller to the original payment method. Processing times vary by payment provider (typically 5–10 business days after the refund is initiated). If you paid in a currency different from your card’s currency, the amount may be converted at your bank’s rate."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "الاستبدال" : "Exchanges"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "الاستبدال (مثل المقاس أو التصميم) يخضع لسياسة البائع. تواصل مع البائع من صفحة الطلب لمعرفة الخيارات المتاحة."
                  : "Exchanges (e.g. for size or style) are offered at the seller’s discretion. Contact the seller through your order page to ask about exchange options. If an exchange is agreed, the seller will guide you through the process."}
              </p>
            </div>
            <p className="text-masa-gray text-sm pt-4">
              {isArabic ? "تحتاج مساعدة؟" : "Need help?"}{" "}
              <Link href="/contact" className="text-primary hover:underline">{isArabic ? "تواصل معنا" : "Contact us"}</Link>{" "}
              {isArabic ? "وسنساعدك قدر الإمكان." : "and we will assist where we can."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
