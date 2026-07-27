import { getSupabase } from '../api/client';

export type SellerStoreSummary = {
  id: string;
  name: string;
  status: string;
};

export type SellerDashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  productsListed: number;
};

export async function getSellerStoreForUser(): Promise<SellerStoreSummary | null> {
  const { data: userData } = await getSupabase().auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data } = await getSupabase()
    .from('stores')
    .select('id, name, status')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    status: data.status as string,
  };
}

export async function getSellerDashboardStats(storeId: string): Promise<SellerDashboardStats> {
  const supabase = getSupabase();

  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('total_amount').eq('store_id', storeId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = orders.reduce((sum, row) => {
    const amount = Number(row.total_amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    totalRevenue,
    totalOrders: orders.length,
    productsListed: productsRes.count ?? 0,
  };
}
