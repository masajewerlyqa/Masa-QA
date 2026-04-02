"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Language } from "@/lib/language";
import { ROUTE_ERROR_COPY } from "@/lib/route-error-copy";

type Props = {
  language: Language;
  /** Next.js error boundary recovery (preferred over full page reload). */
  onRetry: () => void;
};

/**
 * Contextual recovery actions for route errors (seller/admin vs site home).
 */
export function RouteErrorRecovery({ language, onRetry }: Props) {
  const copy = ROUTE_ERROR_COPY[language];
  const pathname = usePathname() ?? "";
  const isSeller = pathname.startsWith("/seller");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        {copy.tryAgain}
      </button>
      {isSeller && (
        <Link
          href="/seller"
          className="inline-flex h-9 items-center justify-center rounded-md border border-primary/30 bg-masa-light px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light/80"
        >
          {copy.sellerDashboard}
        </Link>
      )}
      {isAdmin && (
        <Link
          href="/admin"
          className="inline-flex h-9 items-center justify-center rounded-md border border-primary/30 bg-masa-light px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light/80"
        >
          {copy.adminDashboard}
        </Link>
      )}
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-md border border-primary/20 bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-masa-light"
      >
        {copy.home}
      </Link>
    </div>
  );
}
