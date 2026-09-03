import type { NavigatorScreenParams } from '@react-navigation/native';

import type { InfoPageKey } from '../constants/infoPages';

export type MainTabParamList = {
  Home: undefined;
  Discover: { category?: string } | undefined;
  Wishlist: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type AuthStackParams = {
  mode?: 'signin' | 'signup';
  intent?: 'buyer' | 'seller';
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: AuthStackParams | undefined;
  Product: { productId: string };
  Tools: undefined;
  Advisor: undefined;
  Zakat: undefined;
  SellGold: undefined;
  Support: undefined;
  Notifications: undefined;
  SellerPlans: undefined;
  SellerApplication: { view?: 'existing' } | undefined;
  SellerApplicationSuccess: { planId: string };
  SellerDashboard: undefined;
  Info: { pageKey: InfoPageKey };
  MarketPrices: undefined;
  Checkout: undefined;
  PaymentSuccess: { orderId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  Settings: undefined;
  AdminDashboard: undefined;
  AdminList: { section: 'orders' | 'products' | 'stores' | 'sellers' };
  SellerProductForm: { productId?: string };
  SellerOrderDetail: { orderId: string };
  SellerSettings: undefined;
  SellerAvailability: undefined;
  SellerPolicies: undefined;
  SellerReviews: undefined;
  AdminApplicationDetail: { applicationId: string };
  AdminReviews: undefined;
  AdminPromo: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
