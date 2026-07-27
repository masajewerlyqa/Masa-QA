import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdvisorScreen } from '../screens/AdvisorScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { PaymentCancelScreen } from '../screens/PaymentCancelScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { SellerApplicationScreen } from '../screens/seller/SellerApplicationScreen';
import { SellerApplicationSuccessScreen } from '../screens/seller/SellerApplicationSuccessScreen';
import { SellerDashboardScreen } from '../screens/seller/SellerDashboardScreen';
import { SellerPlansScreen } from '../screens/seller/SellerPlansScreen';
import { InfoPageScreen } from '../screens/InfoPageScreen';
import { MarketPricesScreen } from '../screens/MarketPricesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { SellGoldCalculatorScreen } from '../screens/SellGoldCalculatorScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { ZakatCalculatorScreen } from '../screens/ZakatCalculatorScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={MainTabs} name="MainTabs" />
      <Stack.Screen component={AuthScreen} name="Auth" />
      <Stack.Screen component={ProductDetailsScreen} name="Product" />
      <Stack.Screen component={ToolsScreen} name="Tools" />
      <Stack.Screen component={AdvisorScreen} name="Advisor" />
      <Stack.Screen component={ZakatCalculatorScreen} name="Zakat" />
      <Stack.Screen component={SellGoldCalculatorScreen} name="SellGold" />
      <Stack.Screen component={SupportScreen} name="Support" />
      <Stack.Screen component={NotificationsScreen} name="Notifications" />
      <Stack.Screen component={SellerPlansScreen} name="SellerPlans" />
      <Stack.Screen component={SellerApplicationScreen} name="SellerApplication" />
      <Stack.Screen component={SellerApplicationSuccessScreen} name="SellerApplicationSuccess" />
      <Stack.Screen component={SellerDashboardScreen} name="SellerDashboard" />
      <Stack.Screen component={InfoPageScreen} name="Info" />
      <Stack.Screen component={MarketPricesScreen} name="MarketPrices" />
      <Stack.Screen component={CheckoutScreen} name="Checkout" />
      <Stack.Screen component={PaymentSuccessScreen} name="PaymentSuccess" />
      <Stack.Screen component={PaymentCancelScreen} name="PaymentCancel" />
    </Stack.Navigator>
  );
}
