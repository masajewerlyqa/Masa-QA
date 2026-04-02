import type { Language } from "@/lib/language";

/** One section of the customer T&Cs (bilingual). Use `intro` + `bullets`, `paragraphs` only, or both. */
export type CustomerTermsSection = {
  id: string;
  title: { en: string; ar: string };
  /** Optional line before bullet list */
  intro?: { en: string; ar: string };
  bullets?: { en: string[]; ar: string[] };
  /** Body paragraphs when not using bullets */
  paragraphs?: { en: string[]; ar: string[] };
};

/**
 * Official MASA customer Terms & Conditions (Arabic source + English counterpart).
 * Edit this file when legal text changes; bump {@link CUSTOMER_TERMS_VERSION} in `customer-terms-version.ts`.
 */
export const CUSTOMER_TERMS_SECTIONS: CustomerTermsSection[] = [
  {
    id: "definitions",
    title: { en: "Definitions", ar: "التعريفات" },
    bullets: {
      ar: [
        "المنصة: تطبيق وموقع ماسا",
        "المتجر: التاجر المسجل لعرض وبيع المنتجات",
        "العميل: المستخدم الذي يقوم بالشراء عبر المنصة",
        "المنتجات: المجوهرات المعروضة للبيع في المنصة عبر المتجر",
      ],
      en: [
        "The Platform: the Masa application and website.",
        "The Store: the registered merchant that lists and sells products.",
        "The Customer: the user who purchases through the Platform.",
        "The Products: jewelry offered for sale on the Platform through Stores.",
      ],
    },
  },
  {
    id: "scope",
    title: { en: "Scope of Agreement", ar: "نطاق الاتفاقية" },
    paragraphs: {
      ar: [
        "باستخدام منصة ماسا، يوافق العميل على الالتزام بجميع الشروط والأحكام، وتُعد هذه الاتفاقية ملزمة قانونيًا.",
      ],
      en: [
        "By using the Masa Platform, the Customer agrees to comply with all terms and conditions; this agreement is legally binding.",
      ],
    },
  },
  {
    id: "account",
    title: { en: "User Account", ar: "حساب المستخدم" },
    intro: {
      ar: "يلتزم العميل بـ:",
      en: "The Customer undertakes to:",
    },
    bullets: {
      ar: [
        "تقديم معلومات صحيحة ودقيقة",
        "الحفاظ على سرية بيانات الحساب",
        "تحمل المسؤولية عن جميع الأنشطة عبر الحساب",
      ],
      en: [
        "Provide accurate and correct information.",
        "Maintain the confidentiality of account credentials.",
        "Bear responsibility for all activity conducted through the account.",
      ],
    },
  },
  {
    id: "orders",
    title: { en: "Orders and Purchases", ar: "الطلبات والشراء" },
    bullets: {
      ar: [
        "يمكن للعميل تصفح وشراء المنتجات عبر المنصة",
        "جميع الطلبات تخضع لتوفر المنتج وتأكيد المتجر",
        "يلتزم العميل بمراجعة تفاصيل الطلب قبل إتمام الشراء",
      ],
      en: [
        "The Customer may browse and purchase products through the Platform.",
        "All orders are subject to product availability and confirmation by the Store.",
        "The Customer must review order details before completing the purchase.",
      ],
    },
  },
  {
    id: "prices",
    title: { en: "Prices and Payment", ar: "الأسعار والدفع" },
    bullets: {
      ar: [
        "جميع الأسعار موضحة بالعملة المعتمدة وتشمل كافة الرسوم",
        "يتم الدفع عبر وسائل الدفع المتاحة في المنصة",
        "لا يتم تأكيد الطلب إلا بعد إتمام عملية الدفع بنجاح",
      ],
      en: [
        "All prices are shown in the approved currency and include applicable fees.",
        "Payment is made through the payment methods available on the Platform.",
        "An order is not confirmed until the payment is successfully completed.",
      ],
    },
  },
  {
    id: "delivery",
    title: { en: "Delivery", ar: "التوصيل" },
    bullets: {
      ar: [
        "تتولى المنصة عملية توصيل الطلبات",
        "تختلف مدة التوصيل حسب الموقع والمتجر",
        "يجب على العميل تقديم عنوان دقيق",
        "لا تتحمل المنصة مسؤولية التأخير الناتج عن بيانات غير صحيحة",
      ],
      en: [
        "The Platform handles the delivery of orders.",
        "Delivery times vary depending on location and Store.",
        "The Customer must provide an accurate address.",
        "The Platform is not responsible for delays resulting from incorrect information.",
      ],
    },
  },
  {
    id: "returns",
    title: { en: "Returns and Exchanges", ar: "الاستبدال والاسترجاع" },
    bullets: {
      ar: [
        "لا تقدم المنصة استرداداً نقدياً للمبالغ المدفوعة.",
        "تخضع عمليات الاستبدال أو التسوية غير النقدية لسياسة كل متجر كما تُعرض على صفحة المتجر.",
        "يجب على العميل مراجعة سياسة المتجر قبل الشراء.",
      ],
      en: [
        "The Platform does not provide cash refunds for amounts paid.",
        "Exchanges or non-cash resolutions are subject to each Store’s policy as shown on the Store page.",
        "The Customer must review the Store’s policy before purchase.",
      ],
    },
  },
  {
    id: "quality",
    title: { en: "Product Quality", ar: "جودة المنتجات" },
    bullets: {
      ar: [
        "المتاجر مسؤولة عن جودة وأصالة المنتجات",
        "توفر المنصة بيئة موثوقة لكنها لا تتحمل مسؤولية مباشرة عن المنتج",
      ],
      en: [
        "Stores are responsible for the quality and authenticity of products.",
        "The Platform provides a trusted environment but does not bear direct liability for the product itself.",
      ],
    },
  },
  {
    id: "reviews",
    title: { en: "Ratings and Reviews", ar: "التقييمات والمراجعات" },
    bullets: {
      ar: [
        "يحق للعميل تقييم المنتجات والمتاجر",
        "يجب أن تكون التقييمات صادقة وغير مضللة",
        "يحق للمنصة مراجعة أو حذف التقييمات المخالفة",
      ],
      en: [
        "The Customer may rate products and Stores.",
        "Reviews must be honest and not misleading.",
        "The Platform may review or remove non-compliant reviews.",
      ],
    },
  },
  {
    id: "offers",
    title: { en: "Offers and Discounts", ar: "العروض والخصومات" },
    bullets: {
      ar: [
        "قد تكون العروض محدودة بمدة أو كمية معينة",
        "استبدال أو استرجاع المنتجات المخفضة يعتمد على سياسة المتجر",
      ],
      en: [
        "Offers may be limited by duration or quantity.",
        "Returns or exchanges of discounted products depend on the Store’s policy.",
      ],
    },
  },
  {
    id: "privacy",
    title: { en: "Privacy and Data", ar: "الخصوصية والبيانات" },
    bullets: {
      ar: [
        "تلتزم المنصة بحماية بيانات العملاء",
        "تُستخدم البيانات لتحسين الخدمة وتجربة المستخدم",
      ],
      en: [
        "The Platform is committed to protecting Customer data.",
        "Data is used to improve the service and user experience.",
      ],
    },
  },
  {
    id: "liability",
    title: { en: "Limitation of Liability", ar: "حدود المسؤولية" },
    bullets: {
      ar: [
        "المنصة وسيط بين العميل والمتجر",
        "المتجر مسؤول عن المنتج",
        "المنصة مسؤولة عن عملية التوصيل",
        "لا تتحمل المنصة أي أضرار ناتجة عن سوء الاستخدام أو تقصير العميل",
      ],
      en: [
        "The Platform is an intermediary between the Customer and the Store.",
        "The Store is responsible for the product.",
        "The Platform is responsible for the delivery process.",
        "The Platform is not liable for damages arising from misuse or Customer negligence.",
      ],
    },
  },
  {
    id: "violations",
    title: { en: "Violations", ar: "المخالفات" },
    intro: {
      ar: "يحق للمنصة:",
      en: "The Platform may:",
    },
    bullets: {
      ar: [
        "إلغاء الطلب في حال نقص البيانات أو عدم دقتها",
        "تعليق أو إيقاف حساب العميل في حال إساءة الاستخدام، أو مخالفة الشروط",
      ],
      en: [
        "Cancel an order if information is incomplete or inaccurate.",
        "Suspend or terminate the Customer’s account in case of abuse or breach of these terms.",
      ],
    },
  },
  {
    id: "amendments",
    title: { en: "Amendments", ar: "التعديلات" },
    bullets: {
      ar: [
        "تحتفظ المنصة بحق تعديل الشروط والأحكام",
        "يتم إشعار المستخدمين بأي تحديثات",
      ],
      en: [
        "The Platform reserves the right to amend these terms and conditions.",
        "Users will be notified of any updates.",
      ],
    },
  },
  {
    id: "law",
    title: { en: "Governing Law", ar: "القانون المعمول به" },
    paragraphs: {
      ar: [
        "تخضع هذه الاتفاقية لقوانين دولة قطر، وتُحل النزاعات عبر الجهات المختصة.",
      ],
      en: [
        "This agreement is governed by the laws of the State of Qatar; disputes shall be resolved by the competent authorities.",
      ],
    },
  },
  {
    id: "acknowledgment",
    title: { en: "Acknowledgment", ar: "الإقرار" },
    paragraphs: {
      ar: [
        "باستخدام منصة ماسا، يقر العميل بموافقته الكاملة على جميع الشروط والأحكام.",
      ],
      en: [
        "By using the Masa Platform, the Customer acknowledges full acceptance of all terms and conditions.",
      ],
    },
  },
];

export function getTermsTitle(language: Language): string {
  return language === "ar"
    ? "الشروط والأحكام للعملاء في منصة ماسا"
    : "Masa Customer Terms & Conditions";
}

export function sectionTitle(section: CustomerTermsSection, language: Language): string {
  return language === "ar" ? section.title.ar : section.title.en;
}

export function sectionIntro(section: CustomerTermsSection, language: Language): string | undefined {
  if (!section.intro) return undefined;
  return language === "ar" ? section.intro.ar : section.intro.en;
}

export function sectionBullets(section: CustomerTermsSection, language: Language): string[] {
  if (!section.bullets) return [];
  return language === "ar" ? section.bullets.ar : section.bullets.en;
}

export function sectionParagraphs(section: CustomerTermsSection, language: Language): string[] {
  if (!section.paragraphs) return [];
  return language === "ar" ? section.paragraphs.ar : section.paragraphs.en;
}
