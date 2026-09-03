import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { sitePostJson } from '../api/siteApi';
import { theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';

/** Form only — title and hint are rendered by `MobileFooter` (matches web `FooterNewsletter`). */
export function FooterNewsletter(): React.JSX.Element {
  const { t, isArabic, language } = useSettings();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState(t('newsletter.invalidEmail'));

  async function handleSubmit(): Promise<void> {
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await sitePostJson<{ ok?: boolean; error?: string }>('/api/newsletter/subscribe', {
        email,
        source: 'footer',
        language,
      });
      if (!res.ok) {
        setErrorMessage(res.error || t('newsletter.failed'));
        setStatus('error');
        return;
      }
      setStatus('success');
      setEmail('');
    } catch {
      setErrorMessage(t('newsletter.failed'));
      setStatus('error');
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder={t('newsletter.emailPlaceholder')}
          placeholderTextColor="rgba(231,216,195,0.7)"
          style={[textStyle(isArabic, 'bodySm'), styles.input]}
          value={email}
        />
        <Pressable onPress={() => void handleSubmit()} style={styles.submit}>
          <Text style={styles.submitText}>
            {status === 'loading' ? '…' : status === 'success' ? t('common.done') : t('newsletter.subscribe')}
          </Text>
        </Pressable>
      </View>
      {status === 'error' ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    borderWidth: 1,
    color: theme.colors.white,
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submit: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#fecaca',
    fontSize: 12,
    marginTop: 8,
  },
});
