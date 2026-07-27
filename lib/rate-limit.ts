import "server-only";

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export type RateLimitConfig = {
  /** Max requests per window. */
  limit: number;
  /** Window in seconds. */
  windowSeconds: number;
};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  entry.count += 1;
  const allowed = entry.count <= config.limit;
  return {
    allowed,
    remaining: Math.max(0, config.limit - entry.count),
    resetAt: entry.resetAt,
  };
}

export function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return ip;
}

export function rateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
}): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
