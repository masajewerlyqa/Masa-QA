"use server";

import { notifyAdminsNewSellerApplication } from "@/lib/notifications";

export type NotifyResult = { ok: boolean; error?: string };

/** Call after a new seller application is submitted; notifies all admins. */
export async function notifyAdminsNewSellerApplicationAction(): Promise<NotifyResult> {
  try {
    await notifyAdminsNewSellerApplication();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to notify admins" };
  }
}
