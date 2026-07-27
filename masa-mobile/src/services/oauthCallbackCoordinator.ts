let activeCallbackUrl: string | null = null;
let activeExchange: Promise<unknown> | null = null;
let browserOAuthInFlight = false;

/** True while WebBrowser.openAuthSessionAsync is waiting (prevents duplicate deep-link handling). */
export function isBrowserOAuthInFlight(): boolean {
  return browserOAuthInFlight;
}

export function setBrowserOAuthInFlight(value: boolean): void {
  browserOAuthInFlight = value;
}

/**
 * Ensures a single PKCE exchange per callback URL.
 * Prevents OAuthLinking + signInWithOAuth from both calling exchangeCodeForSession.
 */
export async function runOAuthCallbackExchange<T>(
  url: string,
  exchange: () => Promise<T>,
): Promise<T> {
  if (activeCallbackUrl === url && activeExchange) {
    return activeExchange as Promise<T>;
  }

  activeCallbackUrl = url;
  activeExchange = (async () => {
    try {
      return await exchange();
    } finally {
      activeCallbackUrl = null;
      activeExchange = null;
    }
  })();

  return activeExchange as Promise<T>;
}
