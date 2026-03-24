"use client";

import "./globals.css";

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
  const isArabic = typeof document !== "undefined" ? document.documentElement.lang === "ar" : false;
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-masa-dark font-sans antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 gap-4">
          <h2 className="text-2xl font-luxury text-primary text-center">
            {isArabic ? "حدث خطأ غير متوقع" : "Something went wrong"}
          </h2>
          <p className="text-masa-gray text-sm text-center max-w-md font-sans">
            {error.message || (isArabic ? "حدث خطأ غير متوقع." : "An unexpected error occurred.")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {isArabic ? "أعد المحاولة" : "Try again"}
            </button>
            <a
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md border border-primary/20 bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light"
            >
              {isArabic ? "الرئيسية" : "Home"}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
