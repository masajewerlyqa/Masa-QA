import "server-only";
import { fetchHtml } from "./http-fetch";
import { goldScraperLog } from "./logger";
import { buildQatarPayload } from "./karat-calculator";
import type { ParsedSpotQAR, QatarGoldPricesJson } from "./types";
import { parseLivePriceOfGoldQatarHtml } from "./parsers/livepriceofgold";
import { parseGoldPriceOrgQatarHtml } from "./parsers/goldpriceorg-qatar";

const PRIMARY_URL = "https://www.livepriceofgold.com/qatar-gold-price.html";
const FALLBACK_URL = "https://goldprice.org/gold-price-qatar.html";

export type ScrapeBundle = {
  ok: boolean;
  payload: QatarGoldPricesJson | null;
  error?: string;
  attempts: { url: string; parser: string; ok: boolean; detail?: string }[];
};

export type RefreshJobResult = ScrapeBundle & { changed?: boolean; keptPrevious?: boolean };

function tryParse(
  html: string,
  parser: (h: string) => ParsedSpotQAR | null,
  name: string
): ParsedSpotQAR | null {
  try {
    return parser(html);
  } catch (e) {
    goldScraperLog.warn(`Parser ${name} threw`, {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

/**
 * Scrape Qatar gold in QAR from public pages. Primary: livepriceofgold.com;
 * secondary: goldprice.org. No persistence here — caller handles storage.
 */
export async function scrapeQatarGoldPrices(): Promise<ScrapeBundle> {
  const attempts: ScrapeBundle["attempts"] = [];

  const chain: { url: string; parser: (h: string) => ParsedSpotQAR | null; label: string }[] = [
    { url: PRIMARY_URL, parser: parseLivePriceOfGoldQatarHtml, label: "livepriceofgold" },
    { url: FALLBACK_URL, parser: parseGoldPriceOrgQatarHtml, label: "goldpriceorg" },
    { url: FALLBACK_URL, parser: parseLivePriceOfGoldQatarHtml, label: "livepriceofgold-on-fallback-url" },
  ];

  for (const step of chain) {
    try {
      const html = await fetchHtml(step.url, { timeoutMs: 18_000 });
      const parsed = tryParse(html, step.parser, step.label);
      if (parsed && parsed.gram24 > 0) {
        attempts.push({ url: step.url, parser: step.label, ok: true });
        const payload = buildQatarPayload(parsed.gram24, parsed.ounce24, parsed.tola24, parsed.sourceLabel);
        goldScraperLog.info("Scrape succeeded", {
          source: payload.source,
          gram: payload.gram,
        });
        return { ok: true, payload, attempts };
      }
      attempts.push({
        url: step.url,
        parser: step.label,
        ok: false,
        detail: "parse returned null",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      attempts.push({ url: step.url, parser: step.label, ok: false, detail: msg });
      goldScraperLog.warn("Scrape step failed", { url: step.url, parser: step.label, error: msg });
    }
  }

  goldScraperLog.error("All gold scrape sources failed", { attempts });
  return {
    ok: false,
    payload: null,
    error: "All scrape sources failed",
    attempts,
  };
}
