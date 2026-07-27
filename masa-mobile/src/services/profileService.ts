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
