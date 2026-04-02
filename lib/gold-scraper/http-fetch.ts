import { goldScraperLog } from "./logger";

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export type FetchHtmlOptions = {
  timeoutMs?: number;
  userAgent?: string;
};

/**
 * Fetch HTML with timeout and browser-like headers (server-side only).
 */
export async function fetchHtml(url: string, options?: FetchHtmlOptions): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": options?.userAgent ?? DEFAULT_UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    goldScraperLog.warn("fetchHtml failed", { url, error: msg });
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
