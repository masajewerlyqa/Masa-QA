import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { navigateToBecomeSeller } from '../../lib/sellerNavigation';
import { goHome } from '../../navigation/routes';
import {
  getSellerStoreForUser,
  type SellerDashboardStats,
  type SellerStoreSummary,
} from '../../services/sellerDashboardService';

export function SellerDashboardScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<SellerStoreSummary | null>(null);
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const result = await getSellerStoreForUser();
      if (!mounted) return;

      // A failed lookup is reported as an error rather than being shown as
      // "you have no store", which is what previously hid every failure.
      if (!result.ok) {
        setLoadError(result.error);
        setLoading(false);
        return;
      }

      setLoadError(null);
      setStore(result.store);
      // Stats come back with the store, so there is no second round trip.
      setStats(result.stats);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <SiteShell>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </SiteShell>
    );
  }

  if (loadError) {
    return (
      <SiteShell>
        <View style={styles.centered}>
          <MasaCard style={styles.card}>
            <Text style={[styles.title, { fontFamily: luxury }]}>
              {t('seller.overview.dashboard')}
            </Text>
            <Text style={textStyle(isArabic, 'body')}>{loadError}</Text>
            <MasaButton
              label={t('seller.overview.backHome')}
              onPress={() => goHome()}
              variant="outline"
            />
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  if (!store) {
    return (
      <SiteShell>
        <View style={styles.centered}>
          <MasaCard style={styles.card}>
            <Text style={[styles.title, { fontFamily: luxury }]}>
              {t('seller.overview.dashboard')}
            </Text>
            <Text style={textStyle(isArabic, 'body')}>
              {t('seller.overview.noStoreYet')}
            </Text>
            <MasaButton
              label={t('seller.overview.backHome')}
              onPress={() => goHome()}
              variant="outline"
            />
            <MasaButton
              label={isArabic ? 'متابعة طلب البائع' : 'Continue seller application'}
              onPress={() => void navigateToBecomeSeller()}
            />
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  const statCards = [
    {
      id: 'revenue',
      label: t('seller.overview.totalRevenue'),
      value: stats ? `${stats.totalRevenue.toLocaleString()} QAR` : '—',
      icon: 'cash-outline' as const,
    },
    {
      id: 'orders',
      label: t('seller.overview.totalOrders'),
      value: stats ? String(stats.totalOrders) : '—',
      icon: 'receipt-outline' as const,
    },
    {
      id: 'products',
      label: t('seller.overview.productsListed'),
      value: stats ? String(stats.productsListed) : '—',
      icon: 'cube-outline' as const,
    },
  ];

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { fontFamily: luxury }]}>
          {t('seller.overview.dashboardOverview')}
        </Text>
        <Text style={textStyle(isArabic, 'body')}>
          {t('seller.overview.welcomeBack').replace('{storeName}', store.name)}
        </Text>

        {statCards.map((item) => (
          <MasaCard key={item.id} style={styles.statCard}>
            <View style={styles.statRow}>
              <Ionicons color={theme.colors.primary} name={item.icon} size={20} />
              <Text style={textStyle(isArabic, 'body')}>{item.label}</Text>
              <Text style={[styles.statValue, { fontFamily: luxury }]}>{item.value}</Text>
            </View>
          </MasaCard>
        ))}

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('seller.overview.productInventory')}
          </Text>
          <Text style={textStyle(isArabic, 'body')}>
            {t('seller.overview.noProductsYet')}
          </Text>
        </MasaCard>

        <MasaButton label={t('seller.overview.backHome')} onPress={() => goHome()} variant="outline" />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: MOBILE_CONTENT_PADDING_X,
  },
  card: { gap: 12 },
  title: {
    color: theme.colors.primary,
    fontSize: 26,
    lineHeight: 34,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    marginBottom: 8,
  },
  statCard: { marginBottom: 0 },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 20,
    marginLeft: 'auto',
  },
});
