import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../MasaButton';
import { theme } from '../../constants/theme';
import {
  refreshAuthSession,
  signInWithApple,
  signInWithOAuth,
  type RegistrationIntent,
} from '../../services/authService';

type Provider = 'google' | 'apple';

type SocialAuthButtonsMobileProps = {
  disabled?: boolean;
  isArabic: boolean;
  /** Buyer/seller path during sign-up only; omitted on sign-in. */
  signupIntent?: RegistrationIntent;
  onSuccess: () => void | Promise<void>;
  onError: (message: string) => void;
};

function providerLabel(provider: Provider, isArabic: boolean, loading: boolean): string {
  if (loading) {
    return isArabic ? 'جارٍ تسجيل الدخول...' : 'Signing in...';
  }
  if (provider === 'google') {
    return isArabic ? 'المتابعة عبر Google' : 'Continue with Google';
  }
  return isArabic ? 'المتابعة عبر Apple' : 'Continue with Apple';
}

export function SocialAuthButtonsMobile({
  disabled = false,
  isArabic,
  signupIntent,
  onSuccess,
  onError,
}: SocialAuthButtonsMobileProps): React.JSX.Element {
  const [loading, setLoading] = useState<Provider | null>(null);
  const authLang = isArabic ? 'ar' : 'en';
  const busy = disabled || loading !== null;

  const finish = async (result: Awaited<ReturnType<typeof signInWithOAuth>>): Promise<void> => {
    if (result.error || !result.user) {
      if (result.message) onError(result.message);
      return;
    }
    await refreshAuthSession();
    await onSuccess();
  };

  const onGoogle = async (): Promise<void> => {
    setLoading('google');
    try {
      const result = await signInWithOAuth(
        'google',
        signupIntent,
        authLang,
      );
      await finish(result);
    } finally {
      setLoading(null);
    }
  };

  const onApple = async (): Promise<void> => {
    if (Platform.OS !== 'ios') {
      onError(
        isArabic
          ? 'تسجيل الدخول عبر Apple متاح على iOS فقط.'
          : 'Apple Sign In is only available on iOS.',
      );
      return;
    }
    setLoading('apple');
    try {
      const result = await signInWithApple(signupIntent, authLang);
      await finish(result);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <MasaButton
        disabled={busy}
        label={providerLabel('google', isArabic, loading === 'google')}
        onPress={() => void onGoogle()}
        variant="outline"
      />

      {Platform.OS === 'ios' ? (
        <MasaButton
          disabled={busy}
          label={providerLabel('apple', isArabic, loading === 'apple')}
          onPress={() => void onApple()}
          variant="outline"
        />
      ) : null}

      <Text style={styles.hint}>
        {isArabic
          ? 'يعتمد تسجيل الدخول عبر Apple وGoogle على اسمك وبريدك لدى المزوّد.'
          : 'Apple and Google sign-in use your provider name and email.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hint: {
    color: theme.colors.masaGray,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
