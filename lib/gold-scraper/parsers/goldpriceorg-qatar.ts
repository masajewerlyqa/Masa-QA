import * as cheerio from "cheerio";
import type { ParsedSpotQAR } from "../types";

const TROY_OZ_GRAMS = 31.1034768;
const TOLA_GRAMS = 11.6638125;

function parseNumber(s: string): number | null {
  const cleaned = s.replace(/,/g, "").replace(/\s/g, "").trim();
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Fallback scraper: goldprice.org Qatar page.
 * HTML varies; we try table rows and loose text patterns. May break if the site redesigns.
 */
export function parseGoldPriceOrgQatarHtml(html: string): ParsedSpotQAR | null {
  const $ = cheerio.load(html);
  let gram24: number | null = null;
  let ounce24: number | null = null;

  $("tr").each((_, tr) => {
    const text = $(tr).text().replace(/\s+/g, " ").toLowerCase();
    const cells = $(tr)
      .find("td")
      .map((__, td) => $(td).text().trim())
      .get();
    if (cells.length < 2) return;
    const v = parseNumber(cells[1] ?? "");
    if (v == null) return;
    if (text.includes("gram") && text.includes("24") && !text.includes("22")) {
      if (gram24 == null && v > 10 && v < 5000) gram24 = v;
    }
    if (text.includes("ounce") && text.includes("24")) {
      if (ounce24 == null && v > 1000) ounce24 = v;
    }
  });

  if (gram24 == null) {
    const body = $.root().text().replace(/\s+/g, " ");
    const m =
      body.match(/gold[^0-9]{0,40}per[^0-9]{0,20}gram[^0-9]{0,40}([\d,]+\.?\d*)/i) ||
      body.match(/([\d,]+\.?\d*)\s*QAR[^0-9]{0,30}gram/i);
    if (m?.[1]) {
      const n = parseNumber(m[1]);
      if (n != null && n > 50 && n < 5000) gram24 = n;
    }
  }

  if (gram24 == null) return null;

  if (ounce24 == null) {
    ounce24 = gram24 * TROY_OZ_GRAMS;
  }

  return {
    gram24,
    ounce24,
    tola24: gram24 * TOLA_GRAMS,
    sourceLabel: "goldprice.org",
  };
}
