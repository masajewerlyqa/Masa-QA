import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { getSupabase } from '../api/client';
import { sitePostJsonAuthed } from '../api/siteApi';
import { parseSellerPlanId, type SellerPlanId } from '../constants/sellerPlans';
import {
  finalizeSellerApplicationSchema,
  socialLinksFromForm,
  type SellerApplicationFormValues,
} from '../lib/validations/sellerApplication';

const BUCKET_LICENSES = 'store-licenses';
const BUCKET_LOGOS = 'store-logos';

export type SellerApplicationStatus = {
  status: string;
} | null;

export type SellerOnboardingStep =
  | 'auth'
  | 'plans'
  | 'application'
  | 'existing'
  | 'dashboard';

export async function getSellerApplication(): Promise<SellerApplicationStatus> {
  const { data: userData } = await getSupabase().auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data } = await getSupabase()
    .from('seller_applications')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  return data ? { status: data.status as string } : null;
}

export async function getPendingSellerPlan(): Promise<SellerPlanId | null> {
  const { data: userData } = await getSupabase().auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data } = await getSupabase()
    .from('profiles')
    .select('pending_seller_plan, role')
    .eq('id', user.id)
    .maybeSingle();

  return parseSellerPlanId(data?.pending_seller_plan);
}

export async function resolveSellerOnboardingStep(): Promise<SellerOnboardingStep> {
  const { data: userData } = await getSupabase().auth.getUser();
  const user = userData.user;
  if (!user) return 'auth';

  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('role, pending_seller_plan')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'seller' || profile?.role === 'admin') {
    return 'dashboard';
  }

  const existing = await getSellerApplication();
  if (existing) return 'existing';

  const plan = parseSellerPlanId(profile?.pending_seller_plan);
  if (plan) return 'application';

  return 'plans';
}

export async function savePendingSellerPlan(
  planId: SellerPlanId,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: userData } = await getSupabase().auth.getUser();
  const user = userData.user;
  if (!user) {
    return { ok: false, error: 'Not signed in' };
  }

  const { error } = await getSupabase()
    .from('profiles')
    .update({
      pending_seller_plan: planId,
      role: 'pending_seller',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

async function uploadFromUri(
  bucket: string,
  path: string,
  uri: string,
  contentType: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const { error } = await getSupabase().storage.from(bucket).upload(path, arrayBuffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 100) || 'file';
}

export async function pickLogoImage(): Promise<{ uri: string; name: string } | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName ?? `logo-${Date.now()}.jpg`,
  };
}

export async function pickLicenseFile(): Promise<{
  uri: string;
  name: string;
  mimeType: string;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name ?? `license-${Date.now()}`,
    mimeType: asset.mimeType ?? 'application/octet-stream',
  };
}

export async function finalizeSellerApplication(
  form: SellerApplicationFormValues,
  license: { uri: string; name: string; mimeType: string },
  logo: { uri: string; name: string } | null,
): Promise<
  | { ok: true; planId: SellerPlanId }
  | { ok: false; error: string; code?: 'SELECT_PLAN_FIRST' | 'NOT_SIGNED_IN' }
> {
  const { data: userData } = await getSupabase().auth.getUser();
  const user = userData.user;
  if (!user) {
    return { ok: false, error: 'Not signed in', code: 'NOT_SIGNED_IN' };
  }

  const { data: prof, error: profErr } = await getSupabase()
    .from('profiles')
    .select('pending_seller_plan')
    .eq('id', user.id)
    .single();

  if (profErr || !prof) {
    return { ok: false, error: profErr?.message ?? 'Could not load profile' };
  }

  const planId = parseSellerPlanId(prof.pending_seller_plan);
  if (!planId) {
    return {
      ok: false,
      error: 'Please choose a plan before submitting your application.',
      code: 'SELECT_PLAN_FIRST',
    };
  }

  const licenseSafeName = sanitizeFileName(license.name);
  const licensePath = `${user.id}/${Date.now()}-${licenseSafeName}`;
  const licenseUpload = await uploadFromUri(
    BUCKET_LICENSES,
    licensePath,
    license.uri,
    license.mimeType,
  );
  if (!licenseUpload.ok) {
    return { ok: false, error: `License upload failed: ${licenseUpload.error}` };
  }

  let logoPath: string | null = null;
  if (logo) {
    const ext = logo.name.split('.').pop() || 'jpg';
    const logoPathName = `${user.id}/${Date.now()}-logo.${ext}`;
    const logoUpload = await uploadFromUri(
      BUCKET_LOGOS,
      logoPathName,
      logo.uri,
      'image/jpeg',
    );
    if (!logoUpload.ok) {
      return { ok: false, error: `Logo upload failed: ${logoUpload.error}` };
    }
    logoPath = logoPathName;
  }

  const payload = {
    ...form,
    license_path: licensePath,
    logo_path: logoPath,
  };

  const parsed = finalizeSellerApplicationSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    };
  }

  // Submitted through the web action rather than written here directly: it
  // snapshots the fee, assigns the payment reference and sends the payment
  // instructions email. Writing the row from the app skipped all of that, so a
  // mobile applicant could never reach the payment step.
  const submitted = await sitePostJsonAuthed<{ ok: boolean; error?: string }>(
    '/api/seller/apply',
    parsed.data,
  );

  if (!submitted.ok) {
    return { ok: false, error: submitted.error };
  }
  if (!submitted.data?.ok) {
    return { ok: false, error: submitted.data?.error ?? 'Could not submit your application.' };
  }

  return { ok: true, planId };
}
