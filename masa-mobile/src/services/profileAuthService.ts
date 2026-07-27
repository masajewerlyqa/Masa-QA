import type { User } from '@supabase/supabase-js';

import { getSupabase } from '../api/client';
import type { SellerPlanId } from '../constants/sellerPlans';
import type { RegistrationIntent } from './authService';
import { consumePreRegistrationSellerPlan } from './pendingSellerPlanStorage';

export type ProfileRole = 'admin' | 'seller' | 'pending_seller' | 'customer';

export async function waitForUserProfile(
  userId: string,
  maxAttempts = 6,
  delayMs = 350,
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await getSupabase()
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (data?.id) return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

export async function resolveProfileRole(user: User): Promise<ProfileRole> {
  const found = await waitForUserProfile(user.id);
  if (found) {
    const { data } = await getSupabase()
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = data?.role;
    if (
      role === 'admin' ||
      role === 'seller' ||
      role === 'pending_seller' ||
      role === 'customer'
    ) {
      return role;
    }
  }

  const intent =
    typeof user.user_metadata?.registration_intent === 'string'
      ? user.user_metadata.registration_intent
      : null;
  return intent === 'seller' ? 'pending_seller' : 'customer';
}

/**
 * Applies buyer/seller choice after OAuth or Apple sign-in.
 * Does not downgrade seller/admin roles when intent is buyer (login path).
 */
export async function applyRegistrationIntentToProfile(
  userId: string,
  intent: RegistrationIntent,
): Promise<void> {
  if (intent === 'buyer') {
    return;
  }

  await waitForUserProfile(userId, 8, 400);

  const { data: existing } = await getSupabase()
    .from('profiles')
    .select('role, pending_seller_plan')
    .eq('id', userId)
    .maybeSingle();

  const stashedPlan = await consumePreRegistrationSellerPlan();
  const resolvedPlan: SellerPlanId | null =
    stashedPlan ?? (existing?.pending_seller_plan as SellerPlanId | null | undefined) ?? null;

  if (
    existing?.role === 'seller' ||
    existing?.role === 'admin' ||
    existing?.role === 'pending_seller'
  ) {
    if (resolvedPlan && !existing.pending_seller_plan) {
      await getSupabase()
        .from('profiles')
        .update({
          pending_seller_plan: resolvedPlan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }
    return;
  }

  const acceptedAt = new Date().toISOString();
  const authMeta: Record<string, unknown> = {
    registration_intent: 'seller',
    signup_channel: 'oauth',
  };
  if (resolvedPlan) {
    authMeta.pending_seller_plan = resolvedPlan;
  }
  await getSupabase().auth.updateUser({ data: authMeta });

  const patch: Record<string, unknown> = {
    role: 'pending_seller',
    updated_at: acceptedAt,
  };
  if (resolvedPlan) {
    patch.pending_seller_plan = resolvedPlan;
  }

  if (existing) {
    const { error } = await getSupabase().from('profiles').update(patch).eq('id', userId);
    if (error) {
      if (__DEV__) console.warn('[profileAuth] seller role update failed:', error.message);
    }
    return;
  }

  await waitForUserProfile(userId, 6, 400);
  const { error: retryError } = await getSupabase().from('profiles').update(patch).eq('id', userId);
  if (retryError) {
    if (__DEV__) console.warn('[profileAuth] seller role retry failed:', retryError.message);
  }
}
