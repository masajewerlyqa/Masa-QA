import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import './global.css';

import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { theme } from './src/constants/theme';
import { useAppFonts } from './src/hooks/useAppFonts';
import { getOAuthRedirectUri } from './src/lib/oauthRedirect';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProviders } from './src/providers/AppProviders';

WebBrowser.maybeCompleteAuthSession();

export default function App(): React.JSX.Element {
  const scheme = useColorScheme();
  const { ready } = useAppFonts();

  useEffect(() => {
    if (__DEV__) {
      const redirect = getOAuthRedirectUri();
      console.log('[Auth] OAuth redirectTo (add in Supabase → Redirect URLs):', redirect);
      if (redirect.startsWith('http')) {
        console.warn('[Auth] WARNING: redirect URI is HTTP — OAuth may open the website. Use a dev build with scheme "masa".');
      }
    }
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </AppProviders>
    </ErrorBoundary>
  );
}
