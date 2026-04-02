import "server-only";
import { scrapeQatarGoldPrices } from "./scraper-service";
import { goldScraperLog } from "./logger";
import {
  readGoldPricesFromDatabase,
  writeGoldPricesToDatabase,
  setMemoryGoldCache,
  pricesChangedMeaningfully,
} from "./storage";
import type { RefreshJobResult } from "./scraper-service";

/**
 * Full refresh: scrape → compare to DB → persist if new data → warm memory cache.
 * On total failure, leaves DB + memory unchanged (last good value remains).
 */
export async function runGoldPriceRefreshJob(): Promise<RefreshJobResult> {
  const scrape = await scrapeQatarGoldPrices();
  if (!scrape.ok || !scrape.payload) {
    goldScraperLog.warn("Refresh job: scrape failed, keeping previous cache", {
      error: scrape.error,
    });
    return { ...scrape, changed: false, keptPrevious: true };
  }

  const prev = await readGoldPricesFromDatabase();
  const changed = !prev || pricesChangedMeaningfully(prev, scrape.payload);

  const written = await writeGoldPricesToDatabase(scrape.payload);
  if (written) {
    setMemoryGoldCache(scrape.payload);
    goldScraperLog.info("gold_price_cache updated", {
      gram: scrape.payload.gram,
      changed,
      source: scrape.payload.source,
    });
  } else {
    setMemoryGoldCache(scrape.payload);
    goldScraperLog.warn("Refresh: memory updated but DB write failed (check service role key)");
  }

  return { ...scrape, changed, keptPrevious: false };
}
