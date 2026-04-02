import type { Metadata } from "next";
import Link from "next/link";
import { getServerLanguage } from "@/lib/language-server";

export const metadata: Metadata = {
  title: "Delivery | MASA Luxury Jewelry",
  description:
    "Delivery information for MASA luxury jewelry marketplace. Qatar and international options.",
};

export default function DeliveryPage() {
  const isArabic = getServerLanguage() === "ar";
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
            {isArabic ? "كيف نقوم بتوصيل مجوهراتك بأمان داخل قطر وخارجها." : "How we deliver your luxury jewelry safely across Qatar and beyond."}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-masa-light/40 border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-12 font-sans">
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "نطاقات التوصيل" : "Delivery areas"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic ? "يعمل MASA مع بائعين موثّقين ينظمون توصيل طلباتهم. معظم البائعين يوفرون التوصيل داخل قطر، وقد يتوفر توصيل دولي لدى بعضهم." : "MASA works with verified sellers who arrange delivery for their orders. Most sellers offer delivery within Qatar (Doha and surrounding areas). Selected sellers may deliver internationally—check the product or store page for availability in your country."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "مدة التجهيز" : "Processing time"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic ? "بعد تقديم الطلب، عادة يتم التجهيز والإرسال خلال 2-5 أيام عمل. ستصلك تفاصيل التتبع عند خروج الطلب للتوصيل عبر البريد الإلكتروني." : "After you place an order, the seller typically prepares and dispatches it within 2–5 business days. You will receive confirmation and tracking details by email when your order is out for delivery. High-value or custom pieces may require additional time; the seller will inform you if so."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "طرق التوصيل" : "Delivery methods"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic ? "قد تشمل الخيارات التوصيل القياسي أو السريع أو المؤمّن للقطع الفاخرة. تُعرض الطريقة والتكلفة أثناء الدفع." : "Options may include standard delivery, express delivery, and—for luxury items—insured or signature-required delivery. Exact methods and costs are shown at checkout. Sellers use reputable carriers to ensure your jewelry arrives securely."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-2xl text-primary mb-4">{isArabic ? "تتبع الطلب" : "Tracking your order"}</h2>
              <p className="text-masa-gray text-sm leading-relaxed mb-4">
                {isArabic ? "بعد الإرسال، يمكنك تتبع طلبك من صفحة الطلبات في حسابك أو عبر رابط التتبع في البريد الإلكتروني." : "Once your order is on its way, you can track it from your account under Orders, or via the link in your order confirmation email. If you have questions about delivery, contact the seller through the order page or reach our support team."}
              </p>
            </div>
            <p className="text-masa-gray text-sm pt-4">
              {isArabic ? "للاستفسارات الخاصة بالتوصيل،" : "For specific delivery questions,"}{" "}
              <Link href="/contact" className="text-primary hover:underline">{isArabic ? "تواصل معنا" : "contact us"}</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
