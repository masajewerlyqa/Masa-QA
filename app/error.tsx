"use client";

import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { languageDirection } from "@/lib/language";
import { ROUTE_ERROR_COPY } from "@/lib/route-error-copy";
import { RouteErrorRecovery } from "@/components/RouteErrorRecovery";

/**
 * Route-level error boundary (App Router). Renders inside the root layout when a segment throws.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const copy = ROUTE_ERROR_COPY[language];
  const dir = languageDirection(language);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      dir={dir}
      lang={language}
      className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 gap-4"
    >
      <h2 className="text-2xl font-luxury text-primary text-center">{copy.title}</h2>
      <p className="text-masa-gray text-sm text-center max-w-md font-sans leading-relaxed">{copy.description}</p>
      <RouteErrorRecovery language={language} onRetry={() => reset()} />
    </div>
  );
}
