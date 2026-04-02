import type { Language } from "@/lib/language";

export type MerchantTermsSubsection = {
  title: { en: string; ar: string };
  bullets: { en: string[]; ar: string[] };
};

/** Merchant / store T&Cs — bilingual. Supports subsections and a secondary bullet block. */
export type MerchantTermsSection = {
  id: string;
  title: { en: string; ar: string };
  intro?: { en: string; ar: string };
  subsections?: MerchantTermsSubsection[];
  bullets?: { en: string[]; ar: string[] };
  paragraphs?: { en: string[]; ar: string[] };
  secondaryIntro?: { en: string; ar: string };
  secondaryBullets?: { en: string[]; ar: string[] };
};

/**
 * MASA merchant (store) Terms & Conditions.
 * Arabic source + English counterpart. Bump {@link MERCHANT_TERMS_VERSION} when this file changes.
 */
export const MERCHANT_TERMS_SECTIONS: MerchantTermsSection[] = [
  {
    id: "definitions",
    title: { en: "1. Definitions", ar: "1. التعريفات" },
    bullets: {
      ar: [
        "المنصة: تطبيق وموقع ماسا",
        "المتجر: التاجر أو الجهة المسجلة لعرض وبيع المنتجات",
        "العميل: المستخدم الذي يقوم بالشراء عبر المنصة",
        "المنتجات: المجوهرات المعروضة للبيع في المنصة عبر المتجر",
      ],
      en: [
        "The Platform: the Masa application and website.",
        "The Store: the merchant or registered entity that lists and sells products.",
        "The Customer: the user who purchases through the Platform.",
        "The Products: jewelry offered for sale on the Platform through the Store.",
      ],
    },
  },
  {
    id: "scope",
    title: { en: "2. Scope of Agreement", ar: "2. نطاق الاتفاقية" },
    paragraphs: {
      ar: [
        "بمجرد تسجيل المتجر في منصة ماسا، يوافق على الالتزام بجميع الشروط والأحكام الواردة في هذه السياسة، وتعتبر هذه الاتفاقية ملزمة قانونيًا.",
      ],
      en: [
        "By registering a Store on the Masa Platform, the merchant agrees to comply with all terms and conditions set out in this policy; this agreement is legally binding.",
      ],
    },
  },
  {
    id: "joining",
    title: { en: "3. Joining requirements", ar: "3. شروط الانضمام" },
    intro: { ar: "يلتزم المتجر بـ:", en: "The Store undertakes to:" },
    bullets: {
      ar: [
        "تقديم سجل تجاري وترخيص ساري",
        "تقديم معلومات صحيحة وكاملة",
        "اجتياز عملية التحقق والمراجعة من قبل المنصة",
        "الالتزام بالقوانين المحلية في دولة قطر",
      ],
      en: [
        "Provide a valid commercial registration and license.",
        "Provide accurate and complete information.",
        "Pass verification and review by the Platform.",
        "Comply with local laws in the State of Qatar.",
      ],
    },
  },
  {
    id: "store-obligations",
    title: { en: "4. Store obligations", ar: "4. التزامات المتجر" },
    subsections: [
      {
        title: {
          en: "4.1 Product quality and preparation speed",
          ar: "4.1 جودة المنتجات وسرعة التجهيز",
        },
        bullets: {
          ar: [
            "ضمان أصالة المنتجات وعدم بيع المنتجات المقلدة أو المضللة",
            "دقة جميع المعلومات (مثل العيار، الوزن، نوع الحجر الكريم)",
            "تجهيز الطلب وتسليمه لمندوب التوصيل خلال ساعة واحدة على الأكثر",
          ],
          en: [
            "Guarantee authenticity of products and not sell counterfeit or misleading items.",
            "Ensure accuracy of all information (e.g. karat, weight, type of gemstone).",
            "Prepare the order and hand it to the delivery courier within one hour at most.",
          ],
        },
      },
      {
        title: {
          en: "4.2 Product listing",
          ar: "4.2 عرض المنتجات",
        },
        bullets: {
          ar: [
            "رفع صور احترافية وحقيقية",
            "كتابة وصف دقيق",
            "تحديث الأسعار والمخزون باستمرار",
            "الحصول على التراخيص اللازمة لأي نشاط تجاري عبر المنصة بما في ذلك إطلاق العروض الترويجية",
          ],
          en: [
            "Upload professional, genuine photos.",
            "Write accurate descriptions.",
            "Keep prices and stock updated continuously.",
            "Obtain any licenses required for commercial activity on the Platform, including promotional campaigns.",
          ],
        },
      },
      {
        title: {
          en: "4.3 Pricing",
          ar: "4.3 التسعير",
        },
        bullets: {
          ar: [
            "الالتزام بالشفافية وعدم التضليل",
            "شمول جميع الرسوم بوضوح",
          ],
          en: [
            "Commit to transparency and avoid misleading pricing.",
            "Include all fees clearly.",
          ],
        },
      },
    ],
  },
  {
    id: "orders",
    title: { en: "5. Order management", ar: "5. إدارة الطلبات" },
    bullets: {
      ar: [
        "الالتزام باستلام ومعالجة الطلبات بشكل فوري",
        "تجهيز الطلب خلال المدة المحددة",
        "تحديث حالة الطلب عبر لوحة التحكم",
        "إلغاء الطلب فقط في حالات مبررة بالنسبة لإدارة المنصة",
      ],
      en: [
        "Accept and process orders promptly.",
        "Prepare orders within the specified timeframe.",
        "Update order status via the dashboard.",
        "Cancel orders only in cases justified to Platform management.",
      ],
    },
  },
  {
    id: "returns",
    title: { en: "6. Returns and exchanges", ar: "6. الاستبدال والاسترجاع" },
    bullets: {
      ar: [
        "يتلزم المتجر بتحديد سياسة الاستبدال والتسوية دون استرداد نقدي عبر المنصة",
        "قبول الطلبات المستحقة وفق السياسة المعروضة",
        "إتمام الاستبدال أو الترتيبات غير النقدية المتفق عليها خلال المدة المحددة حيث ينطبق ذلك",
        "لا يمكن التعديل على سياسة الاستبدال والاسترجاع إلا بعد مرور أسبوع على آخر طلب للمتجر، مع عدم وجود طلبات نشطة عند التعديل.",
      ],
      en: [
        "The Store must define its exchange and replacement policy without cash refunds through the Platform.",
        "Accept eligible requests in line with the published policy.",
        "Complete exchanges or agreed non-cash resolutions within the stated period where applicable.",
        "Return/exchange policy may not be changed until one week after the Store’s last order, and only when there are no active orders at the time of change.",
      ],
    },
  },
  {
    id: "reviews",
    title: { en: "7. Ratings and reviews", ar: "7. التقييمات والمراجعات" },
    bullets: {
      ar: [
        "يحق للعملاء تقييم المتجر والمنتجات",
        "لا يجوز التلاعب أو التأثير على التقييمات",
        "تراقب المنصة جودة الأداء بناءً على التقييمات",
      ],
      en: [
        "Customers may rate the Store and products.",
        "Manipulation or influence on ratings is prohibited.",
        "The Platform monitors performance quality based on ratings.",
      ],
    },
  },
  {
    id: "fees",
    title: { en: "8. Fees and commissions", ar: "8. الرسوم والعمولات" },
    intro: { ar: "تلتزم المتاجر بدفع:", en: "Stores agree to pay:" },
    bullets: {
      ar: [
        "رسوم التسجيل والاشتراك",
        "عمولة على الطلبات",
        "رسوم الخدمات الإضافية (إن وجدت)",
        "تحتفظ المنصة بحق تعديل الرسوم مع إشعار مسبق",
      ],
      en: [
        "Registration and subscription fees.",
        "Commission on orders.",
        "Additional service fees (if any).",
        "The Platform reserves the right to adjust fees with prior notice.",
      ],
    },
  },
  {
    id: "dashboard",
    title: { en: "9. Dashboard and data", ar: "9. لوحة التحكم والبيانات" },
    bullets: {
      ar: [
        "توفر المنصة لوحة تحكم لإدارة العمليات",
        "يلتزم المتجر باستخدامها بشكل صحيح ودقيق",
        "البيانات التحليلية المقدمة لأغراض تشغيلية فقط",
      ],
      en: [
        "The Platform provides a dashboard to manage operations.",
        "The Store must use it correctly and accurately.",
        "Analytics data is provided for operational purposes only.",
      ],
    },
  },
  {
    id: "sync",
    title: { en: "10. Synchronization and technology", ar: "10. التزامن والتقنيات" },
    bullets: {
      ar: [
        "توفر المنصة تكاملًا بين التطبيق والموقع الإلكتروني",
        "المتجر مسؤول عن تحديث بياناته وتدقيقها بشكل مستمر",
        "لا تتحمل المنصة مسؤولية الأخطاء الناتجة عن الإدخال الخاطئ أو تقصير المتجر",
      ],
      en: [
        "The Platform provides integration between the app and the website.",
        "The Store is responsible for continuously updating and verifying its data.",
        "The Platform is not liable for errors due to incorrect entry or Store negligence.",
      ],
    },
  },
  {
    id: "marketing",
    title: { en: "11. Marketing and promotions", ar: "11. التسويق والعروض" },
    bullets: {
      ar: [
        "يمكن للمتجر تقديم عروض وخصومات",
        "العروض المؤهلة قد تظهر في قسم «العروض»",
        "يحق للمنصة استخدام صور منتجات المتجر",
      ],
      en: [
        "The Store may offer promotions and discounts.",
        "Eligible offers may appear in the “Offers” section.",
        "The Platform may use the Store’s product images.",
      ],
    },
  },
  {
    id: "ip",
    title: { en: "12. Intellectual property", ar: "12. الملكية الفكرية" },
    bullets: {
      ar: [
        "يحتفظ كل طرف بحقوقه",
        "يمنح المتجر المنصة حق استخدام الصور والمحتوى والعلامة التجارية لأغراض التسويق",
      ],
      en: [
        "Each party retains its own rights.",
        "The Store grants the Platform the right to use images, content, and trademarks for marketing purposes.",
      ],
    },
  },
  {
    id: "violations",
    title: { en: "13. Violations and sanctions", ar: "13. المخالفات والعقوبات" },
    intro: {
      ar: "يحق للمنصة اتخاذ الإجراءات التالية:",
      en: "The Platform may take the following actions:",
    },
    bullets: {
      ar: ["تنبيه المتجر", "إيقاف مؤقت", "إغلاق الحساب أو إنهاء التعاقد"],
      en: ["Warning the Store", "Temporary suspension", "Account closure or termination of the agreement"],
    },
    secondaryIntro: {
      ar: "وذلك في حال:",
      en: "Including where:",
    },
    secondaryBullets: {
      ar: [
        "بيع منتجات مقلدة",
        "تكرار شكاوى العملاء",
        "عدم الالتزام بالشروط",
        "ضعف الأداء والتقييمات",
      ],
      en: [
        "Selling counterfeit products.",
        "Repeated customer complaints.",
        "Non-compliance with these terms.",
        "Poor performance and ratings.",
      ],
    },
  },
  {
    id: "termination",
    title: { en: "14. Termination", ar: "14. الإنهاء" },
    bullets: {
      ar: [
        "يحق للمتجر إنهاء التعاقد بإشعار مسبق حسب المدة المحددة",
        "تسوية جميع المستحقات المالية قبل الإنهاء",
      ],
      en: [
        "The Store may terminate the agreement with prior notice as specified.",
        "Settle all financial dues before termination.",
      ],
    },
  },
  {
    id: "liability",
    title: { en: "15. Limitation of liability", ar: "15. حدود المسؤولية" },
    bullets: {
      ar: [
        "المنصة وسيط بين المتجر والعميل",
        "المتجر مسؤول عن جودة المنتج",
        "المنصة مسؤولة عن توصيل المنتج",
        "لا تتحمل المنصة أي أضرار ناتجة عن سوء استخدام الخدمة",
      ],
      en: [
        "The Platform is an intermediary between the Store and the Customer.",
        "The Store is responsible for product quality.",
        "The Platform is responsible for delivery of the product.",
        "The Platform is not liable for damages arising from misuse of the service.",
      ],
    },
  },
  {
    id: "amendments",
    title: { en: "16. Amendments", ar: "16. التعديلات" },
    bullets: {
      ar: [
        "تحتفظ المنصة بحق تعديل هذه السياسة",
        "يتم إشعار المتاجر بأي تحديثات",
      ],
      en: [
        "The Platform reserves the right to amend this policy.",
        "Stores will be notified of any updates.",
      ],
    },
  },
  {
    id: "law",
    title: { en: "17. Governing law", ar: "17. القانون المعمول به" },
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
        "باستخدام منصة ماسا، يقر المتجر بموافقته الكاملة على جميع الشروط والأحكام، والتزامه بتقديم تجربة موثوقة وفاخرة تعكس هوية المنصة.",
      ],
      en: [
        "By using the Masa Platform, the Store acknowledges its full acceptance of all terms and conditions and its commitment to providing a trustworthy, luxury experience that reflects the identity of the Platform.",
      ],
    },
  },
];

export function getMerchantTermsTitle(language: Language): string {
  return language === "ar"
    ? "الشروط والأحكام للمتاجر في منصة ماسا"
    : "Masa Merchant Terms & Conditions";
}

export function merchantSectionTitle(section: MerchantTermsSection, language: Language): string {
  return language === "ar" ? section.title.ar : section.title.en;
}

export function merchantSectionIntro(section: MerchantTermsSection, language: Language): string | undefined {
  if (!section.intro) return undefined;
  return language === "ar" ? section.intro.ar : section.intro.en;
}

export function merchantSectionBullets(section: MerchantTermsSection, language: Language): string[] {
  if (!section.bullets) return [];
  return language === "ar" ? section.bullets.ar : section.bullets.en;
}

export function merchantSectionParagraphs(section: MerchantTermsSection, language: Language): string[] {
  if (!section.paragraphs) return [];
  return language === "ar" ? section.paragraphs.ar : section.paragraphs.en;
}

export function merchantSubsections(section: MerchantTermsSection): MerchantTermsSubsection[] {
  return section.subsections ?? [];
}

export function merchantSecondaryIntro(section: MerchantTermsSection, language: Language): string | undefined {
  if (!section.secondaryIntro) return undefined;
  return language === "ar" ? section.secondaryIntro.ar : section.secondaryIntro.en;
}

export function merchantSecondaryBullets(section: MerchantTermsSection, language: Language): string[] {
  if (!section.secondaryBullets) return [];
  return language === "ar" ? section.secondaryBullets.ar : section.secondaryBullets.en;
}
