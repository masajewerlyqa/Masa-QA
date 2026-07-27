import { Product } from '../types/catalog';
import { ServiceResult } from '../types/service';
import { supabase } from './supabase';
import { getProductById, mapProduct, ProductRow, PRODUCT_SELECT } from './productService';

export type CartItemWithProduct = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};

async function getOrCreateCart(userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

export async function getCartCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) {
    return 0;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('cart_id', cartId);

  if (error || !data) {
    return 0;
  }

  return data.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
}

export async function getCartWithProducts(): Promise<CartItemWithProduct[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) {
    return [];
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`id, product_id, quantity, product:products(${PRODUCT_SELECT})`)
    .eq('cart_id', cartId);

  if (error || !data) {
    return [];
  }

  type Row = { id: string; product_id: string; quantity: number; product: ProductRow | null };

  return (data as unknown as Row[])
    .filter((item): item is Row & { product: ProductRow } => item.product !== null)
    .map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      product: mapProduct(item.product),
    }));
}

export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<ServiceResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Sign in to add to cart' };
  }
  if (quantity < 1) {
    return { ok: false, error: 'Invalid quantity' };
  }

  const product = await getProductById(productId);
  if (!product) {
    return { ok: false, error: 'Product not found' };
  }
  if (product.inStock === false) {
    return { ok: false, error: 'This item is out of stock' };
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) {
    return { ok: false, error: 'Could not load cart' };
  }

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();

  const newQuantity = existing ? existing.quantity + quantity : quantity;

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', existing.id);
    if (error) {
      return { ok: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, product_id: productId, quantity });
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  return { ok: true, data: undefined };
}

export async function updateCartQuantity(
  productId: string,
  quantity: number,
): Promise<ServiceResult> {
  if (quantity < 1) {
    return removeFromCart(productId);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Sign in to update cart' };
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) {
    return { ok: false, error: 'Could not load cart' };
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('cart_id', cartId)
    .eq('product_id', productId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}

export async function removeFromCart(productId: string): Promise<ServiceResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Sign in to update cart' };
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) {
    return { ok: true, data: undefined };
  }

  await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId);

  return { ok: true, data: undefined };
}
