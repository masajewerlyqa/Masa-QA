/**
 * Store business hours: visibility vs order placement.
 * working_days: 0 = Sunday … 6 = Saturday (matches JavaScript Date#getDay()).
 */

export type StoreHoursRow = {
  business_timezone: string;
  working_days: number[] | null;
  opening_time_local: string | null;
  closing_time_local: string | null;
};

export type StoreAvailabilityReason = "not_configured" | "closed";

export function isScheduleConfigured(store: StoreHoursRow): boolean {
  const days = store.working_days ?? [];
  return (
    Array.isArray(days) &&
    days.length > 0 &&
    store.opening_time_local != null &&
    store.opening_time_local !== "" &&
    store.closing_time_local != null &&
    store.closing_time_local !== ""
  );
}

/** Parse "HH:MM:SS" or "HH:MM" to minutes from midnight. */
export function parseTimeToMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Current weekday (0–6 Sun–Sat) and minutes since midnight in the given IANA timezone.
 */
export function getZonedWeekdayAndMinutes(date: Date, timeZone: string): { weekday: number; minutes: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const wdStr = map.weekday ?? "Sun";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wdStr);
  const hour = Number.parseInt(map.hour ?? "0", 10);
  const minute = Number.parseInt(map.minute ?? "0", 10);
  return {
    weekday: weekday >= 0 ? weekday : 0,
    minutes: hour * 60 + minute,
  };
}

export function isStoreOpenNow(store: StoreHoursRow, now: Date = new Date()): boolean {
  if (!isScheduleConfigured(store)) return false;
  const tz = store.business_timezone?.trim() || "Asia/Qatar";
  const { weekday, minutes } = getZonedWeekdayAndMinutes(now, tz);
  const days = store.working_days ?? [];
  if (!days.includes(weekday)) return false;
  const openM = parseTimeToMinutes(store.opening_time_local!);
  const closeM = parseTimeToMinutes(store.closing_time_local!);
  if (openM == null || closeM == null) return false;
  if (closeM <= openM) return false;
  return minutes >= openM && minutes < closeM;
}

export function getStoreOrderBlockReason(
  store: StoreHoursRow,
  now: Date = new Date()
): StoreAvailabilityReason | null {
  if (!isScheduleConfigured(store)) return "not_configured";
  if (!isStoreOpenNow(store, now)) return "closed";
  return null;
}

export type StoreLiveStatus = "open" | "closed" | "not_configured";

export function getStoreLiveStatus(store: StoreHoursRow, now: Date = new Date()): StoreLiveStatus {
  if (!isScheduleConfigured(store)) return "not_configured";
  return isStoreOpenNow(store, now) ? "open" : "closed";
}
