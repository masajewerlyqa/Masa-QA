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
            {isArabic ? "الشروط التي تحكم استخدامك لمنصة MASA." : "Terms governing your use of the MASA marketplace."}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-masa-light/40 border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-10 font-sans text-masa-gray text-sm leading-relaxed">
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "القبول" : "Acceptance"}</h2>
              <p>
                {isArabic ? "باستخدامك لمنصة MASA فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام المنصة. قد يتم تحديث الشروط من وقت لآخر." : "By using MASA (the website and services), you agree to these terms. If you do not agree, please do not use the platform. We may update these terms; continued use after changes means you accept the updated terms."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "طبيعة المنصة" : "The marketplace"}</h2>
              <p>
                {isArabic ? "MASA منصة تربط المشترين ببائعي المجوهرات المستقلين. نحن لا نملك المنتجات المدرجة، وكل عملية بيع هي اتفاق بينك وبين البائع." : "MASA is a marketplace connecting buyers with independent jewelry sellers. We do not own the products listed; each sale is a contract between you and the seller. We provide the platform, tools, and support to facilitate secure and transparent transactions."}
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "حسابك" : "Your account"}</h2>
              <p>
                You must provide accurate information and keep your account secure. You are responsible for activity under your account. Sellers must comply with our seller policies and applicable laws.
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "المشتريات والمدفوعات" : "Purchases and payments"}</h2>
              <p>
                When you buy an item, you agree to pay the stated price and any applicable shipping and taxes. Payment is processed through our secure payment partners. Disputes about the product or delivery are addressed with the seller; we may step in to help resolve issues where appropriate.
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "السلوك المحظور" : "Prohibited conduct"}</h2>
              <p>
                You may not use MASA for fraud, counterfeit goods, or illegal activity. You may not misuse the platform, harass others, or attempt to circumvent our systems. We may suspend or terminate accounts that violate these terms.
              </p>
            </div>
            <div>
              <h2 className="font-luxury text-xl text-primary mb-3">{isArabic ? "تحديد المسؤولية" : "Limitation of liability"}</h2>
              <p>
                To the extent permitted by law, MASA’s liability is limited to the amount you paid for the relevant order or service. We are not liable for indirect, consequential, or special damages, or for seller conduct outside our reasonable control.
              </p>
            </div>
            <p className="pt-4">
              {isArabic ? "للاستفسارات،" : "For questions,"} <Link href="/contact" className="text-primary hover:underline">{isArabic ? "تواصل معنا" : "contact us"}</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
