import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { goPaymentCancel, goPaymentSuccess } from '../navigation/routes';

function parseCheckoutDeepLink(url: string): { type: 'success' | 'cancel'; sessionId?: string } | null {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path ?? '';
    if (!path.includes('checkout')) return null;

    if (path.includes('success')) {
      const sessionId =
        typeof parsed.queryParams?.session_id === 'string'
          ? parsed.queryParams.session_id
          : Array.isArray(parsed.queryParams?.session_id)
            ? parsed.queryParams.session_id[0]
            : undefined;
      return sessionId ? { type: 'success', sessionId } : null;
    }

    if (path.includes('cancel')) {
      return { type: 'cancel' };
    }
  } catch {
    return null;
  }
  return null;
}

/** Handles Stripe return URLs (`masa://checkout/success|cancel`). */
export function CheckoutLinking({ children }: PropsWithChildren): React.JSX.Element {
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleUrl = (url: string): void => {
      const parsed = parseCheckoutDeepLink(url);
      if (!parsed || handlingRef.current) return;
      handlingRef.current = true;
      try {
        void WebBrowser.dismissBrowser();
        if (parsed.type === 'success' && parsed.sessionId) {
          goPaymentSuccess(parsed.sessionId);
        } else if (parsed.type === 'cancel') {
          goPaymentCancel();
        }
      } finally {
        handlingRef.current = false;
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return <>{children}</>;
}
