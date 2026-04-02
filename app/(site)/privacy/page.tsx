import type { Metadata } from "next";
import Link from "next/link";
import { getServerLanguage } from "@/lib/language-server";

export const metadata: Metadata = {
  title: "Privacy Policy | MASA Luxury Jewelry",
  description:
    "Privacy policy for MASA luxury jewelry marketplace. How we collect, use and protect your data.",
};

export default function PrivacyPage() {
  const isArabic = getServerLanguage() === "ar";
  return (
    <div>
      <section
        className="relative py-20 md:py-28 bg-white overflow-hidden"
        aria-labelledby="privacy-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "قانوني" : "Legal"}
          </p>
          <h1
            id="privacy-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury tracking-tight mb-6"
          >
            {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="text-masa-gray font-sans text-lg max-w-xl mx-auto leading-relaxed">
            {isArabic ? "كيف نجمع بياناتك الشخصية ونستخدمها ونحميها في منصة ماسا." : "How we collect, use and protect your personal information on MASA."}
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
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "من نحن" : "Who we are"}</h2>
              <p>
                {isArabic
                  ? "تصف هذه السياسة كيفية تعامل منصة ماسا مع البيانات الشخصية عند استخدامك للموقع أو التطبيق أو الخدمات المرتبطة (التسوق، الحساب، التواصل، والدعم)."
                  : "This policy describes how MASA handles personal data when you use our website, app, or related services (shopping, accounts, contact, and support)."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "البيانات التي نجمعها" : "Information we collect"}</h2>
              <p>
                {isArabic
                  ? "نجمع المعلومات التي تقدمها عند التسجيل أو تقديم الطلبات أو التواصل معنا أو استخدام الخدمات، مثل الاسم والبريد والهاتف والعنوان، وبيانات الدفع التي تُعالج عبر مزودي دفع معتمدين. كما نجمع بيانات تقنية مثل عنوان IP ومعلومات الجهاز لتحسين الخدمة والأمان ومنع الاحتيال."
                  : "We collect information you provide when you register, place orders, contact us, or use our services — such as name, email, phone, and address — and payment details processed by certified payment providers. We also collect technical data such as IP address and device information to improve our service, security, and fraud prevention."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "كيف نستخدم البيانات" : "How we use it"}</h2>
              <p>
                {isArabic
                  ? "نستخدم بياناتك لتنفيذ الطلبات والتواصل معك وتحسين السوق ومنع الاحتيال والامتثال للالتزامات القانونية. ومع موافقتك قد نرسل لك رسائل تسويقية حول المنتجات والعروض ويمكنك إلغاء الاشتراك في أي وقت."
                  : "We use your information to fulfil orders, communicate with you, improve our marketplace, prevent fraud, and comply with legal obligations. With your consent, we may send marketing about products and offers; you can opt out at any time."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "المشاركة" : "Sharing"}</h2>
              <p>
                {isArabic
                  ? "نشارك البيانات مع المتاجر عند الحاجة لتنفيذ طلباتك، ومع شركاء الدفع والتوصيل عند الاقتضاء، وعندما يقتضي القانون ذلك. لا نبيع بياناتك الشخصية لأطراف ثالثة لأغراض تسويقها الخاصة."
                  : "We share data with stores as needed to fulfil your orders, with payment and delivery partners where required, and when required by law. We do not sell your personal data to third parties for their own marketing."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "ملفات تعريف الارتباط" : "Cookies"}</h2>
              <p>
                {isArabic ? (
                  <>
                    نستخدم ملفات تعريف الارتباط والتقنيات المشابهة كما هو موضح في{" "}
                    <Link href="/cookies" className="text-primary hover:underline">
                      سياسة ملفات تعريف الارتباط
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    We use cookies and similar technologies as described in our{" "}
                    <Link href="/cookies" className="text-primary hover:underline">
                      Cookie Policy
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "الأمان" : "Security"}</h2>
              <p>
                {isArabic
                  ? "نطبق إجراءات أمنية معيارية لحماية بياناتك. تُعالج بيانات الدفع عبر معالجين معتمدين. يقتصر الوصول إلى البيانات الشخصية على من يحتاجونها."
                  : "We use industry-standard measures to protect your data. Payment information is handled by certified processors. Access to personal data is limited to those who need it."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "حقوقك" : "Your rights"}</h2>
              <p>
                {isArabic
                  ? "حسب موقعك والقانون المعمول، قد يحق لك الوصول إلى بياناتك أو تصحيحها أو حذفها أو تقييد المعالجة أو الاعتراض على بعض الأنشطة. تواصل معنا لممارسة هذه الحقوق."
                  : "Depending on your location and applicable law, you may have the right to access, correct, delete, or restrict use of your data, or to object to certain processing. Contact us to exercise these rights."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "الاحتفاظ بالبيانات" : "Retention"}</h2>
              <p>
                {isArabic
                  ? "نحتفظ بالبيانات للمدة اللازمة لتقديم الخدمات والامتثال القانوني وحل النزاعات، ثم نحذفها أو ننكّهها عندما لا تعد ضرورية."
                  : "We retain data for as long as needed to provide services, comply with law, and resolve disputes, then delete or anonymise it when no longer necessary."}
              </p>
            </div>
            <p className="pt-4">
              {isArabic ? "للاستفسار حول هذه السياسة،" : "For questions about this policy,"}{" "}
              <Link href="/contact" className="text-primary hover:underline">
                {isArabic ? "تواصل معنا" : "contact us"}
              </Link>
              . {isArabic ? "قد نحدّث هذه السياسة من وقت لآخر؛ تظهر النسخة الحالية على هذه الصفحة." : "We may update this policy from time to time; the latest version is always on this page."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
