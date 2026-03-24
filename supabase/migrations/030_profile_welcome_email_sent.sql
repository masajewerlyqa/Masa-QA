-- Idempotent welcome email tracking (set when transactional welcome is sent successfully).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.welcome_email_sent_at IS 'First successful welcome email timestamp; prevents duplicate sends.';
