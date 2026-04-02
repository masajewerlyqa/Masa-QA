"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/useI18n";
import { formatGoldPriceCompact } from "@/lib/gold-scraper/format-price";

type GoldPricesResponse = {
  country: string;
  currency: string;
  gram: number;
  ounce: number;
  tola: number | null;
  karats: Record<string, number>;
  source: string;
  lastUpdated: string;
};

/**
 * Fetches `/api/gold-prices`: GoldAPI-based QAR snapshot when scraper is off; else cached scrape.
 */
export function LiveGoldPricesPanel() {
  const { t, language } = useI18n();
  const [data, setData] = useState<GoldPricesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gold-prices", { cache: "no-store" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error ?? res.statusText);
        }
        const json = (await res.json()) as GoldPricesResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("tools.market.livePanel.loadFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) {
    return (
      <div className="rounded-xl border border-primary/10 bg-masa-light/80 p-6 text-sm text-masa-gray">
        {t("tools.market.livePanel.loading")}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-800">
        {error ?? t("tools.market.livePanel.noData")}
      </div>
    );
  }

  const karatOrder = ["24K", "22K", "21K", "18K"] as const;

  const locale = language === "ar" ? "ar-QA" : "en-GB";
  const qarPrefix = language === "ar" ? "ر.ق" : "QAR";

  return (
    <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
      <h3 className="font-luxury text-lg text-primary mb-1">{t("tools.market.livePanel.title")}</h3>
      <p className="text-xs text-masa-gray mb-4">
        {t("tools.market.livePanel.source")}: {data.source} · {t("tools.market.livePanel.updated")}{" "}
        {new Date(data.lastUpdated).toLocaleString(locale)}
      </p>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-masa-gray">{t("tools.market.livePanel.gram24k")}</dt>
          <dd className="font-medium">
            {qarPrefix} {formatGoldPriceCompact(data.gram)}
          </dd>
        </div>
        <div>
          <dt className="text-masa-gray">{t("tools.market.livePanel.ounce")}</dt>
          <dd className="font-medium">
            {qarPrefix} {formatGoldPriceCompact(data.ounce)}
          </dd>
        </div>
        <div>
          <dt className="text-masa-gray">{t("tools.market.livePanel.tola")}</dt>
          <dd className="font-medium">
            {data.tola != null ? `${qarPrefix} ${formatGoldPriceCompact(data.tola)}` : "—"}
          </dd>
        </div>
      </dl>
      <h4 className="text-xs font-semibold text-masa-dark mt-4 mb-2 uppercase tracking-wide">
        {t("tools.market.livePanel.byKarat")}
      </h4>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        {karatOrder.map((k) => (
          <li key={k} className="rounded-md bg-masa-light px-3 py-2">
            <span className="text-masa-gray">{k}</span>
            <span className="ml-2 font-medium">
              {qarPrefix} {formatGoldPriceCompact(data.karats[k] ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
