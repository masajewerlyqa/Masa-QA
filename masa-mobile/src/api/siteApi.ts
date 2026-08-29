import { getSupabase } from './client';
import { resolveSiteUrl } from '../config/env';

export type SiteFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

const DEFAULT_TIMEOUT_MS = 25_000;

/**
 * Fetch JSON from the same Next.js site as the web app (no CORS from native — not a browser).
 */
export async function siteFetchJson<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<SiteFetchResult<T>> {
  const base = resolveSiteUrl();
  if (!base) {
    return {
      ok: false,
      error:
        'Site URL is not configured. Set EXPO_PUBLIC_SITE_URL in masa-mobile/.env to your running Next.js app or production domain.',
    };
  }

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        error: `Invalid response from server (${res.status}).`,
        status: res.status,
      };
    }

    if (!res.ok) {
      const errBody = json as { error?: string; message?: string };
      return {
        ok: false,
        error: errBody?.error ?? errBody?.message ?? `Request failed (${res.status}).`,
        status: res.status,
      };
    }

    return { ok: true, data: json as T };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, error: 'Request timed out. Check your connection and try again.' };
    }
    const msg = e instanceof Error ? e.message : 'Network request failed.';
    return {
      ok: false,
      error: `${msg} Ensure EXPO_PUBLIC_SITE_URL points to a reachable host (not localhost on a physical device unless using your LAN IP).`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function sitePostJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit & { timeoutMs?: number },
): Promise<SiteFetchResult<T>> {
  return siteFetchJson<T>(path, {
    ...init,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

/** Authenticated JSON fetch. */
export async function siteFetchJsonAuthed<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<SiteFetchResult<T>> {
  const headers = await authHeaders();
  if (!headers) {
    return { ok: false, error: 'Sign in to continue.' };
  }
  return siteFetchJson<T>(path, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });
}

export async function sitePostJsonAuthed<T>(
  path: string,
  body: unknown,
  init?: RequestInit & { timeoutMs?: number },
): Promise<SiteFetchResult<T>> {
  const headers = await authHeaders();
  if (!headers) {
    return { ok: false, error: 'Sign in to continue.' };
  }
  return sitePostJson<T>(path, body, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });
}
