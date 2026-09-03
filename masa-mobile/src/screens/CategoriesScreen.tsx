import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CategoryChip } from '../components/CategoryChip';
import { MobileFooter } from '../components/MobileFooter';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X } from '../constants/layout';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeletonGrid } from '../components/ui/ProductSkeleton';
import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { goProduct } from '../navigation/routes';
import type { MainTabParamList } from '../navigation/types';
import {
  getDiscoverProducts,
  getProductCategories,
  searchProducts,
} from '../services/productService';
import { Category, Product } from '../types/catalog';
import { parseUsdPrice } from '../utils/currency';

const PAGE_SIZE = 12;
const sortOrder = [
  'Featured',
  'Price: Low to High',
  'Price: High to Low',
  'Newest First',
] as const;

type SortKey = (typeof sortOrder)[number];

export function CategoriesScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<MainTabParamList, 'Discover'>>();
  const { searchQuery, setSearchQuery, currency, t, isArabic } = useSettings();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('Featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const category = route.params?.category;
    if (category) {
      setActiveCategory(category);
    }
  }, [route.params?.category]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getProductCategories(),
      searchQuery.trim() ? searchProducts(searchQuery, 80) : getDiscoverProducts(80),
    ]).then(([categoryRows, productRows]) => {
      if (!mounted) return;
      setCategories([{ id: 'all', name: t('marketplace.all') }, ...categoryRows]);
      setProducts(productRows);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [searchQuery, t]);

  const filteredProducts = useMemo(() => {
    const selected = categories.find((item) => item.id === activeCategory);
    let list = [...products];

    if (activeCategory !== 'all' && selected) {
      list = list.filter((item) => item.category === selected.name);
    }
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.description?.toLowerCase().includes(query) ?? false),
      );
    }
    if (onSaleOnly) {
      list = list.filter((item) => Boolean(item.discountLabel));
    }
    if (inStockOnly) {
      list = list.filter((item) => item.inStock !== false);
    }

    const min = parseUsdPrice(minPrice);
    const max = parseUsdPrice(maxPrice);
    if (min > 0) {
      list = list.filter((item) => (item.priceUsd ?? parseUsdPrice(item.price)) >= min);
    }
    if (max > 0) {
      list = list.filter((item) => (item.priceUsd ?? parseUsdPrice(item.price)) <= max);
    }

    if (sortBy === 'Price: Low to High') {
      list.sort(
        (a, b) =>
          (a.priceUsd ?? parseUsdPrice(a.price)) - (b.priceUsd ?? parseUsdPrice(b.price)),
      );
    } else if (sortBy === 'Price: High to Low') {
      list.sort(
        (a, b) =>
          (b.priceUsd ?? parseUsdPrice(b.price)) - (a.priceUsd ?? parseUsdPrice(a.price)),
      );
    } else if (sortBy === 'Newest First') {
      list = [...list].reverse();
    }

    return list;
  }, [
    activeCategory,
    categories,
    inStockOnly,
    maxPrice,
    minPrice,
    onSaleOnly,
    products,
    searchQuery,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, onSaleOnly, inStockOnly, minPrice, maxPrice, sortBy, searchQuery]);

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
        <ProductCard onPress={() => goProduct(item.id)} product={item} />
      </View>
    ),
    [viewMode],
  );

  const listHeader = (
    <View>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{t('marketplace.discover')}</Text>
        <Text style={styles.subtitle}>{t('marketplace.discoverSubtitle')}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons color={theme.colors.masaGray} name="search-outline" size={16} />
        <TextInput
          onChangeText={setSearchQuery}
          placeholder={t('discoverSearch')}
          placeholderTextColor={theme.colors.masaGray}
          style={styles.searchInput}
          value={searchQuery}
        />
      </View>

      <View style={styles.toolbar}>
        <Pressable onPress={() => setIsFilterOpen(true)} style={styles.toolButton}>
          <Ionicons color={theme.colors.primary} name="options-outline" size={16} />
          <Text style={styles.toolText}>{t('filters')}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const idx = sortOrder.indexOf(sortBy);
            setSortBy(sortOrder[(idx + 1) % sortOrder.length]);
          }}
          style={styles.toolButton}
        >
          <Ionicons color={theme.colors.primary} name="swap-vertical-outline" size={16} />
          <Text numberOfLines={1} style={styles.toolText}>
            {t('sortBy')}: {sortBy}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
          style={styles.iconTool}
        >
          <Ionicons
            color={theme.colors.primary}
            name={viewMode === 'grid' ? 'grid-outline' : 'list-outline'}
            size={18}
          />
        </Pressable>
      </View>

      <Text style={styles.resultCount}>
        {isArabic
          ? `${filteredProducts.length} ${t('marketplace.product')}`
          : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
      </Text>
      {loading ? <ProductSkeletonGrid count={6} /> : null}
    </View>
  );

  const listFooter = (
    <>
      {!loading && filteredProducts.length > 0 ? (
        <View style={styles.pagination}>
          <Pressable disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
            <Text style={[styles.pageText, page <= 1 ? styles.pageDisabled : null]}>
              {t('marketplace.previous')}
            </Text>
          </Pressable>
          <Text style={[styles.pageText, styles.pageCurrent]}>{page}</Text>
          <Pressable
            disabled={page >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={[styles.pageText, page >= totalPages ? styles.pageDisabled : null]}>
              {t('marketplace.next')}
            </Text>
          </Pressable>
        </View>
      ) : null}
      <MobileFooter />
    </>
  );

  return (
    <SiteShell>
      <FlatList
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={styles.content}
        data={loading ? [] : pagedProducts}
        initialNumToRender={8}
        key={viewMode}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>{t('marketplace.noMatchesFilters')}</Text>
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setOnSaleOnly(false);
                  setInStockOnly(false);
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                <Text style={styles.emptyAction}>{t('marketplace.clearAll')}</Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={listFooter}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={10}
        numColumns={viewMode === 'grid' ? 2 : 1}
        removeClippedSubviews
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        windowSize={5}
      />

      <Modal animationType="slide" transparent visible={isFilterOpen}>
        <Pressable onPress={() => setIsFilterOpen(false)} style={styles.modalBackdrop}>
          <Pressable style={styles.drawer}>
            <Text style={styles.drawerTitle}>{t('filters')}</Text>

            <Text style={styles.filterLabel}>{t('marketplace.offers')}</Text>
            <Pressable
              onPress={() => setOnSaleOnly((prev) => !prev)}
              style={[styles.filterToggle, onSaleOnly ? styles.filterToggleActive : null]}
            >
              <Text
                style={[
                  styles.filterToggleText,
                  onSaleOnly ? styles.filterToggleTextActive : null,
                ]}
              >
                {t('marketplace.onSale')}
              </Text>
            </Pressable>

            <Text style={styles.filterLabel}>{t('product.availability')}</Text>
            <Pressable
              onPress={() => setInStockOnly((prev) => !prev)}
              style={[styles.filterToggle, inStockOnly ? styles.filterToggleActive : null]}
            >
              <Text
                style={[
                  styles.filterToggleText,
                  inStockOnly ? styles.filterToggleTextActive : null,
                ]}
              >
                {t('product.inStock')}
              </Text>
            </Pressable>

            <Text style={styles.filterLabel}>
              {t('marketplace.priceRange')} ({currency})
            </Text>
            <View style={styles.priceRow}>
              <TextInput
                keyboardType="numeric"
                onChangeText={setMinPrice}
                placeholder={t('marketplace.priceMinShort')}
                placeholderTextColor={theme.colors.masaGray}
                style={styles.priceInput}
                value={minPrice}
              />
              <Text style={styles.priceDash}>—</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={setMaxPrice}
                placeholder={t('marketplace.priceMaxShort')}
                placeholderTextColor={theme.colors.masaGray}
                style={styles.priceInput}
                value={maxPrice}
              />
            </View>

            <Text style={styles.filterLabel}>{t('marketplace.category')}</Text>
            <FlatList
              contentContainerStyle={styles.chipsWrap}
              data={categories}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoryChip
                  isActive={item.id === activeCategory}
                  label={item.name}
                  onPress={() => setActiveCategory(item.id)}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />

            <View style={styles.drawerActions}>
              <Pressable
                onPress={() => {
                  setActiveCategory('all');
                  setOnSaleOnly(false);
                  setInStockOnly(false);
                  setMinPrice('');
                  setMaxPrice('');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearAction}>{t('marketplace.clearAll')}</Text>
              </Pressable>
              <Pressable onPress={() => setIsFilterOpen(false)} style={styles.showAction}>
                <Text style={styles.showActionText}>{t('marketplace.showResults')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
  },
  headerBlock: {
    paddingTop: theme.spacing.xl,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.typography.luxury,
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    color: theme.colors.masaGray,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.masaLight,
    borderColor: 'rgba(83,28,36,0.2)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: 14,
    paddingLeft: 8,
    paddingVertical: 12,
  },
  toolbar: {
    alignItems: 'center',
    borderBottomColor: 'rgba(83,28,36,0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingBottom: 12,
  },
  toolButton: {
    alignItems: 'center',
    borderColor: 'rgba(83,28,36,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    maxWidth: '42%',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toolText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  iconTool: {
    alignItems: 'center',
    borderColor: 'rgba(83,28,36,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginLeft: 'auto',
    padding: 8,
  },
  resultCount: {
    color: theme.colors.masaGray,
    fontSize: 12,
    marginTop: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
  },
  gridItem: {
    width: '48.5%',
  },
  listItem: {
    marginTop: 12,
    width: '100%',
  },
  emptyWrap: {
    alignItems: 'center',
    borderColor: 'rgba(83,28,36,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    padding: 24,
  },
  emptyTitle: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyAction: {
    color: theme.colors.primary,
    marginTop: 8,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 8,
  },
  pageText: {
    color: theme.colors.masaGray,
    fontSize: 12,
  },
  pageCurrent: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  pageDisabled: {
    opacity: 0.4,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.layout.screenPaddingX,
    paddingBottom: 24,
  },
  drawerTitle: {
    color: theme.colors.primary,
    fontFamily: theme.typography.luxury,
    fontSize: 24,
  },
  filterLabel: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },
  filterToggle: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.masaLight,
    borderColor: 'rgba(83,28,36,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterToggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterToggleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterToggleTextActive: {
    color: theme.colors.white,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  priceInput: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceDash: {
    color: theme.colors.masaGray,
  },
  chipsWrap: {
    marginTop: 10,
    paddingRight: 16,
  },
  drawerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  clearAction: {
    color: theme.colors.masaGray,
    fontSize: 14,
    fontWeight: '600',
  },
  showAction: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  showActionText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
