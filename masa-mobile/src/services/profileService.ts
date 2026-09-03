import { supabase } from './supabase';

import type { ProfileRole } from './profileAuthService';

export type ProfileSummary = {
  fullName: string;
  email: string;
  phone?: string;
  role: ProfileRole;
  ordersCount: number;
  wishlistCount: number;
  cartCount: number;
};

export async function getProfileSummary(): Promise<ProfileSummary | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { count: ordersCount }, { count: wishlistCount }, { data: cartRows }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', user.id),
      supabase
        .from('wishlist_items')
        .select('id', { count: 'exact', head: true })
        .in(
          'wishlist_id',
          (
            (
              await supabase
                .from('wishlists')
                .select('id')
                .eq('user_id', user.id)
            ).data ?? []
          ).map((row) => row.id)
        ),
      supabase
        .from('cart_items')
        .select('quantity, carts!inner(user_id)')
        .eq('carts.user_id', user.id),
    ]);

  const cartCount =
    (cartRows ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0), 0) ?? 0;

  const roleRaw = profile?.role;
  const role: ProfileRole =
    roleRaw === 'admin' ||
    roleRaw === 'seller' ||
    roleRaw === 'pending_seller' ||
    roleRaw === 'customer'
      ? roleRaw
      : 'customer';

  return {
    fullName: profile?.full_name ?? user.email?.split('@')[0] ?? 'MASA User',
    email: user.email ?? '',
    phone: profile?.phone ?? undefined,
    role,
    ordersCount: ordersCount ?? 0,
    wishlistCount: wishlistCount ?? 0,
    cartCount,
  };
}

export type ProfileUpdateResult = { ok: true } | { ok: false; error: string };

/** Mirrors web `updateProfileAction` (app/(site)/account/settings/actions.ts). */
export async function updateProfile(input: { fullName: string; phone: string }): Promise<ProfileUpdateResult> {
  const fullName = input.fullName.trim();
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: 'Enter a name between 2 and 120 characters.' };
  }
  const rawPhone = input.phone.trim();
  if (rawPhone && (rawPhone.length < 8 || !/^[\d\s+().-]+$/.test(rawPhone))) {
    return { ok: false, error: 'Enter a valid phone number.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in required' };

  let phone: string | null = rawPhone || null;
  if (!phone) {
    const { data: existing } = await supabase.from('profiles').select('phone').eq('id', user.id).maybeSingle();
    if (existing?.phone?.trim()) phone = existing.phone;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mirrors web `updateNewsletterOptInAction`. */
export async function updateNewsletterOptIn(optIn: boolean): Promise<ProfileUpdateResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in required' };

  const { error } = await supabase
    .from('profiles')
    .update({ newsletter_opt_in: optIn, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getNewsletterOptIn(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from('profiles').select('newsletter_opt_in').eq('id', user.id).maybeSingle();
  return Boolean(data?.newsletter_opt_in);
}
