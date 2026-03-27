-- Dynamic market-based pricing support:
-- Adds/normalizes seller-entered optional craftsmanship margin per product.
-- This migration is idempotent and safe to run multiple times.

alter table if exists public.products
  add column if not exists craftsmanship_margin numeric(12,2);

alter table if exists public.products
  alter column craftsmanship_margin set default 0;

update public.products
set craftsmanship_margin = 0
where craftsmanship_margin is null;

alter table if exists public.products
  alter column craftsmanship_margin set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_craftsmanship_margin_nonnegative'
  ) then
    alter table public.products
      add constraint products_craftsmanship_margin_nonnegative
      check (craftsmanship_margin >= 0);
  end if;
end $$;

comment on column public.products.craftsmanship_margin is
  'Optional seller labor/craftsmanship margin in USD added on top of market-linked material value.';

-- Helps PostgREST refresh schema cache immediately on some deployments.
notify pgrst, 'reload schema';
