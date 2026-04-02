"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import Link from "next/link";
import { readLanguageFromDocumentCookie } from "@/lib/client-language-from-cookie";
import { languageDirection, type Language } from "@/lib/language";
import { ROUTE_ERROR_COPY } from "@/lib/route-error-copy";

/** Actions for global-error (no App Router context — use window.location for path). */
function GlobalErrorActions({ language, onRetry }: { language: Language; onRetry: () => void }) {
  const copy = ROUTE_ERROR_COPY[language];
  const [path, setPath] = useState("");
  useEffect(() => {
    setPath(typeof window !== "undefined" ? window.location.pathname : "");
  }, []);
  const isSeller = path.startsWith("/seller");
  const isAdmin = path.startsWith("/admin");
  const btnPrimary =
    "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90";
  const btnOutline =
    "inline-flex h-9 items-center justify-center rounded-md border border-primary/20 bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light";
  const btnDashboard =
    "inline-flex h-9 items-center justify-center rounded-md border border-primary/30 bg-masa-light px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light/80";

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button type="button" onClick={onRetry} className={btnPrimary}>
        {copy.tryAgain}
      </button>
      {isSeller && (
        <Link href="/seller" className={btnDashboard}>
          {copy.sellerDashboard}
        </Link>
      )}
      {isAdmin && (
        <Link href="/admin" className={btnDashboard}>
          {copy.adminDashboard}
        </Link>
      )}
      <Link href="/" className={btnOutline}>
        {copy.home}
      </Link>
    </div>
  );
}

/**
 * Root-level error boundary. Must include html/body (replaces root layout when active).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    setLanguage(readLanguageFromDocumentCookie());
  }, []);

  const copy = ROUTE_ERROR_COPY[language];
  const dir = languageDirection(language);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={language} dir={dir} suppressHydrationWarning>
      <body
        className={`min-h-screen bg-white text-masa-dark antialiased ${language === "ar" ? "font-arabic" : "font-sans"}`}
      >
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 gap-4">
          <h2 className="text-2xl font-luxury text-primary text-center">{copy.title}</h2>
          <p className="text-masa-gray text-sm text-center max-w-md font-sans leading-relaxed">{copy.description}</p>
          <GlobalErrorActions language={language} onRetry={() => reset()} />
        </div>
      </body>
    </html>
  );
}
