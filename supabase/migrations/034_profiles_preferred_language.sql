-- Preferred UI/email language for transactional messages (en | ar).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
  CHECK (preferred_language IN ('en', 'ar'));

COMMENT ON COLUMN public.profiles.preferred_language IS 'User language for emails and UI sync; en or ar.';
