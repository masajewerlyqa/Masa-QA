import type { Metadata } from "next";
import Link from "next/link";
import { getServerLanguage } from "@/lib/language-server";

export const metadata: Metadata = {
  title: "Terms of Service | MASA Luxury Jewelry",
  description:
    "Terms of service for using MASA luxury jewelry marketplace.",
};

export default function TermsPage() {
  const isArabic = getServerLanguage() === "ar";
  return (
    <div>
      <section
        className="relative py-20 md:py-28 bg-white overflow-hidden"
        aria-labelledby="terms-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "قانوني" : "Legal"}
          </p>
          <h1
            id="terms-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-6"
          >
            {isArabic ? "شروط الاستخدام" : "Terms of Service"}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic ? "الشروط التي تحكم استخدامك لمنصة ماسا." : "Terms governing your use of the MASA marketplace."}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-masa-light/40 border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div
            className="max-w-3xl mx-auto space-y-10 font-sans text-masa-gray text-sm leading-relaxed"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "القبول" : "Acceptance"}</h2>
              <p>
                {isArabic
                  ? "باستخدامك لمنصة ماسا (الموقع والخدمات) فإنك توافق على هذه الشروط وعلى الشروط والأحكام الخاصة بالعملاء أو المتاجر حيث تنطبق. إذا كنت لا توافق، يرجى عدم استخدام المنصة. قد يتم تحديث الشروط؛ استمرار الاستخدام بعد التعديل يعني موافقتك على النسخة المحدثة."
                  : "By using MASA (the website and services), you agree to these terms and to the Customer or Merchant Terms & Conditions where they apply. If you do not agree, do not use the platform. We may update these terms; continued use after changes means you accept the updated terms."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "طبيعة المنصة" : "The marketplace"}</h2>
              <p>
                {isArabic
                  ? "ماسا منصة تربط المشترين ببائعي المجوهرات. لا نملك المنتجات المدرجة؛ كل عملية بيع هي بينك وبين المتجر. نوفر المنصة والأدوات والدعم لتسهيل المعاملات بشفافية وأمان."
                  : "MASA is a marketplace connecting buyers with jewelry sellers. We do not own listed products; each sale is between you and the seller. We provide the platform, tools, and support to facilitate secure, transparent transactions."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "حسابك" : "Your account"}</h2>
              <p>
                {isArabic
                  ? "يجب تقديم معلومات دقيقة والحفاظ على أمان حسابك. أنت مسؤول عن النشاط الذي يتم عبر حسابك. يلتزم البائعون بسياسات المنصة والقوانين المعمول بها."
                  : "You must provide accurate information and keep your account secure. You are responsible for activity under your account. Sellers must comply with our policies and applicable laws."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "المشتريات والمدفوعات" : "Purchases and payments"}</h2>
              <p>
                {isArabic
                  ? "عند شراء منتج توافق على دفع السعر المعروض وأي رسوم توصيل أو ضرائب تنطبق. تتم المعالجة عبر مزودي دفع آمنين. النزاعات المتعلقة بالمنتج أو التوصيل تُعالج مع المتجر؛ وقد تساعد المنصة في التنسيق عند الاقتضاء."
                  : "When you buy an item, you agree to pay the stated price and any applicable delivery fees and taxes. Payment is processed through secure partners. Disputes about the product or delivery are primarily with the seller; we may help coordinate resolution where appropriate."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">
                {isArabic ? "الاستبدال والاسترجاع — دون استرداد نقدي" : "Returns, exchanges — no cash refunds"}
              </h2>
              <p>
                {isArabic
                  ? "لا تقدم منصة ماسا استرداداً نقدياً للمبالغ المدفوعة. أي استبدال أو تسوية غير نقدية يخضع حصرياً لسياسة المتجر المعمول بها كما تُعرض على صفحة المتجر. بإتمام الطلب تقر بعدم وجود التزام من المنصة بإرجاع الأموال نقداً."
                  : "MASA does not provide cash refunds or money-back guarantees for amounts paid. Any exchange, replacement, or non-cash resolution is governed solely by the applicable store’s policy as shown on the store page. By placing an order, you acknowledge that the platform does not refund money."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "التوصيل" : "Delivery"}</h2>
              <p>
                {isArabic
                  ? "تتولى المنصة تنسيق التوصيل وفق نموذج التشغيل المعتمد. تختلف مدة التوصيل حسب توفر المنتج وموقع المتجر وموقع العميل وأوقات المواسم والعروض والأحوال الجوية أو الظروف الخارجية. جرّب قسم الأسئلة الشائعة للمزيد."
                  : "Delivery is coordinated by the platform under our operating model. Delivery times vary based on product availability, store location, customer location, peak seasons and promotions, and weather or other external factors. See our FAQ for more detail."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "السلوك المحظور" : "Prohibited conduct"}</h2>
              <p>
                {isArabic
                  ? "يُحظر استخدام المنصة للاحتيال أو السلع المقلدة أو أي نشاط غير قانوني. يُحظر إساءة استخدام المنصة أو مضايقة الآخرين أو محاولة التحايل على الأنظمة. قد نعلق الحسابات أو ننهيها عند المخالفة."
                  : "You may not use MASA for fraud, counterfeit goods, or illegal activity. You may not misuse the platform, harass others, or circumvent our systems. We may suspend or terminate accounts that violate these terms."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "تحديد المسؤولية" : "Limitation of liability"}</h2>
              <p>
                {isArabic
                  ? "ضمن ما يسمح به القانون، تقتصر مسؤولية ماسا على المبلغ الذي دفعته مقابل الطلب أو الخدمة ذات الصلة. لا نتحمل الأضرار غير المباشرة أو التبعية، ولا مسؤولية سلوك المتاجر خارج نطاق معقول من سيطرتنا."
                  : "To the extent permitted by law, MASA’s liability is limited to the amount you paid for the relevant order or service. We are not liable for indirect or consequential damages, or for seller conduct outside our reasonable control."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "القانون المعمول به" : "Governing law"}</h2>
              <p>
                {isArabic
                  ? "تخضع هذه الشروط لأنظمة دولة قطر حيث ينطبق ذلك."
                  : "These terms are governed by the laws of the State of Qatar, where applicable."}
              </p>
            </div>
            <p className="pt-4">
              {isArabic ? "للاستفسارات،" : "For questions,"}{" "}
              <Link href="/contact" className="text-primary hover:underline">
                {isArabic ? "تواصل معنا" : "contact us"}
              </Link>
              . {isArabic ? "لمزيد من التفاصيل راجع سياسة الخصوصية وملفات تعريف الارتباط." : "See also our Privacy Policy and Cookie Policy."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
