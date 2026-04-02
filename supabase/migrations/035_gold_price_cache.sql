-- Cached Qatar gold prices from server-side scraper (livepriceofgold.com / fallback).
-- Written by cron with service role; public read for /api/gold-prices and RSC.

CREATE TABLE IF NOT EXISTS public.gold_price_cache (
  id text PRIMARY KEY DEFAULT 'qatar_qar',
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gold_price_cache_updated_at_idx ON public.gold_price_cache (updated_at DESC);

ALTER TABLE public.gold_price_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached prices (no secrets in payload).
CREATE POLICY gold_price_cache_select_public
  ON public.gold_price_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.gold_price_cache IS 'Latest scraped Qatar QAR gold snapshot; upsert via SUPABASE_SERVICE_ROLE_KEY from cron only.';
