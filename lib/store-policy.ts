/**
 * Store return/exchange/same-day policy — shared types and pure helpers (no server imports).
 */

import type { StorePolicyPublic } from "@/lib/types/database";

export const POLICY_EDIT_COOLDOWN_DAYS = 14;

/** Orders in these statuses do not block the seller from editing store policy. */
export const ORDER_STATUSES_TERMINAL_FOR_POLICY = new Set(["delivered", "cancelled", "refunded"]);

export function orderStatusBlocksPolicyEdit(status: string): boolean {
  return !ORDER_STATUSES_TERMINAL_FOR_POLICY.has(status);
}

export type StorePolicySnapshot = {
  returns_enabled: boolean;
  exchanges_enabled: boolean;
  return_period_days: number;
  exchange_period_days: number;
  custom_conditions: string | null;
  same_day_delivery_enabled: boolean;
  /** "HH:MM:SS" or null */
  same_day_cutoff_local: string | null;
  captured_at: string;
};

export type StorePolicyRowInput = {
  returns_enabled?: boolean | null;
  exchanges_enabled?: boolean | null;
  return_period_days?: number | null;
  exchange_period_days?: number | null;
  policy_custom_conditions?: string | null;
  same_day_delivery_enabled?: boolean | null;
  same_day_cutoff_local?: string | null;
};

export function buildPolicySnapshot(row: StorePolicyRowInput, capturedAt: Date = new Date()): StorePolicySnapshot {
  const sameDay = row.same_day_delivery_enabled === true;
  const cutoff =
    typeof row.same_day_cutoff_local === "string" && row.same_day_cutoff_local.trim()
      ? row.same_day_cutoff_local.trim()
      : "14:00:00";
  return {
    returns_enabled: row.returns_enabled !== false,
    exchanges_enabled: row.exchanges_enabled !== false,
    return_period_days: clampInt(row.return_period_days, 1, 14, 3),
    exchange_period_days: clampInt(row.exchange_period_days, 1, 14, 3),
    custom_conditions:
      typeof row.policy_custom_conditions === "string" && row.policy_custom_conditions.trim()
        ? row.policy_custom_conditions.trim()
        : null,
    same_day_delivery_enabled: sameDay,
    same_day_cutoff_local: sameDay ? cutoff : null,
    captured_at: capturedAt.toISOString(),
  };
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function parsePolicySnapshots(raw: unknown): Record<string, StorePolicySnapshot> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, StorePolicySnapshot> = {};
  for (const [storeId, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!val || typeof val !== "object") continue;
    const o = val as Record<string, unknown>;
    out[storeId] = {
      returns_enabled: o.returns_enabled !== false,
      exchanges_enabled: o.exchanges_enabled !== false,
      return_period_days: clampInt(o.return_period_days, 1, 14, 3),
      exchange_period_days: clampInt(o.exchange_period_days, 1, 14, 3),
      custom_conditions: typeof o.custom_conditions === "string" ? o.custom_conditions : null,
      same_day_delivery_enabled: o.same_day_delivery_enabled === true,
      same_day_cutoff_local: typeof o.same_day_cutoff_local === "string" ? o.same_day_cutoff_local : null,
      captured_at: typeof o.captured_at === "string" ? o.captured_at : new Date().toISOString(),
    };
  }
  return out;
}

export function publicPolicyFromSnapshot(s: StorePolicySnapshot): StorePolicyPublic {
  return {
    returnsEnabled: s.returns_enabled,
    exchangesEnabled: s.exchanges_enabled,
    returnPeriodDays: s.return_period_days,
    exchangePeriodDays: s.exchange_period_days,
    customConditions: s.custom_conditions,
    sameDayDeliveryEnabled: s.same_day_delivery_enabled,
    sameDayCutoffLocal: s.same_day_cutoff_local,
  };
}

export function publicPolicyFromStoreRow(row: StorePolicyRowInput): StorePolicyPublic {
  return publicPolicyFromSnapshot(buildPolicySnapshot(row));
}

/** Short line for product detail (EN/AR handled by caller with t()). */
export function policySummaryLine(
  p: StorePolicyPublic,
  lang: "en" | "ar"
): string {
  const parts: string[] = [];
  if (p.returnsEnabled) {
    parts.push(
      lang === "ar"
        ? `إرجاع خلال ${p.returnPeriodDays} يومًا من التسليم`
        : `Returns within ${p.returnPeriodDays} days of delivery`
    );
  } else {
    parts.push(lang === "ar" ? "الإرجاع غير متاح" : "Returns not offered");
  }
  if (p.exchangesEnabled) {
    parts.push(
      lang === "ar"
        ? `استبدال خلال ${p.exchangePeriodDays} يومًا`
        : `Exchange within ${p.exchangePeriodDays} days`
    );
  } else {
    parts.push(lang === "ar" ? "الاستبدال غير متاح" : "Exchanges not offered");
  }
  return parts.join(lang === "ar" ? " · " : " · ");
}

export type EligibilityResult = {
  eligible: boolean;
  deadlineIso: string | null;
};

export function buyerReturnExchangeEligibility(params: {
  orderStatus: string;
  deliveredAt: string | null;
  snapshot: StorePolicySnapshot | null;
  kind: "return" | "exchange";
  now?: Date;
}): EligibilityResult {
  const now = params.now ?? new Date();
  if (params.orderStatus !== "delivered") {
    return { eligible: false, deadlineIso: null };
  }
  if (!params.deliveredAt || !params.snapshot) {
    return { eligible: false, deadlineIso: null };
  }
  const delivered = new Date(params.deliveredAt);
  if (Number.isNaN(delivered.getTime())) {
    return { eligible: false, deadlineIso: null };
  }
  const days = params.kind === "return" ? params.snapshot.return_period_days : params.snapshot.exchange_period_days;
  const enabled = params.kind === "return" ? params.snapshot.returns_enabled : params.snapshot.exchanges_enabled;
  if (!enabled) {
    return { eligible: false, deadlineIso: null };
  }
  const deadlineMs = delivered.getTime() + days * 24 * 60 * 60 * 1000;
  const deadlineIso = new Date(deadlineMs).toISOString();
  if (now.getTime() > deadlineMs) {
    return { eligible: false, deadlineIso };
  }
  return { eligible: true, deadlineIso };
}

export function canEditStorePolicy(params: {
  storePolicyUpdatedAt: string | null;
  now?: Date;
}): { ok: true } | { ok: false; nextEditAtIso: string } {
  const now = params.now ?? new Date();
  if (!params.storePolicyUpdatedAt) return { ok: true };
  const last = new Date(params.storePolicyUpdatedAt);
  if (Number.isNaN(last.getTime())) return { ok: true };
  const next = new Date(last.getTime() + POLICY_EDIT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  if (now.getTime() < next.getTime()) {
    return { ok: false, nextEditAtIso: next.toISOString() };
  }
  return { ok: true };
}
