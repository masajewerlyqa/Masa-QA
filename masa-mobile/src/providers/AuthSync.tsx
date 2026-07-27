import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { ensureSecureStoreMigration, getSupabase, isSupabaseConfigured } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

/** Restores session from SecureStore and keeps Zustand in sync with Supabase auth. */
export function AuthSync({ children }: PropsWithChildren): React.JSX.Element {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const session = useAuthStore((s) => s.session);
  const refreshCart = useCartStore((s) => s.refresh);
  const resetCart = useCartStore((s) => s.reset);
  const refreshWishlist = useWishlistStore((s) => s.refresh);
  const resetWishlist = useWishlistStore((s) => s.reset);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const client = getSupabase();

    ensureSecureStoreMigration()
      .then(() => client.auth.getSession())
      .then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return;
        if (error && __DEV__) {
          console.warn('[AuthSync] getSession failed:', error.message);
        }
        setSession(initialSession);
        setLoading(false);
      })
      .catch((e) => {
        if (__DEV__) console.warn('[AuthSync] getSession error:', e);
        if (mounted) setLoading(false);
      });

    const { data: subscription } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        void client.auth.getSession().then(({ data }) => {
          if (data.session) setSession(data.session);
        });
      }
    });

    const onAppState = (state: AppStateStatus): void => {
      if (state === 'active') {
        void client.auth.startAutoRefresh();
      } else {
        void client.auth.stopAutoRefresh();
      }
    };

    const appSub = AppState.addEventListener('change', onAppState);
    void client.auth.startAutoRefresh();

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      appSub.remove();
      void client.auth.stopAutoRefresh();
    };
  }, [setSession, setLoading]);

  useEffect(() => {
    if (session?.user) {
      void refreshCart();
      void refreshWishlist();
    } else {
      resetCart();
      resetWishlist();
    }
  }, [session?.user?.id, refreshCart, resetCart, refreshWishlist, resetWishlist]);

  return <>{children}</>;
}
