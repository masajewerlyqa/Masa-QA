import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Phone, Headphones, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiamondPattern } from "@/components/DiamondPattern";
import { ContactForm } from "@/components/contact/ContactForm";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";
import { getLocalizedSeo } from "@/lib/seo";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const localized = getLocalizedSeo(language, {
    title: `Contact ${brandName("en")} - Luxury Jewelry Support in Qatar`,
    titleAr: `تواصل مع ${brandName("ar")} - دعم منصة المجوهرات الفاخرة في قطر`,
    description: `Contact ${brandName("en")} for jewelry support, seller partnerships, and secure marketplace assistance in Qatar.`,
    descriptionAr: `تواصل مع ${brandName("ar")} للحصول على دعم المجوهرات، شراكات البائعين، ومساعدة احترافية داخل منصة السوق في قطر.`,
  });
  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: "/contact",
      languages: { en: "/contact", ar: "/contact" },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      type: "website",
    },
  };
}

export default function ContactPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const brand = t(language, "common.brand");
  return (
    <div>
      {/* 1. Hero Contact Section — minimal, elegant */}
      <section
        className="relative py-14 md:py-28 bg-white overflow-hidden"
        aria-labelledby="contact-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/60 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "تواصل معنا" : "Get in touch"}
          </p>
          <h1
            id="contact-hero-heading"
            className="text-3xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-4 md:mb-6"
          >
            {isArabic ? `تواصل مع ${brand}` : `Contact ${brand}`}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? "نحن هنا لمساعدتك في مشتريات المجوهرات الفاخرة، وشراكات البائعين، ودعم المنصة."
              : "We are here to assist you with luxury purchases, seller partnerships, and platform support."}
          </p>
        </div>
      </section>

      {/* 2. Form + Business Info — single elegant block */}
      <section
        className="py-12 md:py-20 bg-masa-light/40"
        aria-labelledby="contact-form-heading"
      >
        <div className="max-w-content mx-auto px-4 md:px-6">
          <h2 id="contact-form-heading" className="sr-only">
            {isArabic ? "أرسل رسالة أو تواصل معنا مباشرة" : "Send a message or reach us directly"}
          </h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Form card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-primary/10 p-8 md:p-10 lg:p-12 shadow-[0_4px_24px_rgba(83,28,36,0.06)]">
                <h3 className="font-luxury text-xl text-primary mb-6">{isArabic ? "أرسل رسالة" : "Send a message"}</h3>
                <ContactForm />
              </div>
            </div>
            {/* Contact details — elegant vertical list */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h3 className="font-luxury text-xl text-primary mb-8">{isArabic ? "تواصل معنا مباشرة" : "Reach us directly"}</h3>
              <ul className="space-y-8 font-sans">
                <li className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/15 text-primary">
                    <MapPin className="w-5 h-5" aria-hidden />
                  </span>
                  <p className="text-masa-dark">{isArabic ? "الدوحة، قطر" : "Doha, Qatar"}</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/15 text-primary">
                    <Mail className="w-5 h-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-masa-dark">{isArabic ? "البريد الإلكتروني" : "Email"}</p>
                    <a href="mailto:support@masajewelry.com" className="text-masa-dark hover:text-primary block mt-0.5">support@masajewelry.com</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/15 text-primary">
                    <Phone className="w-5 h-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-masa-dark">{isArabic ? "الهاتف" : "Phone"}</p>
                    <a
                      href="tel:+97472233141"
                      dir="ltr"
                      className="text-masa-dark hover:text-primary mt-0.5 inline-block tabular-nums"
                    >
                      +974&nbsp;7223&nbsp;3141
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Section — refined cards */}
      <section
        className="py-16 md:py-24 bg-white"
        aria-labelledby="trust-heading"
      >
        <div className="max-w-content mx-auto px-4 md:px-6">
          <h2
            id="trust-heading"
            className="font-luxury text-3xl md:text-4xl text-primary text-center mb-4"
          >
            {isArabic ? `لماذا تتواصل مع ${brand}` : `Why Contact ${brand}`}
          </h2>
          <p className="text-masa-gray font-sans text-center max-w-lg mx-auto mb-12">
            {isArabic ? "نمزج بين الخصوصية والأمان وسرعة الاستجابة في كل تواصل." : "We combine discretion, security and speed in every response."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="group text-center p-8 md:p-10 rounded-2xl border border-primary/10 bg-masa-light/30 hover:border-primary/20 hover:bg-masa-light/50 transition-all duration-300">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 text-primary mb-5">
                <Headphones className="w-7 h-7" aria-hidden />
              </span>
              <h3 className="font-luxury text-lg text-primary mb-2">{isArabic ? "دعم فاخر مخصص" : "Dedicated luxury support"}</h3>
              <p className="font-sans text-masa-gray text-sm leading-relaxed">
                {isArabic
                  ? "فريقنا مدرّب للتعامل مع استفسارات المجوهرات عالية القيمة وشراكات الأعمال."
                  : "Our team is trained to assist with high-value jewelry inquiries and partnerships."}
              </p>
            </div>
            <div className="group text-center p-8 md:p-10 rounded-2xl border border-primary/10 bg-masa-light/30 hover:border-primary/20 hover:bg-masa-light/50 transition-all duration-300">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 text-primary mb-5">
                <Shield className="w-7 h-7" aria-hidden />
              </span>
              <h3 className="font-luxury text-lg text-primary mb-2">{isArabic ? "تواصل آمن" : "Secure communication"}</h3>
              <p className="font-sans text-masa-gray text-sm leading-relaxed">
                {isArabic
                  ? "تُدار بياناتك ورسائلك بسرية كاملة وبمعايير أمان عالية."
                  : "Your details and messages are handled with confidentiality and security."}
              </p>
            </div>
            <div className="group text-center p-8 md:p-10 rounded-2xl border border-primary/10 bg-masa-light/30 hover:border-primary/20 hover:bg-masa-light/50 transition-all duration-300">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 text-primary mb-5">
                <Clock className="w-7 h-7" aria-hidden />
              </span>
              <h3 className="font-luxury text-lg text-primary mb-2">{isArabic ? "سرعة في الاستجابة" : "Fast response time"}</h3>
              <p className="font-sans text-masa-gray text-sm leading-relaxed">
                {isArabic ? "نهدف إلى الرد على جميع الاستفسارات خلال 24-48 ساعة." : "We aim to respond to all inquiries within 24–48 hours."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section
        id="faq"
        className="py-16 md:py-24 bg-masa-light/40 border-t border-primary/10 scroll-mt-24"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-content mx-auto px-4 md:px-6">
          <h2
            id="faq-heading"
            className="font-luxury text-3xl md:text-4xl text-primary text-center mb-4"
          >
            {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
          <p className="text-masa-gray font-sans text-center max-w-lg mx-auto mb-12">
            {isArabic ? `إجابات سريعة حول التسوق والبيع واستخدام ${brand}.` : `Quick answers about shopping, selling, and using ${brand}.`}
          </p>
          <div className="max-w-2xl mx-auto space-y-3">
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? `كيف أشتري المجوهرات عبر ${brand}؟` : `How do I buy jewelry on ${brand}?`}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5">
                {isArabic
                  ? `تصفّح المتجر، أضف المنتجات إلى السلة، ثم أكمل الدفع بأمان. يمكنك الدفع بالبطاقة أو التحويل البنكي أو الدفع عند الاستلام حسب المتاح. جميع البائعين موثّقون من ${brand}.`
                  : `Browse the marketplace, add items to your cart, and checkout securely. You can pay by card, bank transfer, or cash on delivery where available. All sellers are verified by ${brand}.`}
              </div>
            </details>
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? "كيف يمكنني أن أصبح بائعاً؟" : "How can I become a seller?"}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5">
                {isArabic
                  ? "قدّم عبر صفحة طلب الانضمام للبائعين. نراجع بيانات متجرك ووثائقك، وبعد الموافقة تحصل على متجر رقمي وتحليلات ذكية والوصول إلى شبكة المشترين في قطر والمنطقة."
                  : "Apply via our seller application page. We review your store details and documentation. Once approved, you get a digital storefront, AI insights, and access to our buyer network across Qatar and the region."}
              </div>
            </details>
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? "ما خيارات التوصيل المتاحة؟" : "What delivery options are available?"}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5">
                {isArabic
                  ? "تعتمد خيارات التوصيل على البائع. يوفر معظمهم التوصيل داخل قطر وبعضهم يوصل دولياً. ستظهر الخيارات المتاحة أثناء الدفع. قد تتطلب المنتجات عالية القيمة توقيع الاستلام أو توصيلاً مؤمّناً."
                  : "Delivery options depend on the seller. Most offer delivery within Qatar and some deliver internationally. You will see available options at checkout. High-value items may require signature or insured delivery."}
              </div>
            </details>
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? "كم تستغرق عملية توصيل الطلب؟" : "How long does order delivery take?"}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div
                className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5 space-y-3"
                dir={isArabic ? "rtl" : "ltr"}
              >
                <p>
                  {isArabic
                    ? "يتم توصيل الطلب خلال ساعات من نفس اليوم وبأسرع وقت ممكن. وتختلف مدة التوصيل حسب:"
                    : "Orders are delivered within hours on the same day whenever possible, as fast as conditions allow. Delivery time varies depending on:"}
                </p>
                <ul className={`list-disc space-y-1.5 ${isArabic ? "pr-5 mr-1" : "pl-5 ml-1"}`}>
                  {isArabic ? (
                    <>
                      <li>توفر المنتج</li>
                      <li>موقع المتجر</li>
                      <li>موقع العميل</li>
                      <li>أوقات المواسم والعروض</li>
                      <li>أحوال جوية أو ظروف خارجية</li>
                    </>
                  ) : (
                    <>
                      <li>Product availability</li>
                      <li>Store location</li>
                      <li>Customer location</li>
                      <li>Peak seasons and promotional periods</li>
                      <li>Weather or other external circumstances</li>
                    </>
                  )}
                </ul>
              </div>
            </details>
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? "ما هي سياسة الإرجاع لديكم؟" : "What is your return policy?"}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div
                className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5 space-y-2"
                dir={isArabic ? "rtl" : "ltr"}
              >
                <p>
                  {isArabic
                    ? "لا تقدم منصة ماسا استرداداً نقدياً للمبالغ المدفوعة. أي استبدال أو تسوية غير نقدية يخضع لسياسة المتجر المعروضة على صفحة المتجر وفي الشروط والأحكام للعملاء."
                    : `${brand} does not offer cash refunds. Exchanges or non-cash resolutions are governed only by each store’s policy as shown on the store page and in our Customer Terms & Conditions.`}
                </p>
                <p>
                  {isArabic
                    ? "راجع سياسة المتجر قبل الشراء؛ للمساعدة يمكنك التواصل مع المتجر أو فريق الدعم."
                    : "Review the store’s policy before purchase; contact the store or our support team for assistance."}
                </p>
              </div>
            </details>
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? "كيف يعمل المستشار الذكي للمجوهرات؟" : "How does the AI Jewelry Advisor work?"}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5">
                {isArabic
                  ? "أجب عن بعض الأسئلة حول الذوق والمناسبة والميزانية. يقدّم الذكاء الاصطناعي توصيات من بائعين موثّقين تناسب تفضيلاتك. الخدمة مجانية وتساعدك على الوصول للقطعة المناسبة بسرعة."
                  : "Answer a few questions about style, occasion, and budget. Our AI recommends pieces from verified sellers that match your preferences. It’s free to use and helps you discover the right piece faster."}
              </div>
            </details>
            <details className="group bg-white rounded-xl border border-primary/10 overflow-hidden">
              <summary className="font-sans font-medium text-masa-dark px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-masa-light/50 transition-colors [&::-webkit-details-marker]:hidden">
                {isArabic ? "هل بياناتي وعمليات الدفع آمنة؟" : "Is my payment and data secure?"}
                <span className="shrink-0 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-open:rotate-180 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-4 pt-0 font-sans text-masa-gray text-sm leading-relaxed border-t border-primary/5">
                {isArabic
                  ? "نعم. نستخدم معالجة دفع آمنة ونحمي بياناتك الشخصية. البائعون موثّقون، وندعم تواصلاً آمناً طوال المعاملة. لأي استفسار خاص يمكنك التواصل عبر support@masajewelry.com."
                  : "Yes. We use secure payment processing and protect your personal data. Sellers are verified, and we support secure communication throughout the transaction. For specific concerns, contact support@masajewelry.com."}
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 5. Seller CTA Section */}
      <section
        className="relative py-24 md:py-32 bg-primary text-white overflow-hidden"
        aria-labelledby="seller-cta-heading"
      >
        <DiamondPattern className="opacity-10" />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <h2
            id="seller-cta-heading"
            className="font-luxury text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            {isArabic ? `انضم كبائع في ${brand}` : `Become a ${brand} Seller`}
          </h2>
          <p className="text-secondary font-sans text-lg max-w-2xl mx-auto mb-10">
            {isArabic
              ? "انضم إلى سوق فاخر للمجوهرات مدعوم بالذكاء الاصطناعي، ووسّع وصولك إلى عملاء ذوي قيمة عالية في قطر والشرق الأوسط."
              : "Join a premium AI-powered jewelry marketplace and reach high-value buyers across Qatar and the Middle East."}
          </p>
          <Link href="/apply">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-secondary px-8 md:px-10"
            >
              {isArabic ? "قدّم كبائع" : "Apply as Seller"}
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. SEO Content Block */}
      <section className="py-12 md:py-16 bg-white border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <p className="font-sans text-masa-gray text-sm md:text-base max-w-3xl mx-auto text-center leading-relaxed">
            {isArabic
              ? `${brand} سوق إلكتروني موثوق للمجوهرات الفاخرة في قطر، يوفّر خدمات رقمية آمنة للشراء والبيع والتقييم واكتشاف المجوهرات بذكاء.`
              : `${brand} is a trusted online luxury jewelry marketplace in Qatar, offering secure digital services for buying, selling, valuation, and intelligent jewelry discovery powered by AI technology.`}
          </p>
        </div>
      </section>
    </div>
  );
}
