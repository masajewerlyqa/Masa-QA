import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';

import { navigateAfterAuth } from '../lib/sellerNavigation';
import { isAuthCallbackUrl } from '../lib/oauthRedirect';
import {
  completeAuthFlow,
  createSessionFromCallbackUrl,
  refreshAuthSession,
} from '../services/authService';
import { isBrowserOAuthInFlight } from '../services/oauthCallbackCoordinator';

/**
 * Handles auth deep links (OAuth return, email confirmation, password recovery).
 * Keeps the user in the app — never opens the marketing website.
 */
export function OAuthLinking({ children }: PropsWithChildren): React.JSX.Element {
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleUrl = async (url: string): Promise<void> => {
      if (!isAuthCallbackUrl(url) || handlingRef.current) return;
      if (isBrowserOAuthInFlight()) return;
      handlingRef.current = true;
      try {
        const result = await createSessionFromCallbackUrl(url);
        if (result.error || !result.user) {
          if (result.message && __DEV__) {
            console.warn('[OAuthLinking]', result.message);
          }
          return;
        }

        await refreshAuthSession();
        const { role } = await completeAuthFlow(result.user);
        navigateAfterAuth(role);
      } catch (e) {
        if (__DEV__) console.warn('[OAuthLinking] callback failed:', e);
      } finally {
        handlingRef.current = false;
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return <>{children}</>;
}
