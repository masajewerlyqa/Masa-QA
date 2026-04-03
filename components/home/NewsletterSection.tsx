"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

export function NewsletterSection() {
  const { isArabic, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(isArabic ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMessage(isArabic ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home_section", language }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErrorMessage(data.error || (isArabic ? "تعذر الاشتراك. يرجى المحاولة مرة أخرى." : "Subscription failed. Please try again."));
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setErrorMessage(isArabic ? "تعذر الاشتراك. يرجى المحاولة مرة أخرى." : "Subscription failed. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section
      className="py-16 md:py-24 bg-white border-t border-primary/10"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <header className="text-center mb-10 md:mb-12">
          <h2
            id="newsletter-heading"
            className="font-luxury text-3xl md:text-4xl text-primary mb-4"
          >
            {isArabic ? "ابقَ على اطلاع باتجاهات الفخامة" : "Stay Updated with Luxury Trends"}
          </h2>
          <p className="text-masa-gray max-w-xl mx-auto font-sans">
            {isArabic ? "احصل على الإلهام والإصدارات الجديدة والعروض الحصرية في بريدك." : "Get inspiration, new arrivals and exclusive offers in your inbox."}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-16"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            {isArabic ? "البريد الإلكتروني" : "Email address"}
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isArabic ? "بريدك الإلكتروني" : "Your email"}
            className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-primary/20 bg-masa-light font-sans text-masa-dark placeholder:text-masa-gray focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={status === "loading"}
            autoComplete="email"
          />
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white px-6 shrink-0"
            disabled={status === "loading"}
          >
            {status === "loading" ? (isArabic ? "جارٍ الاشتراك…" : "Subscribing…") : status === "success" ? (isArabic ? "تم الاشتراك" : "Subscribed") : (isArabic ? "اشترك" : "Subscribe")}
          </Button>
        </form>
        {status === "error" && (
          <p className="text-center text-sm text-red-600 font-sans mb-6" role="alert">
            {errorMessage}
          </p>
        )}

        <p className="text-masa-gray text-sm md:text-base font-sans max-w-3xl mx-auto text-center leading-relaxed">
          {isArabic
            ? "ماسا منصة مجوهرات ذكية وسوق رقمي للذهب. نبني منظومة فاخرة موثوقة لعشاق المجوهرات والبائعين في قطر والشرق الأوسط — اكتشف واشترِ وبِع بثقة."
            : "MASA is an AI-powered jewelry platform and digital gold marketplace. We are building a trusted luxury ecosystem for jewelry lovers and sellers in Qatar and the Middle East—discover, buy and sell with confidence."}
        </p>
      </div>
    </section>
  );
}
