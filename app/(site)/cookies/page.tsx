import type { Metadata } from "next";
import Link from "next/link";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  return {
    title: language === "ar" ? `سياسة ملفات الارتباط | ${b}` : `Cookie Policy | ${b} Luxury Jewelry`,
    description:
      language === "ar"
        ? `كيف تستخدم ${b} ملفات تعريف الارتباط على منصة المجوهرات.`
        : `How ${b} uses cookies and similar technologies on its luxury jewelry marketplace.`,
  };
}

export default function CookiesPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const brand = t(language, "common.brand");
  return (
    <div>
      <section
        className="relative py-20 md:py-28 bg-white overflow-hidden"
        aria-labelledby="cookies-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "قانوني" : "Legal"}
          </p>
          <h1
            id="cookies-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-6"
          >
            {isArabic ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic ? `كيف نستخدم ملفات تعريف الارتباط والتقنيات المشابهة في منصة ${brand}.` : `How we use cookies and similar technologies on ${brand}.`}
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
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "ما هي ملفات تعريف الارتباط" : "What are cookies"}</h2>
              <p>
                {isArabic
                  ? "ملفات تعريف الارتباط ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة الموقع. تساعدنا على تذكّر تفضيلاتك، والإبقاء على جلستك، وفهم استخدام الموقع لتحسينه."
                  : "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how the site is used so we can improve it."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "الملفات التي نستخدمها" : "Cookies we use"}</h2>
              <p>
                {isArabic
                  ? "نستخدم ملفات أساسية ضرورية لعمل الموقع (مثل تسجيل الدخول والأمان وتوزيع الأحمال). قد نستخدم ملفات تحليلات لفهم استخدام المنصة بشكل مجمّع. قد نستخدم ملفات تفضيلات لتذكّر الإعدادات مثل العملة أو المنطقة. عند استخدام ملفات غير أساسية نطلب الموافقة حيث يقتضي القانون."
                  : `We use essential cookies required for the site to work (e.g. authentication, security, load balancing). We may use analytics cookies to understand how visitors use ${brand} in an aggregated way. We may use preference cookies for settings like currency or region. Where we use non-essential cookies, we seek your consent where required by law.`}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "ملفات الطرف الثالث" : "Third-party cookies"}</h2>
              <p>
                {isArabic
                  ? "قد يضع شركاء الدفع أو التحليلات ملفاتهم الخاصة عند استخدام خدماتهم ضمن موقعنا. يخضع استخدامهم لسياسات الخصوصية والملفات الخاصة بهم."
                  : "Payment and analytics partners may set their own cookies when you use their features on our site. Their use is governed by their respective privacy and cookie policies."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "إدارة ملفات الارتباط" : "Managing cookies"}</h2>
              <p>
                {isArabic ? (
                  <>
                    يمكنك التحكم في الملفات أو حذفها من إعدادات المتصفح. قد يؤثر حظر الملفات الأساسية على عمل الموقع (مثل بقائك مسجّلاً). لمزيد من التفاصيل راجع{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      سياسة الخصوصية
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    You can control or delete cookies through your browser settings. Blocking essential cookies may affect how the site works (e.g. you may not stay signed in). For more on your choices, see our{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
            <p className="pt-4">
              {isArabic ? "لديك أسئلة؟" : "Questions?"}{" "}
              <Link href="/contact" className="text-primary hover:underline">
                {isArabic ? "تواصل معنا" : "Contact us"}
              </Link>
              . {isArabic ? "قد يتم تحديث هذه السياسة من وقت لآخر؛ تظهر النسخة الحالية على هذه الصفحة." : "We may update this policy from time to time; the latest version is on this page."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
