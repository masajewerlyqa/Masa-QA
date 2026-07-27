import type { FaqItem } from '../../components/page-layout/FaqAccordion';

export function getFaqItems(brand: string, isArabic: boolean): FaqItem[] {
  if (isArabic) {
    return [
      {
        question: `كيف أشتري المجوهرات عبر ${brand}؟`,
        answer: `تصفّح المتجر، أضف المنتجات إلى السلة، ثم أكمل الدفع بأمان. يمكنك الدفع بالبطاقة أو التحويل البنكي أو الدفع عند الاستلام حسب المتاح. جميع البائعين موثّقون من ${brand}.`,
      },
      {
        question: 'كيف يمكنني أن أصبح بائعاً؟',
        answer:
          'قدّم عبر صفحة طلب الانضمام للبائعين. نراجع بيانات متجرك ووثائقك، وبعد الموافقة تحصل على متجر رقمي وتحليلات ذكية والوصول إلى شبكة المشترين في قطر والمنطقة.',
      },
      {
        question: 'ما خيارات التوصيل المتاحة؟',
        answer:
          'يتولى كل بائع تنظيم التوصيل بنفسه. ستجد ملخصاً لسياسة التوصيل والتوقيت على صفحة المتجر وعلى صفحة المنتج. تؤكد صفحة الدفع عنوان التوصيل وتفاصيل الطلب.',
      },
      {
        question: 'كم تستغرق عملية توصيل الطلب؟',
        answer:
          'يتم توصيل الطلب خلال ساعات من نفس اليوم وبأسرع وقت ممكن. وتختلف مدة التوصيل حسب توفر المنتج وموقع المتجر وموقع العميل وأوقات المواسم والعروض وأحوال جوية أو ظروف خارجية.',
      },
      {
        question: 'ما هي سياسة الإرجاع لديكم؟',
        answer: `لا توجد سياسة إرجاع واحدة لجميع المتاجر: كل بائع يضبط شروط الإرجاع. لا تقدم منصة ${brand} استرداداً نقدياً؛ راجع سياسة المتجر قبل الشراء.`,
      },
      {
        question: 'كيف يعمل المستشار الذكي للمجوهرات؟',
        answer:
          'أجب عن بعض الأسئلة حول الذوق والمناسبة والميزانية. يقدّم الذكاء الاصطناعي توصيات من بائعين موثّقين تناسب تفضيلاتك.',
      },
      {
        question: 'هل بياناتي وعمليات الدفع آمنة؟',
        answer:
          'نعم. نستخدم معالجة دفع آمنة ونحمي بياناتك الشخصية. البائعون موثّقون. لأي استفسار خاص يمكنك التواصل عبر support@masajewelry.com.',
      },
    ];
  }

  return [
    {
      question: `How do I buy jewelry on ${brand}?`,
      answer: `Browse the marketplace, add items to your cart, and checkout securely. You can pay by card, bank transfer, or cash on delivery where available. All sellers are verified by ${brand}.`,
    },
    {
      question: 'How can I become a seller?',
      answer:
        'Apply via our seller application page. We review your store details and documentation. Once approved, you get a digital storefront, AI insights, and access to our buyer network across Qatar and the region.',
    },
    {
      question: 'What delivery options are available?',
      answer:
        'Each seller arranges delivery. You will see their delivery and timing notes on the store profile and on each product page. Checkout confirms your delivery address and order details.',
    },
    {
      question: 'How long does order delivery take?',
      answer:
        'Orders are delivered within hours on the same day whenever possible. Delivery time varies depending on product availability, store location, customer location, peak seasons, and external circumstances.',
    },
    {
      question: 'What is your return policy?',
      answer: `${brand} does not offer cash refunds; other resolutions follow the store's policy and our Customer Terms & Conditions. Review the store's policy before you buy.`,
    },
    {
      question: 'How does the AI Jewelry Advisor work?',
      answer:
        'Answer a few questions about style, occasion, and budget. Our AI recommends pieces from verified sellers that match your preferences.',
    },
    {
      question: 'Is my payment and data secure?',
      answer:
        'Yes. We use secure payment processing and protect your personal data. Sellers are verified. For specific concerns, contact support@masajewelry.com.',
    },
  ];
}
