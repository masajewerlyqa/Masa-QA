import { navigationRef } from '../navigation/navigationRef';
import {
  goAuth,
  goHome,
  goProfile,
  goSellerApplication,
  goSellerDashboard,
  goSellerPlans,
} from '../navigation/routes';
import type { RegistrationIntent } from '../services/authService';
import { resolveSellerOnboardingStep } from '../services/sellerApplicationService';
import type { ProfileRole } from '../services/profileAuthService';

function runWhenReady(action: () => void): void {
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

export function goSellerApplicationSuccess(planId: string): void {
  runWhenReady(() => navigationRef.navigate('SellerApplicationSuccess', { planId }));
}

/** Entry point for “Become a seller” — never opens the marketing website. */
export async function navigateToBecomeSeller(): Promise<void> {
  const step = await resolveSellerOnboardingStep();
  runWhenReady(() => {
    switch (step) {
      case 'auth':
        navigationRef.navigate('SellerPlans');
        break;
      case 'plans':
        navigationRef.navigate('SellerPlans');
        break;
      case 'application':
        navigationRef.navigate('SellerApplication');
        break;
      case 'existing':
        navigationRef.navigate('SellerApplication', { view: 'existing' });
        break;
      case 'dashboard':
        navigationRef.navigate('SellerDashboard');
        break;
      default:
        navigationRef.navigate('SellerPlans');
    }
  });
}

/** Post-login routing based on profile role (native only — never opens website). */
export function navigateAfterAuth(role: ProfileRole, signupIntent?: RegistrationIntent): void {
  runWhenReady(() => {
    if (role === 'seller' || role === 'admin') {
      navigationRef.navigate('SellerDashboard');
      return;
    }

    if (role === 'pending_seller' || signupIntent === 'seller') {
      void navigateToBecomeSeller();
      return;
    }

    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
    goProfile();
  });
}

export function goSellerApplicationExisting(): void {
  runWhenReady(() => navigationRef.navigate('SellerApplication', { view: 'existing' }));
}

export {
  goHome,
  goAuth,
  goProfile,
  goSellerPlans,
  goSellerApplication,
  goSellerDashboard,
};
