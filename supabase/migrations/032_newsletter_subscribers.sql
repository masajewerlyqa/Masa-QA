-- Newsletter subscriptions from footer/home forms.
-- Stores one row per email (case-insensitive) with optional source tag.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key
  ON public.newsletter_subscribers (email);

CREATE OR REPLACE FUNCTION public.set_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER trg_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.set_newsletter_subscribers_updated_at();

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- No public read/write. Insert/update is done server-side with service role only.
DROP POLICY IF EXISTS newsletter_subscribers_no_access ON public.newsletter_subscribers;
CREATE POLICY newsletter_subscribers_no_access
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
