import { useCallback, useEffect, useMemo } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { MobileFooter } from '../components/MobileFooter';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useAuth } from '../hooks/useAuth';
import { goAuth, goCheckout, goDiscover } from '../navigation/routes';
import { useSettings } from '../context/SettingsContext';
import { useCartStore } from '../stores/cartStore';
import { formatCurrencyFromUsd, parseUsdPrice } from '../utils/currency';

/** Matches web `/cart` mobile — title, item cards, order summary below */
export function CartScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { currency, language, t, isArabic } = useSettings();
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const refresh = useCartStore((s) => s.refresh);
  const luxury = fontFamily(isArabic, 'luxury');

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.product.priceUsd ?? parseUsdPrice(item.product.price)) * Number(item.quantity ?? 1),
    0,
  );

  const onQtyChange = useCallback(
    async (productId: string, nextQty: number) => {
      const result = await updateQuantity(productId, nextQty);
      if (!result.ok && result.error) Alert.alert(result.error);
    },
    [updateQuantity],
  );

  const renderCartItem = useCallback(
    ({ item }: { item: (typeof items)[number] }) => (
      <MasaCard style={styles.itemCard}>
        <View style={styles.itemRow}>
          <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />
          <View style={styles.itemBody}>
            <View style={styles.itemTop}>
              <View style={styles.itemTitles}>
                <Text style={[textStyle(isArabic, 'bodySm'), styles.itemTitle]}>
                  {item.product.name}
                </Text>
                <Text style={textStyle(isArabic, 'caption')}>{item.product.category}</Text>
              </View>
              <Pressable onPress={() => void removeItem(item.productId)}>
                <Trash2 color="#dc2626" size={18} />
              </Pressable>
            </View>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => void onQtyChange(item.productId, item.quantity - 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyVal}>{item.quantity}</Text>
              <Pressable
                onPress={() => void onQtyChange(item.productId, item.quantity + 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
          <Text style={[styles.itemPrice, { fontFamily: luxury }]}>
            {formatCurrencyFromUsd(
              (item.product.priceUsd ?? parseUsdPrice(item.product.price)) * item.quantity,
              currency,
              language,
            )}
          </Text>
        </View>
      </MasaCard>
    ),
    [isArabic, luxury, currency, language, removeItem, onQtyChange],
  );

  const listHeader = useMemo(
    () => (
      <>
        <Text style={[styles.pageTitle, { fontFamily: luxury }]}>{t('cart.title')}</Text>

        {!user ? (
          <MasaCard style={styles.emptyCard}>
            <Text style={[textStyle(isArabic, 'body'), styles.emptyText]}>{t('cart.empty')}</Text>
            <MasaButton label={t('auth.register.signIn')} onPress={() => goAuth()} variant="outline" />
          </MasaCard>
        ) : null}

        {user && isLoading && items.length === 0 ? (
          <Text style={textStyle(isArabic, 'body')}>{t('common.loading')}</Text>
        ) : null}

        {user && items.length === 0 && !isLoading ? (
          <MasaCard style={styles.emptyCard}>
            <Text style={[textStyle(isArabic, 'body'), styles.emptyText]}>{t('cart.empty')}</Text>
            <MasaButton
              label={t('cart.continueShopping')}
              onPress={() => goDiscover()}
              variant="outline"
            />
          </MasaCard>
        ) : null}
      </>
    ),
    [user, isLoading, items.length, luxury, t, isArabic],
  );

  const listFooter = useMemo(
    () => (
      <>
        {user && items.length > 0 ? (
          <MasaCard style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { fontFamily: luxury }]}>
              {t('checkout.orderSummary')}
            </Text>
            <View style={styles.summaryLine}>
              <Text style={textStyle(isArabic, 'body')}>{t('checkout.subtotal')}</Text>
              <Text style={textStyle(isArabic, 'bodySm')}>
                {formatCurrencyFromUsd(subtotal, currency, language)}
              </Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={textStyle(isArabic, 'body')}>{t('checkout.shipping')}</Text>
              <Text style={textStyle(isArabic, 'body')}>{t('checkout.free')}</Text>
            </View>
            <View style={[styles.summaryLine, styles.totalLine]}>
              <Text style={[textStyle(isArabic, 'bodySm'), styles.totalLabel]}>{t('checkout.total')}</Text>
              <Text style={[styles.totalValue, { fontFamily: luxury }]}>
                {formatCurrencyFromUsd(subtotal, currency, language)}
              </Text>
            </View>
            <MasaButton label={t('cart.proceedToCheckout')} onPress={() => goCheckout()} />
          </MasaCard>
        ) : null}
        <MobileFooter />
      </>
    ),
    [user, items.length, subtotal, currency, language, luxury, t, isArabic],
  );

  return (
    <SiteShell>
      <FlatList
        contentContainerStyle={styles.content}
        data={user ? items : []}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={(item) => item.id}
        ListFooterComponent={listFooter}
        ListFooterComponentStyle={user ? styles.footerSpacing : undefined}
        ListHeaderComponent={listHeader}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
      />
    </SiteShell>
  );
}

function ItemSeparator(): React.JSX.Element {
  return <View style={styles.itemSeparator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
  },
  pageTitle: {
    color: theme.colors.primary,
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 32,
  },
  itemCard: { padding: 16 },
  itemRow: { flexDirection: 'row', gap: 12 },
  itemImage: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: theme.radius.lg,
    height: 96,
    width: 96,
  },
  itemBody: { flex: 1, gap: 8 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  itemTitles: { flex: 1, gap: 4, paddingRight: 8 },
  itemTitle: { color: theme.colors.masaDark },
  qtyRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  qtyBtn: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  qtyBtnText: { color: theme.colors.primary, fontWeight: '700' },
  qtyVal: { fontWeight: '600', minWidth: 20, textAlign: 'center' },
  itemPrice: {
    color: theme.colors.primary,
    fontSize: 16,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  summaryCard: { gap: 12 },
  summaryTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    marginBottom: 4,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLine: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: { color: theme.colors.primary, fontWeight: '700' },
  totalValue: { color: theme.colors.primary, fontSize: 18 },
  emptyCard: {
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  emptyText: { textAlign: 'center' },
  itemSeparator: { height: 16 },
  footerSpacing: { marginTop: 32 },
});
