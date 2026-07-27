export type InfoPageKey =
  | 'about'
  | 'marketPrices'
  | 'sizeGuide'
  | 'delivery'
  | 'returns'
  | 'contact'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'cookies';

export type InfoSection = {
  heading: string;
  body: string;
};

export type InfoPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
};

export const infoPages: Record<InfoPageKey, { en: InfoPageContent; ar: InfoPageContent }> = {
  about: {
    en: {
      eyebrow: 'About',
      title: 'About MASA',
      intro:
        'MASA is a trusted intelligent jewelry marketplace connecting buyers with verified sellers across Qatar and beyond.',
      sections: [
        {
          heading: 'Our mission',
          body: 'We make luxury jewelry discovery simple, transparent, and secure—with AI tools, live market insights, and verified storefronts.',
        },
        {
          heading: 'For buyers',
          body: 'Browse curated collections, compare prices, save wishlists, and checkout with confidence.',
        },
        {
          heading: 'For sellers',
          body: 'Verified sellers manage inventory, orders, and policies from a dedicated dashboard.',
        },
      ],
    },
    ar: {
      eyebrow: 'من نحن',
      title: 'عن MASA',
      intro:
        'MASA سوق مجوهرات ذكي موثوق يربط المشترين ببائعين معتمدين في قطر وخارجها.',
      sections: [
        {
          heading: 'مهمتنا',
          body: 'نجعل اكتشاف المجوهرات الفاخرة بسيطاً وشفافاً وآمناً—بأدوات ذكاء اصطناعي ورؤى سوق وبائعين موثّقين.',
        },
        {
          heading: 'للمشترين',
          body: 'تصفّح مجموعات منتقاة، قارن الأسعار، احفظ المفضلة، وأكمل الشراء بثقة.',
        },
        {
          heading: 'للبائعين',
          body: 'يدير البائعون المعتمدون المخزون والطلبات والسياسات من لوحة تحكم مخصصة.',
        },
      ],
    },
  },
  marketPrices: {
    en: {
      eyebrow: 'Market',
      title: 'Market Prices',
      intro: 'Track gold and jewelry market trends with frequently updated pricing insights.',
      sections: [
        {
          heading: 'Live insights',
          body: 'Use MASA tools to estimate gold value by karat and monitor market movement before you buy or sell.',
        },
      ],
    },
    ar: {
      eyebrow: 'السوق',
      title: 'أسعار السوق',
      intro: 'تابع اتجاهات سوق الذهب والمجوهرات مع تحديثات دورية للأسعار.',
      sections: [
        {
          heading: 'رؤى مباشرة',
          body: 'استخدم أدوات MASA لتقدير قيمة الذهب حسب العيار ومتابعة حركة السوق قبل الشراء أو البيع.',
        },
      ],
    },
  },
  sizeGuide: {
    en: {
      eyebrow: 'Sizing',
      title: 'Size Guide',
      intro: 'Find accurate ring and bracelet sizes before you order.',
      sections: [
        {
          heading: 'Rings',
          body: 'Measure an existing ring’s inner diameter or use a printable ring sizer. Sizes may vary slightly by region.',
        },
        {
          heading: 'Bracelets',
          body: 'Measure wrist circumference snugly, then add 1–2 cm for comfort depending on style.',
        },
      ],
    },
    ar: {
      eyebrow: 'المقاسات',
      title: 'دليل المقاسات',
      intro: 'اعثر على مقاسات الخواتم والأساور بدقة قبل الطلب.',
      sections: [
        {
          heading: 'الخواتم',
          body: 'قِس القطر الداخلي لخاتم موجود أو استخدم مقياساً قابلاً للطباعة. قد تختلف المقاسات حسب المنطقة.',
        },
        {
          heading: 'الأساور',
          body: 'قِس محيط المعصم بإحكام ثم أضف 1–2 سم للراحة حسب الطراز.',
        },
      ],
    },
  },
  delivery: {
    en: {
      eyebrow: 'Delivery',
      title: 'Delivery information',
      intro:
        'Each seller arranges delivery for their orders. Check the store profile and product pages for timing and options.',
      sections: [
        {
          heading: 'How delivery works on MASA',
          body: 'MASA connects you with verified sellers; each seller arranges shipping for their own store.',
        },
        {
          heading: 'Coverage',
          body: 'Most sellers focus on delivery within Qatar. Confirm on store and product pages before you buy.',
        },
        {
          heading: 'Same-day delivery',
          body: 'When enabled, the seller’s policy shows a cutoff time for same-day fulfilment.',
        },
        {
          heading: 'Tracking and support',
          body: 'Follow order status under Account → Orders. Contact the seller from the order page or MASA support.',
        },
      ],
    },
    ar: {
      eyebrow: 'التوصيل',
      title: 'معلومات التوصيل',
      intro:
        'كل بائع ينظم التوصيل لطلباته؛ راجع صفحة المتجر والمنتج للتوقيت والخيارات.',
      sections: [
        {
          heading: 'كيف يعمل التوصيل على المنصة',
          body: 'MASA تربطك ببائعين موثّقين؛ التوصيل الفعلي يتولاه كل بائع لمتجره.',
        },
        {
          heading: 'نطاق التغطية',
          body: 'يقدّم معظم البائعين التوصيل داخل قطر. تأكد من صفحة المتجر والمنتج قبل الشراء.',
        },
        {
          heading: 'التوصيل في نفس اليوم',
          body: 'عند التفعيل، تظهر سياسة المتجر وقت القطع للتسليم في اليوم نفسه.',
        },
        {
          heading: 'التتبع والدعم',
          body: 'تابع حالة الطلب من قسم الطلبات. تواصل مع البائع من صفحة الطلب أو دعم MASA.',
        },
      ],
    },
  },
  returns: {
    en: {
      eyebrow: 'Returns',
      title: 'Returns & exchanges',
      intro: 'Review MASA returns and exchanges policy for eligible orders.',
      sections: [
        {
          heading: 'Seller policies',
          body: 'Return windows and eligibility are set by each seller and shown on the store and order details.',
        },
        {
          heading: 'Eligibility',
          body: 'Items must typically be unused, with original packaging, within the stated return period from delivery.',
        },
      ],
    },
    ar: {
      eyebrow: 'الإرجاع',
      title: 'الإرجاع والاستبدال',
      intro: 'راجع سياسة الإرجاع والاستبدال للطلبات المؤهلة.',
      sections: [
        {
          heading: 'سياسات البائع',
          body: 'تحدد كل متجر مدة الإرجاع والأهلية وتظهر في صفحة المتجر وتفاصيل الطلب.',
        },
        {
          heading: 'الأهلية',
          body: 'يجب عادةً أن تكون القطعة غير مستخدمة وبعبواتها الأصلية ضمن المدة من وقت التسليم.',
        },
      ],
    },
  },
  contact: {
    en: {
      eyebrow: 'Contact',
      title: 'Contact us',
      intro: 'Reach MASA support via chat, phone, or email.',
      sections: [
        {
          heading: 'Support hours',
          body: 'Our team is available Sunday–Thursday, 9:00–18:00 (Qatar time).',
        },
        {
          heading: 'Order help',
          body: 'For delivery or product questions, message the seller from your order page first—we can escalate if needed.',
        },
      ],
    },
    ar: {
      eyebrow: 'تواصل',
      title: 'تواصل معنا',
      intro: 'تواصل مع دعم MASA عبر الدردشة أو الهاتف أو البريد.',
      sections: [
        {
          heading: 'ساعات الدعم',
          body: 'فريقنا متاح الأحد–الخميس، 9:00–18:00 (توقيت قطر).',
        },
        {
          heading: 'مساعدة الطلبات',
          body: 'لأسئلة التوصيل أو المنتج، راسل البائع من صفحة طلبك أولاً—ونصعد عند الحاجة.',
        },
      ],
    },
  },
  faq: {
    en: {
      eyebrow: 'FAQ',
      title: 'Frequently asked questions',
      intro: 'Answers about orders, payments, and accounts.',
      sections: [
        {
          heading: 'Do I need an account?',
          body: 'You can browse as a guest; wishlist, cart, and checkout require sign-in.',
        },
        {
          heading: 'Which currencies are supported?',
          body: 'Prices are stored in USD; you can display USD or QAR in the app.',
        },
        {
          heading: 'How do I track my order?',
          body: 'Open Account → Orders for status and tracking when the seller adds it.',
        },
      ],
    },
    ar: {
      eyebrow: 'الأسئلة الشائعة',
      title: 'الأسئلة الشائعة',
      intro: 'إجابات حول الطلبات والمدفوعات والحسابات.',
      sections: [
        {
          heading: 'هل أحتاج حساباً؟',
          body: 'يمكنك التصفح كزائر؛ المفضلة والسلة والدفع تتطلب تسجيل الدخول.',
        },
        {
          heading: 'ما العملات المدعومة؟',
          body: 'الأسعار تُخزَّن بالدولار؛ يمكنك عرض USD أو QAR في التطبيق.',
        },
        {
          heading: 'كيف أتابع طلبي؟',
          body: 'افتح الحساب → الطلبات للحالة والتتبع عند إضافته من البائع.',
        },
      ],
    },
  },
  privacy: {
    en: {
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      intro: 'How MASA collects, stores, and protects your personal data.',
      sections: [
        {
          heading: 'Data we collect',
          body: 'Account details, order history, and preferences help us provide the marketplace experience.',
        },
        {
          heading: 'Your rights',
          body: 'You may request access or deletion of personal data subject to legal and order-retention requirements.',
        },
      ],
    },
    ar: {
      eyebrow: 'قانوني',
      title: 'سياسة الخصوصية',
      intro: 'كيف تجمع MASA بياناتك الشخصية وتخزنها وتحميها.',
      sections: [
        {
          heading: 'البيانات التي نجمعها',
          body: 'تفاصيل الحساب وسجل الطلبات والتفضيلات تساعدنا في تقديم تجربة السوق.',
        },
        {
          heading: 'حقوقك',
          body: 'يمكنك طلب الوصول أو الحذف وفق المتطلبات القانونية واحتفاظ الطلبات.',
        },
      ],
    },
  },
  terms: {
    en: {
      eyebrow: 'Legal',
      title: 'Terms of Service',
      intro: 'Terms and conditions for using MASA services.',
      sections: [
        {
          heading: 'Marketplace role',
          body: 'MASA facilitates transactions between buyers and independent sellers.',
        },
        {
          heading: 'Acceptable use',
          body: 'Accounts must not be used for fraud, abuse, or circumvention of platform policies.',
        },
      ],
    },
    ar: {
      eyebrow: 'قانوني',
      title: 'شروط الخدمة',
      intro: 'الشروط والأحكام لاستخدام خدمات MASA.',
      sections: [
        {
          heading: 'دور المنصة',
          body: 'MASA تسهّل المعاملات بين المشترين والبائعين المستقلين.',
        },
        {
          heading: 'الاستخدام المقبول',
          body: 'لا يجوز استخدام الحسابات للاحتيال أو الإساءة أو تجاوز سياسات المنصة.',
        },
      ],
    },
  },
  cookies: {
    en: {
      eyebrow: 'Legal',
      title: 'Cookie Policy',
      intro: 'Information on cookies and tracking technologies used by MASA.',
      sections: [
        {
          heading: 'Essential cookies',
          body: 'Required for sign-in, cart, and security.',
        },
        {
          heading: 'Analytics',
          body: 'Help us understand usage to improve the marketplace experience.',
        },
      ],
    },
    ar: {
      eyebrow: 'قانوني',
      title: 'سياسة ملفات تعريف الارتباط',
      intro: 'معلومات عن ملفات تعريف الارتباط وتقنيات التتبع في MASA.',
      sections: [
        {
          heading: 'ملفات أساسية',
          body: 'مطلوبة لتسجيل الدخول والسلة والأمان.',
        },
        {
          heading: 'التحليلات',
          body: 'تساعدنا على فهم الاستخدام لتحسين تجربة السوق.',
        },
      ],
    },
  },
};
