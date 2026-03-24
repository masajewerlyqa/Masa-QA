"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { isArabic } = useLanguage();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 gap-4">
      <h2 className="text-2xl font-luxury text-primary text-center">
        {isArabic ? "حدث خطأ غير متوقع" : "Something went wrong"}
      </h2>
      <p className="text-masa-gray text-sm text-center max-w-md font-sans">
        {isArabic
          ? "تعذر إكمال العملية حالياً. يرجى المحاولة مرة أخرى، وإذا استمرت المشكلة تواصل مع الدعم."
          : "We could not complete your request right now. Please try again, and contact support if the problem continues."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          {isArabic ? "أعد المحاولة" : "Try again"}
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md border border-primary/20 bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light"
        >
          {isArabic ? "الرئيسية" : "Home"}
        </Link>
      </div>
    </div>
  );
}
