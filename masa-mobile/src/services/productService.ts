import { Category, Product } from '../types/catalog';
import { supabase } from './supabase';

export const PRODUCT_SELECT = `
  id,
  store_id,
  name,
  description,
  price,
  compare_at_price,
  category,
  metal_type,
  stock_quantity,
  created_at,
  discount_type,
  discount_value,
  discount_active,
  stores!inner(name, status),
  product_images(url, sort_order)
`;

export type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  metal_type: string | null;
  stock_quantity: number | null;
  created_at: string;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  discount_active: boolean | null;
  stores: { name: string; status: string }[] | { name: string; status: string } | null;
  product_images: { url: string; sort_order: number }[] | null;
};

function formatUsd(value: number): string {
  return `$${Math.round(value)}`;
}

export function mapProduct(row: ProductRow): Product {
  const images = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const imageUrl =
    images[0]?.url ??
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';
  const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
  const basePrice = Number(row.price ?? 0);
  const stock = Number(row.stock_quantity ?? 0);

  let finalPrice = basePrice;
  let originalPrice: string | undefined;
  let discountLabel: string | undefined;

  if (
    row.discount_active &&
    row.discount_type &&
    typeof row.discount_value === 'number' &&
    row.discount_value > 0
  ) {
    if (row.discount_type === 'percentage') {
      finalPrice = basePrice * (1 - row.discount_value / 100);
      discountLabel = `-${Math.round(row.discount_value)}%`;
    } else {
      finalPrice = Math.max(0, basePrice - row.discount_value);
      discountLabel = `-$${Math.round(row.discount_value)}`;
    }
    originalPrice = formatUsd(basePrice);
  } else if (typeof row.compare_at_price === 'number' && row.compare_at_price > basePrice) {
    const pct = Math.round(((row.compare_at_price - basePrice) / row.compare_at_price) * 100);
    discountLabel = pct > 0 ? `-${pct}%` : undefined;
    originalPrice = formatUsd(row.compare_at_price);
  }

  const createdMs = new Date(row.created_at).getTime();
  const isNew = Date.now() - createdMs < 30 * 24 * 60 * 60 * 1000;

  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category ?? 'Jewelry',
    imageUrl,
    images: images.map((item) => item.url),
    price: formatUsd(finalPrice),
    priceUsd: finalPrice,
    originalPrice,
    discountLabel,
    isFeatured: Boolean(row.discount_active),
    isNew,
    inStock: stock > 0,
    storeName: store?.name ?? 'MASA Store',
    brand: store?.name ?? 'MASA Store',
    metal: row.metal_type ?? undefined,
  };
}

export async function getHomeProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('stores.status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

export async function getDiscountedProducts(limit = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('discount_active', true)
    .eq('stores.status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

export async function getStoreBrands(limit = 12): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('stores!inner(name, status)')
    .eq('stores.status', 'approved')
    .limit(100);

  if (error || !data) return [];

  const names = new Set<string>();
  for (const row of data as Array<{ stores: { name: string }[] | { name: string } | null }>) {
    const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
    if (store?.name) names.add(store.name);
  }
  return Array.from(names).slice(0, limit);
}

export async function getDiscoverProducts(limit = 24): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('stores.status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

export async function getProductCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);

  if (error || !data) return [];

  const unique = Array.from(
    new Set(
      data
        .map((row) => row.category)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
    ),
  );

  return unique.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
  }));
}

export async function searchProducts(query: string, limit = 60): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getDiscoverProducts(limit);
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('stores.status', 'approved')
    .or(`name.ilike.%${trimmed}%,category.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

/** Related products: same store or same category, excluding current product. Used on product details for "You may also like". */
export async function getRelatedProducts(
  productId: string,
  storeId: string,
  category: string,
  limit = 4,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .neq('id', productId)
    .eq('stores.status', 'approved')
    .or(`store_id.eq.${storeId},category.ilike.${category}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

/** All products for a store's public profile page. Mirrors web `getPublicProductsByStore`. */
export async function getProductsByStore(storeId: string, limit = 60): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProduct);
}

export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('stores.status', 'approved')
    .maybeSingle();

  if (error || !data) return null;
  return mapProduct(data as ProductRow);
}
