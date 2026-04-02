-- Seller subscription plan selection during onboarding and persisted on application / store.
-- basic | premium — fees and limits defined in app config (lib/seller-plans.ts).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_seller_plan TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_pending_seller_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pending_seller_plan_check
  CHECK (pending_seller_plan IS NULL OR pending_seller_plan IN ('basic', 'premium'));

COMMENT ON COLUMN public.profiles.pending_seller_plan IS
  'Draft plan chosen on Become a Seller flow; cleared after application submit.';

ALTER TABLE public.seller_applications
  ADD COLUMN IF NOT EXISTS seller_plan TEXT NOT NULL DEFAULT 'basic';

ALTER TABLE public.seller_applications
  DROP CONSTRAINT IF EXISTS seller_applications_seller_plan_check;

ALTER TABLE public.seller_applications
  ADD CONSTRAINT seller_applications_seller_plan_check
  CHECK (seller_plan IN ('basic', 'premium'));

COMMENT ON COLUMN public.seller_applications.seller_plan IS
  'Selected subscription tier: basic (100 products, 15% commission) or premium (unlimited, 20%).';

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS seller_plan TEXT;

ALTER TABLE public.stores
  DROP CONSTRAINT IF EXISTS stores_seller_plan_check;

ALTER TABLE public.stores
  ADD CONSTRAINT stores_seller_plan_check
  CHECK (seller_plan IS NULL OR seller_plan IN ('basic', 'premium'));

COMMENT ON COLUMN public.stores.seller_plan IS
  'Mirrors approved seller application plan; used for product limits and marketplace features.';
