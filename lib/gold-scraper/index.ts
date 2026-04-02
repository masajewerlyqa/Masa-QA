import "server-only";

/**
 * Server-only gold scraper module (Qatar / QAR).
 * Use from API routes, cron, or server components — never import in client bundles.
 */

export type { QatarGoldPricesJson, GoldKaratKey, ParsedSpotQAR } from "./types";
export { formatGoldPriceQAR, formatGoldPriceCompact } from "./format-price";
export { buildKaratPrices, buildQatarPayload } from "./karat-calculator";
export { scrapeQatarGoldPrices } from "./scraper-service";
export { runGoldPriceRefreshJob } from "./refresh-job";
export {
  getCachedGoldPrices,
  getLatestGram24kQAR,
  getMemoryGoldCache,
  setMemoryGoldCache,
} from "./storage";
