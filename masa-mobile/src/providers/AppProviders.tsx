import type { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider } from '../context/SettingsContext';
import { AuthBootstrap } from './AuthBootstrap';
import { AuthSync } from './AuthSync';
import { CheckoutLinking } from './CheckoutLinking';
import { OAuthLinking } from './OAuthLinking';

export function AppProviders({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthSync>
          <SettingsProvider>
            <AuthBootstrap>
              <OAuthLinking>
                <CheckoutLinking>{children}</CheckoutLinking>
              </OAuthLinking>
            </AuthBootstrap>
          </SettingsProvider>
        </AuthSync>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
