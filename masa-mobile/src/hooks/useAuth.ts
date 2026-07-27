import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '../api/client';
import { useAuthStore } from '../stores/authStore';

export type AuthHookValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

export function useAuth(): AuthHookValue {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  const refreshSession = async (): Promise<void> => {
    const { data } = await supabase.auth.getSession();
    useAuthStore.getState().setSession(data.session);
  };

  return { user, session, isLoading, refreshSession };
}
