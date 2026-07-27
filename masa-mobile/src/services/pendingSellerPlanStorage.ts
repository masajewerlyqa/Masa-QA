import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseSellerPlanId, type SellerPlanId } from '../constants/sellerPlans';

const KEY = 'masa-pending-seller-plan';

/** Plan chosen before sign-up (mirrors web RegisterFlow plan step). */
export async function stashPreRegistrationSellerPlan(planId: SellerPlanId): Promise<void> {
  await AsyncStorage.setItem(KEY, planId);
}

export async function getPreRegistrationSellerPlan(): Promise<SellerPlanId | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseSellerPlanId(raw);
}

export async function consumePreRegistrationSellerPlan(): Promise<SellerPlanId | null> {
  const plan = await getPreRegistrationSellerPlan();
  await AsyncStorage.removeItem(KEY);
  return plan;
}

export async function clearPreRegistrationSellerPlan(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
