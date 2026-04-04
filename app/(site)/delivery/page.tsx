import type { Metadata } from "next";
import Link from "next/link";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  return {
    title: language === "ar" ? `التوصيل | ${b}` : `Delivery | ${b} Luxury Jewelry`,
    description:
      language === "ar"
        ? `التوصيل يتولاه كل بائع؛ سياسة المتجر وصفحة المنتج وخيار التوصيل في نفس اليوم عند التفعيل.`
        : `Delivery is arranged by each seller on ${b}. Store and product pages show timing; optional same-day with cutoff when enabled.`,
  };
}

export default function DeliveryPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const brand = t(language, "common.brand");
  return (
    <div>
      <section
        className="relative py-20 md:py-28 bg-white overflow-hidden"
        aria-labelledby="delivery-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "التوصيل" : "Delivery"}
          </p>
          <h1
            id="delivery-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-6"
          >
            {isArabic ? "معلومات التوصيل" : "Delivery information"}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? "كل بائع ينظم التوصيل لطلباته؛ اطّلع على صفحة المتجر والمنتج لمعرفة التوقيت والخيارات."
              : "Each seller arranges delivery for their orders. Check the store profile and product pages for timing, options, and any same-day promise."}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-masa-light/40 border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-12 font-sans">
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "كيف يعمل التوصيل على المنصة؟" : "How delivery works on MASA"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? `${brand} تربطك ببائعين موثّقين؛ التوصيل الفعلي يتولاه كل بائع لمتجره. ستجد ملخص التوصيل والتوقيت على صفحة المتجر وعلى صفحة المنتج، إلى جانب سياسة المتجر (بما في ذلك أي وعد بالتوصيل في نفس اليوم عند تفعيله).`
                  : `${brand} connects you with verified sellers, and each seller arranges shipping for their own store. Delivery and timing notes appear on the store profile and product pages, alongside the store’s published policy—including an optional same-day delivery promise with a cutoff time when the seller enables it.`}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "نطاق التغطية" : "Coverage"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "يقدّم معظم البائعين التوصيل داخل قطر. قد يوفّر بعضهم خيارات أخرى أو توصيلاً دولياً؛ راجع صفحة المتجر والمنتج قبل الشراء."
                  : "Most sellers focus on delivery within Qatar. Some may offer other options or international shipping—always confirm on the store and product pages before you buy."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "التوصيل في نفس اليوم" : "Same-day delivery"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "عندما يفعّل البائع التوصيل في نفس اليوم، يظهر ذلك في سياسة المتجر مع وقت قطع (مثلاً الطلبات قبل ساعة محددة تستهدف التسليم في اليوم نفسه؛ بعدها قد يكون التسليم في اليوم التالي حسب إعدادات البائع). التنفيذ الفعلي يبقى مسؤولية البائع."
                  : "When a seller turns on same-day delivery, their store policy shows it together with a cutoff time (for example, orders before a set hour may target same-day delivery; after that, the next day may apply, depending on how the seller operates). Actual fulfilment remains with the seller."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "التوقيت والتجهيز" : "Timing and preparation"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "تختلف مدة التجهيز والتوصيل حسب المتجر والمنتج والموسم. قد يستغرق التجهيز عدة أيام عمل للقطع الخاصة أو العالية القيمة. يحدّث البائع حالة الطلب وقد يضيف تاريخ تسليماً تقديرياً أو بيانات تتبع عند الشحن."
                  : "Preparation and delivery speed vary by store, product, and season. Custom or high-value pieces may need extra business days. Sellers update order status and may add an estimated delivery date or tracking when they dispatch your package."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "عند الدفع" : "At checkout"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "تؤكد صفحة الدفع عنوان التوصيل وتفاصيل الاتصال (بما في ذلك تثبيت الموقع على الخريطة حيث يُطلب ذلك). أي تكاليف توصيل أو طرق متاحة تظهر هناك حسب إعداد البائع والطلب."
                  : "Checkout confirms your delivery address and contact details (including map pin where required). Any delivery fees or available methods appear there according to the seller’s setup and your order."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "طرق التوصيل والأمان" : "Methods and security"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "قد يشمل التوصيل خيارات قياسية أو سريعة أو تسليماً يتطلب توقيعاً أو تغطية تأمينية للقطع الفاخرة—حسب ما يقرره البائع. القطع عالية القيمة قد تتطلب إجراءات إضافية."
                  : "Methods may include standard or express service, or signature and insured handling for luxury items—depending on the seller. High-value pieces may require additional safeguards."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "التتبع والدعم" : "Tracking and support"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "تابع حالة الطلب من قسم الطلبات في حسابك. عندما يضيف البائع رقم تتبع أو شركة نقل، يظهر ذلك في تفاصيل الطلب. للاستفسارات الخاصة بالتوصيل، راسل البائع عبر صفحة الطلب أو تواصل مع دعم المنصة."
                  : "Follow your order status under Account → Orders. When the seller adds a carrier or tracking number, it appears on the order detail page. For delivery questions, message the seller from the order page or contact platform support."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "الإرجاع ووقت التسليم" : "Returns and delivery time"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic
                  ? "عندما يوفّر المتجر الإرجاع أو الاستبدال، تُحسب المدة عادة من وقت التسليم الفعلي وليس من تاريخ الطلب فقط. راجع سياسة المتجر ونسخة السياسة المحفوظة مع طلبك في تفاصيل الطلب."
                  : "If a store offers returns or exchanges, eligibility windows usually count from your actual delivery time—not only the order date. Check the store’s policy and the policy snapshot saved with your order in order details."}
              </p>
            </div>
            <p className="text-masa-gray text-sm pt-4">
              {isArabic ? "لمزيد من الأسئلة الشائعة حول التوصيل والسياسات، راجع" : "For more on delivery and policies, see our"}{" "}
              <Link href="/contact#faq" className="text-primary hover:underline">
                {isArabic ? "الأسئلة الشائعة" : "FAQ"}
              </Link>
              {isArabic ? " أو " : " or "}
              <Link href="/contact" className="text-primary hover:underline">{isArabic ? "تواصل معنا" : "contact us"}</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
