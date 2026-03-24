-- =============================================================================
-- Seed: Approved seller for development (seller@masa.com)
-- =============================================================================
-- Run this in Supabase SQL Editor after:
-- 1. The MASA schema is applied (001_masa_schema.sql)
-- 2. The user seller@masa.com exists in auth.users (sign up once via the app)
--
-- This script:
-- 1. Sets profile.role = 'seller' for seller@masa.com
-- 2. Creates or updates an approved seller_application
-- 3. Creates a store owned by that seller (if missing)
-- 4. Adds the seller as store_member with role 'owner'
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_store_id UUID;
BEGIN
  -- Resolve user by email (must exist in auth.users)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'seller@masa.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User seller@masa.com not found. Sign up with this email in the app first, then run this script again.';
  END IF;

  -- 1) Ensure profile exists and set role to 'seller'
  INSERT INTO public.profiles (id, role, email, updated_at)
  SELECT v_user_id, 'seller'::masa_role, email, NOW()
  FROM auth.users
  WHERE id = v_user_id
  ON CONFLICT (id) DO UPDATE SET
    role = 'seller'::masa_role,
    email = EXCLUDED.email,
    updated_at = NOW();

  -- 2) Create or update seller_application (approved)
  INSERT INTO public.seller_applications (
    user_id,
    status,
    business_name,
    business_description,
    contact_email,
    reviewed_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'approved'::seller_application_status,
    'MASA Dev Store',
    'Development store for seller@masa.com',
    'seller@masa.com',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'approved'::seller_application_status,
    business_name = EXCLUDED.business_name,
    contact_email = EXCLUDED.contact_email,
    reviewed_at = COALESCE(public.seller_applications.reviewed_at, NOW()),
    updated_at = NOW();

  -- 3) Create store if not already present for this owner
  INSERT INTO public.stores (owner_id, name, slug, description, status)
  VALUES (
    v_user_id,
    'MASA Dev Store',
    'masa-dev-store',
    'Development store for seller@masa.com',
    'active'::store_status
  )
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_store_id
  FROM public.stores
  WHERE owner_id = v_user_id
  LIMIT 1;

  -- 4) Add seller as store_member (owner)
  IF v_store_id IS NOT NULL THEN
    INSERT INTO public.store_members (store_id, user_id, role)
    VALUES (v_store_id, v_user_id, 'owner'::store_member_role)
    ON CONFLICT (store_id, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Seller setup complete for seller@masa.com (user_id: %, store_id: %)', v_user_id, v_store_id;
END $$;
