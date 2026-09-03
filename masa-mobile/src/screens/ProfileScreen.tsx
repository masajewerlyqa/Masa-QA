import { useFocusEffect } from '@react-navigation/native';
import { Heart, MapPin, Package } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useState } from 'react';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { MobileFooter } from '../components/MobileFooter';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import { navigateToBecomeSeller } from '../lib/sellerNavigation';
import {
  goAdminDashboard,
  goAuth,
  goOrders,
  goSellerDashboard,
  goSettings,
  goWishlist,
} from '../navigation/routes';
import { signOut } from '../services/authService';
import { getProfileSummary, ProfileSummary } from '../services/profileService';
import type { ProfileRole } from '../services/profileAuthService';

function roleLabel(role: ProfileRole | undefined, t: (key: string) => string): string {
  switch (role) {
    case 'admin':
      return t('account.accountPage.roleLabels.admin');
    case 'seller':
      return t('account.accountPage.roleLabels.seller');
    case 'pending_seller':
      return t('account.accountPage.roleLabels.pending_seller');
    case 'customer':
    default:
      return t('account.accountPage.roleLabels.customer');
  }
}

/** Matches web `/account` mobile layout: profile card + quick-link cards */
export function ProfileScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { t, isArabic } = useSettings();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const luxury = fontFamily(isArabic, 'luxury');

  // useFocusEffect (not useEffect) so returning from Settings after a save
  // shows the updated name/phone immediately -- this screen instance is
  // never remounted by a back-navigation, only re-focused.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (!user) setSummary(null);
      else getProfileSummary().then((data) => mounted && setSummary(data));
      return () => {
        mounted = false;
      };
    }, [user]),
  );

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!user ? (
          <MasaCard style={styles.guestCard}>
            <Text style={textStyle(isArabic, 'body')}>{t('auth.login.noAccount')}</Text>
            <MasaButton label={t('auth.register.signIn')} onPress={() => goAuth()} />
          </MasaCard>
        ) : (
          <>
            <MasaCard style={styles.mainCard}>
              <View style={styles.mainHeader}>
                <View style={styles.mainTitles}>
                  <Text style={[styles.mainTitle, { fontFamily: luxury }]}>
                    {t('account.accountPage.myAccount')}
                  </Text>
                  <Text style={textStyle(isArabic, 'body')}>
                    {t('account.accountPage.manageProfile')}
                  </Text>
                </View>
                <MasaButton
                  label={t('account.accountPage.settings')}
                  onPress={() => goSettings()}
                  variant="outline"
                />
              </View>
              <View style={styles.fieldGrid}>
                <ProfileField
                  isArabic={isArabic}
                  label={t('account.accountPage.name')}
                  value={summary?.fullName ?? '—'}
                />
                <ProfileField
                  isArabic={isArabic}
                  label={t('common.email')}
                  value={summary?.email ?? user.email ?? '—'}
                />
                <ProfileField
                  isArabic={isArabic}
                  label={t('account.accountPage.emailStatus')}
                  value={t('common.verified')}
                />
                <ProfileField
                  isArabic={isArabic}
                  label={t('account.accountPage.updates')}
                  value={t('account.accountPage.notSubscribed')}
                />
                <ProfileField
                  isArabic={isArabic}
                  label={t('common.phone')}
                  value={summary?.phone?.trim() ? summary.phone : '—'}
                />
                <ProfileField
                  isArabic={isArabic}
                  label={t('account.accountPage.role')}
                  value={roleLabel(summary?.role, t)}
                />
              </View>
              {/*
                Admins get the admin dashboard, not the seller one. Routing them
                to the seller dashboard sent every admin into "we could not link
                a store to your account" -- correct behaviour from the API (an
                admin has no store), but a dead end in the UI.
              */}
              {summary?.role === 'admin' ? (
                <MasaButton
                  label={t('admin.overview.platformOverview')}
                  onPress={() => goAdminDashboard()}
                />
              ) : summary?.role === 'seller' ? (
                <MasaButton
                  label={t('seller.overview.dashboard')}
                  onPress={() => goSellerDashboard()}
                />
              ) : summary?.role === 'pending_seller' ? (
                <MasaButton
                  label={isArabic ? 'متابعة طلب البائع' : 'Continue seller application'}
                  onPress={() => void navigateToBecomeSeller()}
                />
              ) : (
                <MasaButton
                  label={t('footer.supportLinks.becomeSeller')}
                  onPress={() => void navigateToBecomeSeller()}
                  variant="outline"
                />
              )}
              <MasaButton
                label={isArabic ? 'تسجيل الخروج' : 'Sign out'}
                onPress={() => signOut()}
                variant="outline"
              />
            </MasaCard>

            <SidebarCard
              buttonLabel={t('account.accountPage.viewOrderHistory')}
              description={t('account.accountPage.ordersDesc')}
              icon={Package}
              isArabic={isArabic}
              onPress={() => goOrders()}
              title={t('account.accountPage.orders')}
            />
            <SidebarCard
              buttonLabel={t('account.accountPage.goToWishlist')}
              description={t('account.accountPage.wishlistDesc')}
              icon={Heart}
              isArabic={isArabic}
              onPress={() => goWishlist()}
              title={t('mobileNav.wishlist')}
            />
            <SidebarCard
              description={
                summary?.ordersCount
                  ? t('account.accountPage.savedAddressDesc')
                  : t('account.accountPage.noAddressYet')
              }
              icon={MapPin}
              isArabic={isArabic}
              title={t('account.accountPage.savedAddresses')}
            />
          </>
        )}
        <MobileFooter />
      </ScrollView>
    </SiteShell>
  );
}

function ProfileField({
  label,
  value,
  isArabic,
}: {
  label: string;
  value: string;
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={textStyle(isArabic, 'caption')}>{label}</Text>
      <Text style={[textStyle(isArabic, 'bodySm'), { color: theme.colors.masaDark }]}>{value}</Text>
    </View>
  );
}

function SidebarCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onPress,
  isArabic,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  buttonLabel?: string;
  onPress?: () => void;
  isArabic: boolean;
}): React.JSX.Element {
  const luxury = fontFamily(isArabic, 'luxury');
  return (
    <MasaCard style={styles.sideCard}>
      <View style={styles.sideHeader}>
        <Icon color={theme.colors.primary} size={16} />
        <Text style={[styles.sideTitle, { fontFamily: luxury }]}>{title}</Text>
      </View>
      <Text style={textStyle(isArabic, 'body')}>{description}</Text>
      {buttonLabel && onPress ? (
        <MasaButton label={buttonLabel} onPress={onPress} style={styles.sideBtn} variant="outline" />
      ) : null}
    </MasaCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 0,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
  },
  guestCard: { gap: 12 },
  mainCard: { gap: 16 },
  mainHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  mainTitles: { flex: 1, gap: 4 },
  mainTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 32,
  },
  fieldGrid: {
    gap: 16,
  },
  field: { gap: 4 },
  sideCard: { gap: 12 },
  sideHeader: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  sideTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    lineHeight: 22,
  },
  sideBtn: { alignSelf: 'flex-start' },
});
