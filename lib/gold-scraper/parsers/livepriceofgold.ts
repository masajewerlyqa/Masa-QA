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
 * Parse Qatar QAR spot from livepriceofgold.com main country page HTML.
 * Tolerates minor HTML changes by scanning all table rows for label patterns.
 */
export function parseLivePriceOfGoldQatarHtml(html: string): ParsedSpotQAR | null {
  const $ = cheerio.load(html);
  let gram24: number | null = null;
  let ounce24: number | null = null;
  let tola24: number | null = null;

  $("tr").each((_, tr) => {
    const $tr = $(tr);
    const cells = $tr
      .find("td")
      .map((__, td) => $(td).text().replace(/\u00a0/g, " ").trim())
      .get();
    if (cells.length < 2) return;

    const labelRaw = cells[0] ?? "";
    const label = labelRaw.replace(/\s+/g, " ").toLowerCase();
    const firstValue = parseNumber(cells[1] ?? "");

    if (firstValue == null) return;

    const is24kGram =
      /\b24k\b/.test(label) &&
      (label.includes("gold/gram") || label.includes("gram") || label.includes("g/gold"));
    const isGramRow24 =
      /1\s*gram\s*gold\s*24k/i.test(labelRaw) || /gram\s*gold\s*24k/i.test(label.replace(/\s/g, ""));

    if (gram24 == null && (is24kGram || isGramRow24)) {
      gram24 = firstValue;
    }

    if (ounce24 == null && /\bspot\b.*\boz\b|\bspot\s*gold.*ounce|1\s*ounce\s*24k/i.test(label)) {
      ounce24 = firstValue;
    }

    if (tola24 == null && /\bgold\s*\/\s*tola\b|1\s*tola\s*gold\s*24k|tola.*24k/i.test(label)) {
      tola24 = firstValue;
    }
  });

  // Regex fallback on full document (when table structure changes)
  if (gram24 == null) {
    const flat = $.root().text().replace(/\s+/g, " ");
    const m = flat.match(/1\s*GRAM\s*GOLD\s*24K\s*\|\s*([\d,]+\.?\d*)/i);
    if (m?.[1]) gram24 = parseNumber(m[1]);
  }

  if (gram24 == null) return null;

  if (ounce24 == null) {
    ounce24 = gram24 * TROY_OZ_GRAMS;
  }
  if (tola24 == null) {
    tola24 = gram24 * TOLA_GRAMS;
  }

  return {
    gram24,
    ounce24,
    tola24,
    sourceLabel: "livepriceofgold.com",
  };
}
