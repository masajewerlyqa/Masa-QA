# Gold price scraper (Qatar / QAR)

Server-side only: fetches public HTML, parses QAR spot, caches in Supabase + memory. The browser calls **`GET /api/gold-prices`** (no scraping in the client).

## Architecture

| Piece | Role |
|--------|------|
| `lib/gold-scraper/http-fetch.ts` | `fetch` + timeout + User-Agent |
| `lib/gold-scraper/parsers/livepriceofgold.ts` | Primary HTML → gram/oz/tola |
| `lib/gold-scraper/parsers/goldpriceorg-qatar.ts` | Fallback site |
| `lib/gold-scraper/karat-calculator.ts` | 22K×0.916, 21K×0.875, 18K×0.75 |
| `lib/gold-scraper/scraper-service.ts` | Chain sources |
| `lib/gold-scraper/refresh-job.ts` | Scrape → compare → DB + memory |
| `lib/gold-scraper/storage.ts` | Memory (10 min) → Supabase → `fallback-qatar.json` |
| `app/api/gold-prices/route.ts` | Public JSON (no scrape) |
| `app/api/cron/refresh-gold-prices/route.ts` | Vercel Cron / manual refresh |
| `vercel.json` | `*/10 * * * *` cron |

## Setup

1. **Supabase**  
   Run migration `035_gold_price_cache.sql` (creates `gold_price_cache`, public `SELECT`).

2. **Env** (`.env.local`)  
   - `SUPABASE_SERVICE_ROLE_KEY` — required for cron to **upsert** cache.  
   - `CRON_SECRET` — optional in dev; **recommended in production** (`Authorization: Bearer <CRON_SECRET>` on cron requests).  
   - `GOLD_PRICE_USE_SCRAPER=true` — makes `getGoldPrice()` prefer scraped 24K/gram when a row exists.

3. **First fill**  
   After deploy, call once (replace host + secret):

   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/refresh-gold-prices
   ```

4. **Vercel**  
   - Cron jobs need a **paid** Vercel plan. On Hobby, use an external cron (e.g. cron-job.org) hitting the same URL with the Bearer secret.  
   - Ensure `CRON_SECRET` is set in Vercel project settings.

## API

- **`GET /api/gold-prices`** — Body: `country`, `currency`, `gram`, `ounce`, `tola`, `karats`, `source`, `lastUpdated`. Headers: `X-Gold-Prices-Source`, `X-Gold-Prices-Stale`.

## Frontend example

`GET /api/gold-prices` serves the same JSON shape for integrations; **`/market-prices`** uses KPIs and charts only (no separate live panel).

## Failure behavior

If all scrapes fail, the cron job **does not** overwrite the DB. `GET /api/gold-prices` keeps serving the last Supabase row, then memory, then `lib/gold-scraper/fallback-qatar.json`.

## Legal / ops note

Scraping third-party sites may violate their terms. Prefer official feeds or licensing for production at scale. Parsers use defensive selectors and may need updates when HTML changes.
