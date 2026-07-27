import type { InfoPageKey } from '../constants/infoPages';
import { navigationRef } from './navigationRef';
import type { AuthStackParams } from './types';

function navigateWhenReady(action: () => void): void {
  if (navigationRef.isReady()) {
    action();
    return;
  }
  const interval = setInterval(() => {
    if (navigationRef.isReady()) {
      clearInterval(interval);
      action();
    }
  }, 50);
  setTimeout(() => clearInterval(interval), 5000);
}

export function goHome(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('MainTabs', { screen: 'Home' });
  });
}

export function goDiscover(options?: { category?: string }): void {
  navigateWhenReady(() => {
    navigationRef.navigate('MainTabs', {
      screen: 'Discover',
      params: options?.category ? { category: options.category } : undefined,
    });
  });
}

export function goWishlist(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('MainTabs', { screen: 'Wishlist' });
  });
}

export function goCart(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('MainTabs', { screen: 'Cart' });
  });
}

export function goProfile(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('MainTabs', { screen: 'Profile' });
  });
}

export function goProduct(productId: string): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Product', { productId });
  });
}

export function goAuth(params?: AuthStackParams): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Auth', params);
  });
}

export function goTools(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Tools');
  });
}

export function goSupport(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Support');
  });
}

export function goNotifications(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Notifications');
  });
}

export function goAdvisor(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Advisor');
  });
}

export function goZakat(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Zakat');
  });
}

export function goSellGold(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('SellGold');
  });
}

export function goMarketPrices(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('MarketPrices');
  });
}

export function goSellerPlans(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('SellerPlans');
  });
}

export function goSellerApplication(params?: { view?: 'existing' }): void {
  navigateWhenReady(() => {
    navigationRef.navigate('SellerApplication', params);
  });
}

export function goSellerDashboard(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('SellerDashboard');
  });
}

export function goSellerApplicationSuccess(planId: string): void {
  navigateWhenReady(() => {
    navigationRef.navigate('SellerApplicationSuccess', { planId });
  });
}

export function goCheckout(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('Checkout');
  });
}

export function goPaymentSuccess(sessionId: string): void {
  navigateWhenReady(() => {
    navigationRef.navigate('PaymentSuccess', { sessionId });
  });
}

export function goPaymentCancel(): void {
  navigateWhenReady(() => {
    navigationRef.navigate('PaymentCancel');
  });
}

export function goInfo(page: { pageKey: InfoPageKey }): void {
  navigateWhenReady(() => {
    if (page.pageKey === 'marketPrices') {
      navigationRef.navigate('MarketPrices');
      return;
    }
    navigationRef.navigate('Info', { pageKey: page.pageKey });
  });
}

export function goDashboard(): void {
  goSellerDashboard();
}
