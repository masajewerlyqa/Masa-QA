import type { Metadata } from "next";
import Link from "next/link";
import {
  Gem,
  Shield,
  Sparkles,
  Eye,
  HeartHandshake,
  Headphones,
  Store,
  ArrowRight,
  Target,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiamondPattern } from "@/components/DiamondPattern";
import { brandName } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/language-server";
import { getLocalizedSeo } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const localized = getLocalizedSeo(language, {
    title: `About ${brandName("en")} | Intelligent Luxury Jewelry Marketplace`,
    titleAr: `عن ${brandName("ar")} | سوق المجوهرات الفاخرة الذكي`,
    description:
      `Discover who we are, our mission and values, and why buyers and sellers trust ${brandName("en")}—Qatar’s AI-powered jewelry marketplace.`,
    descriptionAr: `تعرّف على ${brandName("ar")}، رسالتنا وقيمنا، ولماذا يثق بنا المشترون والبائعون في منصة المجوهرات المدعومة بالذكاء الاصطناعي.`,
  });
  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: "/about",
      languages: { en: "/about", ar: "/about" },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      type: "website",
    },
  };
}

export default function AboutPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const brand = t(language, "common.brand");

  const values = isArabic
    ? [
        {
          title: "الأصالة أولاً",
          body: "نعمل مع بائعين موثّقين وقطع أصلية، لأن الثقة أساس كل عملية شراء.",
          icon: Gem,
        },
        {
          title: "أمان المعاملات",
          body: "مدفوعات وتجربة تسوق مصممة لحمايتك من الطلب حتى التوصيل.",
          icon: Shield,
        },
        {
          title: "شفافية",
          body: "أسعار واضحة، مراجعات حقيقية، ومعلومات تساعدك على القرار بثقة.",
          icon: Eye,
        },
        {
          title: "ابتكار مدعوم بالذكاء الاصطناعي",
          body: "أدوات ذكية للاكتشاف والتوصية دون المساس بخصوصيتك أو أمانك.",
          icon: Sparkles,
        },
      ]
    : [
        {
          title: "Authenticity first",
          body: "We partner with verified sellers and genuine pieces—trust is the foundation of every purchase.",
          icon: Gem,
        },
        {
          title: "Transaction security",
          body: "Payments and shopping flows designed to protect you from checkout to delivery.",
          icon: Shield,
        },
        {
          title: "Transparency",
          body: "Clear pricing, real reviews, and information that helps you decide with confidence.",
          icon: Eye,
        },
        {
          title: "AI-powered innovation",
          body: "Smart discovery and recommendations without compromising your privacy or safety.",
          icon: Sparkles,
        },
      ];

  const clientBenefits = isArabic
    ? [
        "تسوّق من متاجر وعلامات مجوهرات مختارة وموثّقة.",
        "توصيات ذكية تساعدك على اكتشاف القطع المناسبة لك.",
        "مدفوعات آمنة وتجربة شراء واضحة من البداية للنهاية.",
        "دعم متواصل عند الحاجة—نحن بجانبك في رحلتك.",
      ]
    : [
        "Shop curated, verified jewelry boutiques and brands.",
        "Smart recommendations to help you discover pieces that fit your style.",
        "Secure payments and a clear purchase journey from start to finish.",
        "Responsive support when you need us—we are with you all the way.",
      ];

  const sellerBenefits = isArabic
    ? [
        "ظهور متجرك وعلامتك أمام مشترين يبحثون عن مجوهرات فاخرة موثوقة.",
        "شارة التوثيق والثقة—تُبرز احترافيتك وتقوّي ثقة العملاء بمتجرك.",
        "لوحة وإدارة منتجات وطلبات في مكان واحد، بواجهة واضحة وسهلة.",
        "الاستفادة من اكتشاف المنتجات والتوصيات الذكية لزيادة فرص ظهور مجموعتك.",
        `دعم وإرشاد من فريق ${brand} لمساعدتك في الانطلاق والنمو على المنصة.`,
      ]
    : [
        "Showcase your store and brand to buyers actively seeking trusted luxury jewelry.",
        "Verification and trust signals that highlight your professionalism and reassure customers.",
        "A unified dashboard to manage products and orders with a clear, efficient workflow.",
        "Benefit from intelligent discovery and recommendations so your collection reaches the right audience.",
        `Guidance and support from the ${brand} team to help you launch and grow on the platform.`,
      ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="relative py-14 md:py-24 overflow-hidden border-b border-primary/10"
        aria-labelledby="about-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-masa-light/70 via-white to-white" aria-hidden />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {isArabic ? "من نحن" : "Who we are"}
          </p>
          <h1
            id="about-hero-heading"
            className={`text-3xl md:text-5xl lg:text-[3.25rem] text-primary tracking-tight mb-5 md:mb-6 max-w-4xl mx-auto leading-tight ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}
          >
            {isArabic ? `${brand} منصة المجوهرات الفاخرة الذكية` : `${brand} — the intelligent luxury jewelry marketplace`}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p
            className={`text-[rgb(99,92,92)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${isArabic ? "font-arabic" : "font-sans"}`}
          >
            {isArabic
              ? "نجمع بين الأناقة والتقنية: سوق إلكتروني يوفّر لك قطعاً أصلية من بائعين موثّقين، مع أدوات ذكية لتجربة تسوق آمنة ومريحة في قطر وما حولها."
              : "We unite elegance and technology: a digital marketplace for authentic jewelry from verified sellers, with intelligent tools for a secure, confident shopping experience in Qatar and beyond."}
          </p>
        </div>
      </section>

      {/* Who we are — narrative */}
      <section className="py-14 md:py-20 bg-white" aria-labelledby="about-story-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2
              id="about-story-heading"
              className={`text-2xl md:text-3xl text-primary mb-6 ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}
            >
              {isArabic ? "من نحن" : "Who we are"}
            </h2>
            <div className={`space-y-5 text-masa-gray leading-relaxed ${isArabic ? "font-arabic text-lg" : "font-sans text-base md:text-lg"}`}>
              <p>
                {isArabic
                  ? `${brand} منصة سوقية متخصصة في المجوهرات الفاخرة. هدفنا أن نجعل اكتشاف وشراء القطع الاستثنائية أبسط وأكثر أماناً—سواء كنت تبحث عن خاتم، سوار، أو قطعة توارثها الأجيال.`
                  : `${brand} is a marketplace dedicated to luxury jewelry. We make it simpler and safer to discover and acquire exceptional pieces—whether you are looking for a ring, a bracelet, or a future heirloom.`}
              </p>
              <p>
                {isArabic
                  ? "نؤمن بأن التكنولوجيا يجب أن تخدم الجمال والثقة: لذلك ندمج التوصيات الذكية، والتحقق من البائعين، وتجربة مستخدم واضحة في مكان واحد."
                  : "We believe technology should serve beauty and trust—so we combine intelligent recommendations, seller verification, and a clear customer experience in one place."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 md:py-20 bg-masa-light/50 border-y border-primary/10" aria-labelledby="about-values-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <header className="text-center mb-12 md:mb-14">
            <h2
              id="about-values-heading"
              className={`text-2xl md:text-4xl text-primary mb-3 ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}
            >
              {isArabic ? "قيمنا" : "Our values"}
            </h2>
            <p className={`text-masa-gray max-w-xl mx-auto ${isArabic ? "font-arabic" : "font-sans"}`}>
              {isArabic
                ? "مبادئ نلتزم بها في كل تفاعل معك ومع شركائنا."
                : "Principles we uphold in every interaction with you and our partners."}
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ title, body, icon: Icon }) => (
              <Card key={title} className="border-primary/10 shadow-[0_4px_24px_rgba(83,28,36,0.05)] bg-white">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3" aria-hidden>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className={`text-base md:text-lg ${isArabic ? "font-arabic" : ""}`}>{title}</CardTitle>
                </CardHeader>
                <CardContent className={`pt-0 text-sm text-masa-gray leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
                  {body}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 md:py-20 bg-white" aria-labelledby="about-mission-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="relative rounded-2xl border border-primary/15 bg-gradient-to-br from-masa-light/80 to-white p-8 md:p-12 lg:p-14 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden />
            <div className="relative flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7" aria-hidden />
              </div>
              <div>
                <h2
                  id="about-mission-heading"
                  className={`text-2xl md:text-3xl text-primary mb-4 ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}
                >
                  {isArabic ? "مهمتنا" : "Our mission"}
                </h2>
                <p className={`text-masa-dark text-lg md:text-xl leading-relaxed max-w-3xl ${isArabic ? "font-arabic" : "font-sans"}`}>
                  {isArabic
                    ? "تمكين المشترين والبائعين من التواصل عبر منصة موثوقة، شفافة، ومدعومة بالذكاء الاصطناعي—حيث تُقدَّر الأصالة، ويُحترم العميل، وتُبنى علاقات طويلة الأمد."
                    : "To empower buyers and sellers through a trustworthy, transparent, AI-enhanced platform—where authenticity is honoured, customers are respected, and lasting relationships are built."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for clients */}
      <section className="py-14 md:py-20 bg-masa-light/40" aria-labelledby="about-clients-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2
                id="about-clients-heading"
                className={`text-2xl md:text-4xl text-primary mb-4 ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}
              >
                {isArabic ? `ما الذي يقدّمه ${brand} لك كعميل؟` : `What ${brand} offers you as a client`}
              </h2>
              <p className={`text-masa-gray mb-8 ${isArabic ? "font-arabic" : "font-sans"}`}>
                {isArabic
                  ? "صممنا التجربة لتمنحك راحة البال في كل خطوة."
                  : "We designed the experience to give you peace of mind at every step."}
              </p>
              <ul className="space-y-4">
                {clientBenefits.map((line) => (
                  <li key={line} className="flex gap-3">
                    <HeartHandshake className="w-5 h-5 text-primary shrink-0 mt-1" aria-hidden />
                    <span className={`text-masa-dark leading-relaxed ${isArabic ? "font-arabic" : "font-sans"}`}>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                  <Link href="/discover" className="inline-flex items-center gap-2">
                    {isArabic ? "تسوّق الآن" : "Shop now"}
                    <ArrowRight className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/10 shadow-[0_8px_40px_rgba(83,28,36,0.08)] bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Headphones className="w-6 h-6 text-primary" aria-hidden />
                  <CardTitle className={isArabic ? "font-arabic" : ""}>
                    {isArabic ? "نحن هنا من أجلك" : "We are here for you"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className={`space-y-4 text-masa-gray ${isArabic ? "font-arabic" : "font-sans"}`}>
                <p>
                  {isArabic
                    ? "أسئلة عن منتج، طلب، أو حسابك؟ فريق الدعم جاهز لمساعدتك."
                    : "Questions about a product, an order, or your account? Our support team is ready to help."}
                </p>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-masa-light rounded-full">
                  <Link href="/contact">{isArabic ? "تواصل معنا" : "Contact us"}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits for sellers & stores */}
      <section className="py-14 md:py-20 bg-white border-t border-primary/10" aria-labelledby="about-sellers-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Card className="order-2 lg:order-1 border-primary/10 shadow-[0_8px_40px_rgba(83,28,36,0.08)] bg-masa-light/30">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Store className="w-6 h-6 text-primary" aria-hidden />
                  <CardTitle className={isArabic ? "font-arabic" : ""}>
                    {isArabic ? "شريكك في النمو الرقمي" : "Your partner in digital growth"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className={`space-y-4 text-masa-gray ${isArabic ? "font-arabic" : "font-sans"}`}>
                <p>
                  {isArabic
                    ? "سواء كنت متجراً قائماً أو علامة ناشئة، نساعدك على بناء حضور احترافي وربط مجموعتك بعملاء يقدّرون الجودة."
                    : "Whether you are an established boutique or an emerging brand, we help you build a professional presence and connect your collection with quality-focused customers."}
                </p>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-white rounded-full">
                  <Link href="/apply">{isArabic ? "ابدأ كبائع" : "Start selling"}</Link>
                </Button>
              </CardContent>
            </Card>
            <div className="order-1 lg:order-2">
              <h2
                id="about-sellers-heading"
                className={`text-2xl md:text-4xl text-primary mb-4 ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}
              >
                {isArabic ? `ماذا يقدّم ${brand} لمتاجركم وعلاماتكم؟` : `What ${brand} offers your store & brand`}
              </h2>
              <p className={`text-masa-gray mb-8 ${isArabic ? "font-arabic" : "font-sans"}`}>
                {isArabic
                  ? "مزايا عملية لبائعي المجوهرات الموثّقين على المنصة."
                  : "Practical advantages for verified jewelry sellers on the platform."}
              </p>
              <ul className="space-y-4">
                {sellerBenefits.map((line) => (
                  <li key={line} className="flex gap-3">
                    <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-1" aria-hidden />
                    <span className={`text-masa-dark leading-relaxed ${isArabic ? "font-arabic" : "font-sans"}`}>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Join us CTA */}
      <section className="relative py-16 md:py-24 bg-primary text-white overflow-hidden" aria-labelledby="about-join-heading">
        <DiamondPattern className="opacity-[0.12]" />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <Store className="w-12 h-12 mx-auto mb-6 text-secondary" aria-hidden />
          <h2 id="about-join-heading" className={`text-2xl md:text-4xl mb-4 text-white ${isArabic ? "font-arabic-luxury" : "font-luxury"}`}>
            {isArabic ? "انضم إلينا الآن" : "Join us now"}
          </h2>
          <p className={`text-secondary/95 max-w-2xl mx-auto text-base md:text-lg mb-10 leading-relaxed ${isArabic ? "font-arabic" : "font-sans"}`}>
            {isArabic
              ? `هل تمثّل علامة تجارية أو متجر مجوهرات؟ انضم إلى شبكة البائعين الموثّقين في ${brand} واعرض مجموعتك لجمهور يقدّر الجودة والأصالة.`
              : `Represent a brand or jewelry boutique? Join ${brand}'s verified seller network and showcase your collection to an audience that values quality and authenticity.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-secondary text-primary hover:bg-secondary/90 font-sans rounded-full px-8"
            >
              <Link href="/apply" className="inline-flex items-center gap-2">
                {isArabic ? "قدّم طلب البائع" : `Apply to sell on ${brand}`}
                <ArrowRight className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 bg-transparent"
            >
              <Link href="/contact">{isArabic ? "تحدث مع فريق الشراكات" : "Talk to our partnerships team"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
