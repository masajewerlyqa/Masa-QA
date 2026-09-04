import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminApplicationDetailScreen } from '../screens/admin/AdminApplicationDetailScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminListScreen } from '../screens/admin/AdminListScreen';
import { AdminPromoScreen } from '../screens/admin/AdminPromoScreen';
import { AdminReviewsScreen } from '../screens/admin/AdminReviewsScreen';
import { AdvisorScreen } from '../screens/AdvisorScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { SellerApplicationScreen } from '../screens/seller/SellerApplicationScreen';
import { SellerApplicationSuccessScreen } from '../screens/seller/SellerApplicationSuccessScreen';
import { SellerAvailabilityScreen } from '../screens/seller/SellerAvailabilityScreen';
import { SellerDashboardScreen } from '../screens/seller/SellerDashboardScreen';
import { SellerOrderDetailScreen } from '../screens/seller/SellerOrderDetailScreen';
import { SellerPlansScreen } from '../screens/seller/SellerPlansScreen';
import { SellerPoliciesScreen } from '../screens/seller/SellerPoliciesScreen';
import { SellerProductFormScreen } from '../screens/seller/SellerProductFormScreen';
import { SellerReviewsScreen } from '../screens/seller/SellerReviewsScreen';
import { SellerSettingsScreen } from '../screens/seller/SellerSettingsScreen';
import { InfoPageScreen } from '../screens/InfoPageScreen';
import { MarketPricesScreen } from '../screens/MarketPricesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { SellGoldCalculatorScreen } from '../screens/SellGoldCalculatorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StoreProfileScreen } from '../screens/StoreProfileScreen';
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
      <Stack.Screen component={OrdersScreen} name="Orders" />
      <Stack.Screen component={OrderDetailScreen} name="OrderDetail" />
      <Stack.Screen component={SettingsScreen} name="Settings" />
      <Stack.Screen component={AdminDashboardScreen} name="AdminDashboard" />
      <Stack.Screen component={AdminListScreen} name="AdminList" />
      <Stack.Screen component={SellerProductFormScreen} name="SellerProductForm" />
      <Stack.Screen component={SellerOrderDetailScreen} name="SellerOrderDetail" />
      <Stack.Screen component={SellerSettingsScreen} name="SellerSettings" />
      <Stack.Screen component={SellerAvailabilityScreen} name="SellerAvailability" />
      <Stack.Screen component={SellerPoliciesScreen} name="SellerPolicies" />
      <Stack.Screen component={SellerReviewsScreen} name="SellerReviews" />
      <Stack.Screen component={AdminApplicationDetailScreen} name="AdminApplicationDetail" />
      <Stack.Screen component={AdminReviewsScreen} name="AdminReviews" />
      <Stack.Screen component={AdminPromoScreen} name="AdminPromo" />
      <Stack.Screen component={StoreProfileScreen} name="StoreProfile" />
    </Stack.Navigator>
  );
}
