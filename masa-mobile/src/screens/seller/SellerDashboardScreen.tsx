import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { navigateToBecomeSeller } from '../../lib/sellerNavigation';
import { goHome } from '../../navigation/routes';
import {
  getSellerProducts,
  getSellerRecentOrders,
  getSellerStoreForUser,
  type SellerDashboardStats,
  type SellerOrderRow,
  type SellerProductRow,
  type SellerStoreSummary,
} from '../../services/sellerDashboardService';
import { formatCurrencyFromUsd } from '../../utils/currency';

type DashboardTab = 'products' | 'orders';

export function SellerDashboardScreen(): React.JSX.Element {
  const { t, isArabic, currency, language } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<SellerStoreSummary | null>(null);
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('products');
  const [products, setProducts] = useState<SellerProductRow[]>([]);
  const [orders, setOrders] = useState<SellerOrderRow[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

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

      if (result.store) {
        const [productRows, orderRows] = await Promise.all([
          getSellerProducts(result.store.id),
          getSellerRecentOrders(result.store.id),
        ]);
        if (!mounted) return;
        setProducts(productRows);
        setOrders(orderRows);
        setListsLoading(false);
      } else {
        setListsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

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

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('products')}
            style={[styles.tabBtn, activeTab === 'products' ? styles.tabBtnActive : null]}
          >
            <Text style={[styles.tabText, activeTab === 'products' ? styles.tabTextActive : null]}>
              {t('seller.overview.productsTab')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('orders')}
            style={[styles.tabBtn, activeTab === 'orders' ? styles.tabBtnActive : null]}
          >
            <Text style={[styles.tabText, activeTab === 'orders' ? styles.tabTextActive : null]}>
              {t('seller.overview.recentOrdersTab')}
            </Text>
          </Pressable>
        </View>

        {listsLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.listLoading} />
        ) : activeTab === 'products' ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {t('seller.overview.productInventory')}
            </Text>
            {products.length === 0 ? (
              <Text style={textStyle(isArabic, 'body')}>{t('seller.overview.noProductsYet')}</Text>
            ) : (
              products.map((p) => (
                <View key={p.id} style={styles.rowItem}>
                  <View style={styles.rowMain}>
                    <Text style={textStyle(isArabic, 'bodySm')} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={textStyle(isArabic, 'caption')}>
                      {t('seller.overview.stock')}: {p.stockQuantity}
                    </Text>
                  </View>
                  <View style={styles.rowEnd}>
                    <Text style={[textStyle(isArabic, 'bodySm'), styles.rowPrice]}>
                      {formatCurrencyFromUsd(p.price, currency, language)}
                    </Text>
                    <OrderStatusBadge status={p.status} />
                  </View>
                </View>
              ))
            )}
          </MasaCard>
        ) : (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {t('seller.overview.recentOrdersTab')}
            </Text>
            {orders.length === 0 ? (
              <Text style={textStyle(isArabic, 'body')}>{t('seller.overview.noOrdersYet')}</Text>
            ) : (
              orders.map((o) => (
                <View key={o.id} style={styles.rowItem}>
                  <View style={styles.rowMain}>
                    <Text style={textStyle(isArabic, 'bodySm')} numberOfLines={1}>
                      {o.customerName}
                    </Text>
                    <Text style={textStyle(isArabic, 'caption')}>{formatDate(o.createdAt)}</Text>
                  </View>
                  <View style={styles.rowEnd}>
                    <Text style={[textStyle(isArabic, 'bodySm'), styles.rowPrice]}>
                      {formatCurrencyFromUsd(o.total, currency, language)}
                    </Text>
                    <OrderStatusBadge status={o.status} />
                  </View>
                </View>
              ))
            )}
          </MasaCard>
        )}

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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  tabBtnActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.masaGray,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  listLoading: { marginVertical: 24 },
  rowItem: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowMain: { flex: 1, gap: 2, paddingRight: 8 },
  rowEnd: { alignItems: 'flex-end', gap: 4 },
  rowPrice: { color: theme.colors.masaDark, fontWeight: '600' },
});
