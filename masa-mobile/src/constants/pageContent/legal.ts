export type ProseBlock = { title: string; paragraphs: string[] };

export type LegalPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ProseBlock[];
  footerNote?: string;
};

export const deliveryPage: { en: LegalPageCopy; ar: LegalPageCopy } = {
  en: {
    eyebrow: 'Delivery',
    title: 'Delivery information',
    intro:
      'Each seller arranges delivery for their orders. Check the store profile and product pages for timing, options, and any same-day promise.',
    sections: [
      {
        title: 'How delivery works on MASA',
        paragraphs: [
          'MASA connects you with verified sellers, and each seller arranges shipping for their own store. Delivery and timing notes appear on the store profile and product pages, alongside the store’s published policy—including an optional same-day delivery promise with a cutoff time when the seller enables it.',
        ],
      },
      {
        title: 'Coverage',
        paragraphs: [
          'Most sellers focus on delivery within Qatar. Some may offer other options or international shipping—always confirm on the store and product pages before you buy.',
        ],
      },
      {
        title: 'Same-day delivery',
        paragraphs: [
          'When a seller turns on same-day delivery, their store policy shows it together with a cutoff time (for example, orders before a set hour may target same-day delivery; after that, the next day may apply, depending on how the seller operates). Actual fulfilment remains with the seller.',
        ],
      },
      {
        title: 'Timing and preparation',
        paragraphs: [
          'Preparation and delivery speed vary by store, product, and season. Custom or high-value pieces may need extra business days. Sellers update order status and may add an estimated delivery date or tracking when they dispatch your package.',
        ],
      },
      {
        title: 'At checkout',
        paragraphs: [
          'Checkout confirms your delivery address and contact details (including map pin where required). Any delivery fees or available methods appear there according to the seller’s setup and your order.',
        ],
      },
      {
        title: 'Methods and security',
        paragraphs: [
          'Methods may include standard or express service, or signature and insured handling for luxury items—depending on the seller. High-value pieces may require additional safeguards.',
        ],
      },
      {
        title: 'Tracking and support',
        paragraphs: [
          'Follow your order status under Account → Orders. When the seller adds a carrier or tracking number, it appears on the order detail page. For delivery questions, message the seller from the order page or contact platform support.',
        ],
      },
      {
        title: 'Returns and delivery time',
        paragraphs: [
          'If a store offers returns or exchanges, eligibility windows usually count from your actual delivery time—not only the order date. Check the store’s policy and the policy snapshot saved with your order in order details.',
        ],
      },
    ],
    footerNote: 'For more on delivery and policies, see our FAQ or contact us.',
  },
  ar: {
    eyebrow: 'التوصيل',
    title: 'معلومات التوصيل',
    intro:
      'كل بائع ينظم التوصيل لطلباته؛ اطّلع على صفحة المتجر والمنتج لمعرفة التوقيت والخيارات.',
    sections: [
      {
        title: 'كيف يعمل التوصيل على المنصة؟',
        paragraphs: [
          'MASA تربطك ببائعين موثّقين؛ التوصيل الفعلي يتولاه كل بائع لمتجره. ستجد ملخص التوصيل والتوقيت على صفحة المتجر وعلى صفحة المنتج، إلى جانب سياسة المتجر (بما في ذلك أي وعد بالتوصيل في نفس اليوم عند تفعيله).',
        ],
      },
      {
        title: 'نطاق التغطية',
        paragraphs: [
          'يقدّم معظم البائعين التوصيل داخل قطر. قد يوفّر بعضهم خيارات أخرى أو توصيلاً دولياً؛ راجع صفحة المتجر والمنتج قبل الشراء.',
        ],
      },
      {
        title: 'التوصيل في نفس اليوم',
        paragraphs: [
          'عندما يفعّل البائع التوصيل في نفس اليوم، يظهر ذلك في سياسة المتجر مع وقت قطع (مثلاً الطلبات قبل ساعة محددة تستهدف التسليم في اليوم نفسه؛ بعدها قد يكون التسليم في اليوم التالي حسب إعدادات البائع). التنفيذ الفعلي يبقى مسؤولية البائع.',
        ],
      },
      {
        title: 'التوقيت والتجهيز',
        paragraphs: [
          'تختلف مدة التجهيز والتوصيل حسب المتجر والمنتج والموسم. قد يستغرق التجهيز عدة أيام عمل للقطع الخاصة أو العالية القيمة. يحدّث البائع حالة الطلب وقد يضيف تاريخ تسليماً تقديرياً أو بيانات تتبع عند الشحن.',
        ],
      },
      {
        title: 'عند الدفع',
        paragraphs: [
          'تؤكد صفحة الدفع عنوان التوصيل وتفاصيل الاتصال (بما في ذلك تثبيت الموقع على الخريطة حيث يُطلب ذلك). أي تكاليف توصيل أو طرق متاحة تظهر هناك حسب إعداد البائع والطلب.',
        ],
      },
      {
        title: 'طرق التوصيل والأمان',
        paragraphs: [
          'قد يشمل التوصيل خيارات قياسية أو سريعة أو تسليماً يتطلب توقيعاً أو تغطية تأمينية للقطع الفاخرة—حسب ما يقرره البائع. القطع عالية القيمة قد تتطلب إجراءات إضافية.',
        ],
      },
      {
        title: 'التتبع والدعم',
        paragraphs: [
          'تابع حالة الطلب من قسم الطلبات في حسابك. عندما يضيف البائع رقم تتبع أو شركة نقل، يظهر ذلك في تفاصيل الطلب. للاستفسارات الخاصة بالتوصيل، راسل البائع عبر صفحة الطلب أو تواصل مع دعم المنصة.',
        ],
      },
      {
        title: 'الإرجاع ووقت التسليم',
        paragraphs: [
          'عندما يوفّر المتجر الإرجاع أو الاستبدال، تُحسب المدة عادة من وقت التسليم الفعلي وليس من تاريخ الطلب فقط. راجع سياسة المتجر ونسخة السياسة المحفوظة مع طلبك في تفاصيل الطلب.',
        ],
      },
    ],
    footerNote: 'لمزيد من الأسئلة الشائعة حول التوصيل والسياسات، راجع الأسئلة الشائعة أو تواصل معنا.',
  },
};

export const returnsPage: { en: LegalPageCopy; ar: LegalPageCopy } = {
  en: {
    eyebrow: 'Policy',
    title: 'Returns & Refunds',
    intro: 'Our approach to returns and refunds for luxury jewelry purchases.',
    sections: [
      {
        title: 'Return policy',
        paragraphs: [
          'Return eligibility is set by each seller and is shown on product and store pages. Many sellers accept returns within a specified period (e.g. 14–30 days) for items in unused, resalable condition with original packaging and documentation. Custom, engraved, or made-to-order pieces may be non-returnable.',
        ],
      },
      {
        title: 'How to request a return',
        paragraphs: [
          'Go to your account → Orders, select the order, and use the option to request a return or contact the seller. Include your reason and any photos if relevant. The seller will respond with instructions (e.g. return address, packaging requirements). Once the seller receives and approves the return, they will process your refund or exchange according to their policy.',
        ],
      },
      {
        title: 'Refunds',
        paragraphs: [
          'Refunds are issued by the seller to the original payment method. Processing times vary by payment provider (typically 5–10 business days after the refund is initiated). If you paid in a currency different from your card’s currency, the amount may be converted at your bank’s rate.',
        ],
      },
      {
        title: 'Exchanges',
        paragraphs: [
          'Exchanges (e.g. for size or style) are offered at the seller’s discretion. Contact the seller through your order page to ask about exchange options. If an exchange is agreed, the seller will guide you through the process.',
        ],
      },
    ],
    footerNote: 'Need help? Contact us and we will assist where we can.',
  },
  ar: {
    eyebrow: 'السياسات',
    title: 'الإرجاع والاسترداد',
    intro: 'آلية الإرجاع والاسترداد لمشتريات المجوهرات الفاخرة.',
    sections: [
      {
        title: 'سياسة الإرجاع',
        paragraphs: [
          'شروط الإرجاع يحددها كل بائع وتظهر في صفحات المنتجات والمتاجر. يقبل العديد من البائعين الإرجاع خلال فترة محددة للمنتجات غير المستخدمة وبحالـتها الأصلية. القطع المخصصة أو المحفورة قد لا تكون قابلة للإرجاع.',
        ],
      },
      {
        title: 'طريقة طلب الإرجاع',
        paragraphs: [
          'من حسابك > الطلبات، اختر الطلب وقدّم طلب إرجاع أو تواصل مع البائع مع سبب الإرجاع والصور إن لزم. بعد استلام المرتجع والموافقة عليه، تتم معالجة الاسترداد أو الاستبدال وفق سياسة البائع.',
        ],
      },
      {
        title: 'الاسترداد',
        paragraphs: [
          'يتم الاسترداد إلى وسيلة الدفع الأصلية. تختلف مدة الإرجاع حسب مزوّد الدفع وعادة تستغرق عدة أيام عمل.',
        ],
      },
      {
        title: 'الاستبدال',
        paragraphs: [
          'الاستبدال (مثل المقاس أو التصميم) يخضع لسياسة البائع. تواصل مع البائع من صفحة الطلب لمعرفة الخيارات المتاحة.',
        ],
      },
    ],
    footerNote: 'تحتاج مساعدة؟ تواصل معنا وسنساعدك قدر الإمكان.',
  },
};

export const privacyPage: { en: LegalPageCopy; ar: LegalPageCopy } = {
  en: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'How we collect, use and protect your personal information on MASA.',
    sections: [
      {
        title: 'Who we are',
        paragraphs: [
          'This policy describes how MASA handles personal data when you use our website, app, or related services (shopping, accounts, contact, and support).',
        ],
      },
      {
        title: 'Information we collect',
        paragraphs: [
          'We collect information you provide when you register, place orders, contact us, or use our services — such as name, email, phone, and address — and payment details processed by certified payment providers. We also collect technical data such as IP address and device information to improve our service, security, and fraud prevention.',
        ],
      },
      {
        title: 'How we use it',
        paragraphs: [
          'We use your information to fulfil orders, communicate with you, improve our marketplace, prevent fraud, and comply with legal obligations. With your consent, we may send marketing about products and offers; you can opt out at any time.',
        ],
      },
      {
        title: 'Sharing',
        paragraphs: [
          'We share data with stores as needed to fulfil your orders, with payment and delivery partners where required, and when required by law. We do not sell your personal data to third parties for their own marketing.',
        ],
      },
      {
        title: 'Cookies',
        paragraphs: [
          'We use cookies and similar technologies as described in our Cookie Policy.',
        ],
      },
      {
        title: 'Security',
        paragraphs: [
          'We use industry-standard measures to protect your data. Payment information is handled by certified processors. Access to personal data is limited to those who need it.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          'Depending on your location and applicable law, you may have the right to access, correct, delete, or restrict use of your data, or to object to certain processing. Contact us to exercise these rights.',
        ],
      },
      {
        title: 'Retention',
        paragraphs: [
          'We retain data for as long as needed to provide services, comply with law, and resolve disputes, then delete or anonymise it when no longer necessary.',
        ],
      },
    ],
    footerNote:
      'For questions about this policy, contact us. We may update this policy from time to time; the latest version is always on this page.',
  },
  ar: {
    eyebrow: 'قانوني',
    title: 'سياسة الخصوصية',
    intro: 'كيف نجمع بياناتك الشخصية ونستخدمها ونحميها في منصة MASA.',
    sections: [
      {
        title: 'من نحن',
        paragraphs: [
          'تصف هذه السياسة كيفية تعامل منصة MASA مع البيانات الشخصية عند استخدامك للموقع أو التطبيق أو الخدمات المرتبطة (التسوق، الحساب، التواصل، والدعم).',
        ],
      },
      {
        title: 'البيانات التي نجمعها',
        paragraphs: [
          'نجمع المعلومات التي تقدمها عند التسجيل أو تقديم الطلبات أو التواصل معنا أو استخدام الخدمات، مثل الاسم والبريد والهاتف والعنوان، وبيانات الدفع التي تُعالج عبر مزودي دفع معتمدين. كما نجمع بيانات تقنية مثل عنوان IP ومعلومات الجهاز لتحسين الخدمة والأمان ومنع الاحتيال.',
        ],
      },
      {
        title: 'كيف نستخدم البيانات',
        paragraphs: [
          'نستخدم بياناتك لتنفيذ الطلبات والتواصل معك وتحسين السوق ومنع الاحتيال والامتثال للالتزامات القانونية. ومع موافقتك قد نرسل لك رسائل تسويقية حول المنتجات والعروض ويمكنك إلغاء الاشتراك في أي وقت.',
        ],
      },
      {
        title: 'المشاركة',
        paragraphs: [
          'نشارك البيانات مع المتاجر عند الحاجة لتنفيذ طلباتك، ومع شركاء الدفع والتوصيل عند الاقتضاء، وعندما يقتضي القانون ذلك. لا نبيع بياناتك الشخصية لأطراف ثالثة لأغراض تسويقها الخاصة.',
        ],
      },
      {
        title: 'ملفات تعريف الارتباط',
        paragraphs: ['نستخدم ملفات تعريف الارتباط والتقنيات المشابهة كما هو موضح في سياسة ملفات تعريف الارتباط.'],
      },
      {
        title: 'الأمان',
        paragraphs: [
          'نطبق إجراءات أمنية معيارية لحماية بياناتك. تُعالج بيانات الدفع عبر معالجين معتمدين. يقتصر الوصول إلى البيانات الشخصية على من يحتاجونها.',
        ],
      },
      {
        title: 'حقوقك',
        paragraphs: [
          'حسب موقعك والقانون المعمول، قد يحق لك الوصول إلى بياناتك أو تصحيحها أو حذفها أو تقييد المعالجة أو الاعتراض على بعض الأنشطة. تواصل معنا لممارسة هذه الحقوق.',
        ],
      },
      {
        title: 'الاحتفاظ بالبيانات',
        paragraphs: [
          'نحتفظ بالبيانات للمدة اللازمة لتقديم الخدمات والامتثال القانوني وحل النزاعات، ثم نحذفها عندما لا تعد ضرورية.',
        ],
      },
    ],
    footerNote:
      'للاستفسار حول هذه السياسة، تواصل معنا. قد نحدّث هذه السياسة من وقت لآخر؛ تظهر النسخة الحالية على هذه الصفحة.',
  },
};

export const termsPage: { en: LegalPageCopy; ar: LegalPageCopy } = {
  en: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'Terms governing your use of the MASA marketplace and services.',
    sections: [
      {
        title: 'Acceptance',
        paragraphs: [
          'By using MASA (the website and services), you agree to these terms and to the Customer or Merchant Terms & Conditions where they apply. If you do not agree, do not use the platform. We may update these terms; continued use after changes means you accept the updated terms.',
        ],
      },
      {
        title: 'The marketplace',
        paragraphs: [
          'MASA is a marketplace connecting buyers with jewelry sellers. We do not own listed products; each sale is between you and the seller. We provide the platform, tools, and support to facilitate secure, transparent transactions.',
        ],
      },
      {
        title: 'Your account',
        paragraphs: [
          'You must provide accurate information and keep your account secure. You are responsible for activity under your account. Sellers must comply with our policies and applicable laws.',
        ],
      },
      {
        title: 'Purchases and payments',
        paragraphs: [
          'When you buy an item, you agree to pay the stated price and any applicable delivery fees and taxes. Payment is processed through secure partners. Disputes about the product or delivery are primarily with the seller; we may help coordinate resolution where appropriate.',
        ],
      },
      {
        title: 'Returns, exchanges — no cash refunds',
        paragraphs: [
          'MASA does not provide cash refunds or money-back guarantees for amounts paid. Any exchange, replacement, or non-cash resolution is governed solely by the applicable store’s policy as shown on the store page. By placing an order, you acknowledge that the platform does not refund money.',
        ],
      },
      {
        title: 'Delivery',
        paragraphs: [
          'Delivery is coordinated by the platform under our operating model. Delivery times vary based on product availability, store location, customer location, peak seasons and promotions, and weather or other external factors. See our FAQ for more detail.',
        ],
      },
      {
        title: 'Prohibited conduct',
        paragraphs: [
          'You may not use MASA for fraud, counterfeit goods, or illegal activity. You may not misuse the platform, harass others, or circumvent our systems. We may suspend or terminate accounts that violate these terms.',
        ],
      },
      {
        title: 'Limitation of liability',
        paragraphs: [
          "To the extent permitted by law, MASA's liability is limited to the amount you paid for the relevant order or service. We are not liable for indirect or consequential damages, or for seller conduct outside our reasonable control.",
        ],
      },
      {
        title: 'Governing law',
        paragraphs: ['These terms are governed by the laws of the State of Qatar, where applicable.'],
      },
    ],
    footerNote: 'For questions, contact us. See also our Privacy Policy and Cookie Policy.',
  },
  ar: {
    eyebrow: 'قانوني',
    title: 'شروط الخدمة',
    intro: 'الشروط التي تحكم استخدامك لسوق MASA وخدماته.',
    sections: [
      {
        title: 'القبول',
        paragraphs: [
          'باستخدامك لمنصة MASA (الموقع والخدمات) فإنك توافق على هذه الشروط وعلى الشروط والأحكام الخاصة بالعملاء أو المتاجر حيث تنطبق. إذا كنت لا توافق، يرجى عدم استخدام المنصة. قد يتم تحديث الشروط؛ استمرار الاستخدام بعد التعديل يعني موافقتك على النسخة المحدثة.',
        ],
      },
      {
        title: 'طبيعة المنصة',
        paragraphs: [
          'MASA منصة تربط المشترين ببائعي المجوهرات. لا نملك المنتجات المدرجة؛ كل عملية بيع هي بينك وبين المتجر. نوفر المنصة والأدوات والدعم لتسهيل المعاملات بشفافية وأمان.',
        ],
      },
      {
        title: 'حسابك',
        paragraphs: [
          'يجب تقديم معلومات دقيقة والحفاظ على أمان حسابك. أنت مسؤول عن النشاط الذي يتم عبر حسابك. يلتزم البائعون بسياسات المنصة والقوانين المعمول بها.',
        ],
      },
      {
        title: 'المشتريات والمدفوعات',
        paragraphs: [
          'عند شراء منتج توافق على دفع السعر المعروض وأي رسوم توصيل أو ضرائب تنطبق. تتم المعالجة عبر مزودي دفع آمنين. النزاعات المتعلقة بالمنتج أو التوصيل تُعالج مع المتجر؛ وقد تساعد المنصة في التنسيق عند الاقتضاء.',
        ],
      },
      {
        title: 'الاستبدال والاسترجاع — دون استرداد نقدي',
        paragraphs: [
          'لا تقدم منصة MASA استرداداً نقدياً للمبالغ المدفوعة. أي استبدال أو تسوية غير نقدية يخضع حصرياً لسياسة المتجر المعمول بها كما تُعرض على صفحة المتجر. بإتمام الطلب تقر بعدم وجود التزام من المنصة بإرجاع الأموال نقداً.',
        ],
      },
      {
        title: 'التوصيل',
        paragraphs: [
          'تتولى المنصة تنسيق التوصيل وفق نموذج التشغيل المعتمد. تختلف مدة التوصيل حسب توفر المنتج وموقع المتجر وموقع العميل وأوقات المواسم والعروض والأحوال الجوية أو الظروف الخارجية. راجع قسم الأسئلة الشائعة للمزيد.',
        ],
      },
      {
        title: 'السلوك المحظور',
        paragraphs: [
          'يُحظر استخدام المنصة للاحتيال أو السلع المقلدة أو أي نشاط غير قانوني. يُحظر إساءة استخدام المنصة أو مضايقة الآخرين أو محاولة التحايل على الأنظمة. قد نعلق الحسابات أو ننهيها عند المخالفة.',
        ],
      },
      {
        title: 'تحديد المسؤولية',
        paragraphs: [
          'ضمن ما يسمح به القانون، تقتصر مسؤولية MASA على المبلغ الذي دفعته مقابل الطلب أو الخدمة ذات الصلة. لا نتحمل الأضرار غير المباشرة أو التبعية، ولا مسؤولية سلوك المتاجر خارج نطاق معقول من سيطرتنا.',
        ],
      },
      {
        title: 'القانون المعمول به',
        paragraphs: ['تخضع هذه الشروط لأنظمة دولة قطر حيث ينطبق ذلك.'],
      },
    ],
    footerNote: 'للاستفسارات، تواصل معنا. لمزيد من التفاصيل راجع سياسة الخصوصية وملفات تعريف الارتباط.',
  },
};

export const cookiesPage: { en: LegalPageCopy; ar: LegalPageCopy } = {
  en: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    intro: 'How MASA uses cookies and similar technologies on our website and app.',
    sections: [
      {
        title: 'What are cookies',
        paragraphs: [
          'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how the site is used so we can improve it.',
        ],
      },
      {
        title: 'Cookies we use',
        paragraphs: [
          'We use essential cookies required for the site to work (e.g. authentication, security, load balancing). We may use analytics cookies to understand how visitors use MASA in an aggregated way. We may use preference cookies for settings like currency or region. Where we use non-essential cookies, we seek your consent where required by law.',
        ],
      },
      {
        title: 'Third-party cookies',
        paragraphs: [
          'Payment and analytics partners may set their own cookies when you use their features on our site. Their use is governed by their respective privacy and cookie policies.',
        ],
      },
      {
        title: 'Managing cookies',
        paragraphs: [
          'You can control or delete cookies through your browser settings. Blocking essential cookies may affect how the site works (e.g. you may not stay signed in). For more on your choices, see our Privacy Policy.',
        ],
      },
    ],
    footerNote:
      'Questions? Contact us. We may update this policy from time to time; the latest version is on this page.',
  },
  ar: {
    eyebrow: 'قانوني',
    title: 'سياسة ملفات تعريف الارتباط',
    intro: 'كيف تستخدم MASA ملفات تعريف الارتباط والتقنيات المشابهة على موقعنا وتطبيقنا.',
    sections: [
      {
        title: 'ما هي ملفات تعريف الارتباط',
        paragraphs: [
          'ملفات تعريف الارتباط ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة الموقع. تساعدنا على تذكّر تفضيلاتك، والإبقاء على جلستك، وفهم استخدام الموقع لتحسينه.',
        ],
      },
      {
        title: 'الملفات التي نستخدمها',
        paragraphs: [
          'نستخدم ملفات أساسية ضرورية لعمل الموقع (مثل تسجيل الدخول والأمان وتوزيع الأحمال). قد نستخدم ملفات تحليلات لفهم استخدام المنصة بشكل مجمّع. قد نستخدم ملفات تفضيلات لتذكّر الإعدادات مثل العملة أو المنطقة. عند استخدام ملفات غير أساسية نطلب الموافقة حيث يقتضي القانون.',
        ],
      },
      {
        title: 'ملفات الطرف الثالث',
        paragraphs: [
          'قد يضع شركاء الدفع أو التحليلات ملفاتهم الخاصة عند استخدام خدماتهم ضمن موقعنا. يخضع استخدامهم لسياسات الخصوصية والملفات الخاصة بهم.',
        ],
      },
      {
        title: 'إدارة ملفات الارتباط',
        paragraphs: [
          'يمكنك التحكم في الملفات أو حذفها من إعدادات المتصفح. قد يؤثر حظر الملفات الأساسية على عمل الموقع (مثل بقائك مسجّلاً). لمزيد من التفاصيل راجع سياسة الخصوصية.',
        ],
      },
    ],
    footerNote:
      'لديك أسئلة؟ تواصل معنا. قد يتم تحديث هذه السياسة من وقت لآخر؛ تظهر النسخة الحالية على هذه الصفحة.',
  },
};
