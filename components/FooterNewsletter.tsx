"use client";

import { useState } from "react";
import { useI18n } from "@/components/useI18n";

export function FooterNewsletter() {
  const { t, language } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(t("newsletter.invalidEmail"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMessage(t("newsletter.invalidEmail"));
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", language }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErrorMessage(data.error || t("newsletter.failed"));
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setErrorMessage(t("newsletter.failed"));
      setStatus("error");
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          {t("newsletter.emailLabel")}
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletter.emailPlaceholder")}
          className="flex-1 min-w-0 px-3 py-2 rounded text-sm bg-white/10 border border-white/20 text-white placeholder:text-secondary font-sans focus:outline-none focus:ring-1 focus:ring-white/30"
          disabled={status === "loading"}
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 rounded text-sm font-sans bg-white/20 hover:bg-white/30 text-white shrink-0 transition-colors disabled:opacity-70"
        >
          {status === "loading" ? "…" : status === "success" ? t("common.done") : t("newsletter.subscribe")}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-200 font-sans" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
