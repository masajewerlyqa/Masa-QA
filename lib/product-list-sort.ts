export type ProductEngagementSortKey =
  | "newest"
  | "units_sold"
  | "revenue_usd"
  | "wishlist_count"
  | "units_cancelled";

type Row = {
  created_at: string;
  units_sold: number;
  revenue_usd: number;
  wishlist_count: number;
  units_cancelled: number;
};

function createdMs(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Client-side sort for product tables with engagement fields. */
export function sortProductsByEngagement<T extends Row>(rows: T[], sort: ProductEngagementSortKey): T[] {
  const copy = [...rows];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => createdMs(b.created_at) - createdMs(a.created_at));
    case "units_sold":
      return copy.sort((a, b) => b.units_sold - a.units_sold || b.revenue_usd - a.revenue_usd);
    case "revenue_usd":
      return copy.sort((a, b) => b.revenue_usd - a.revenue_usd || b.units_sold - a.units_sold);
    case "wishlist_count":
      return copy.sort((a, b) => b.wishlist_count - a.wishlist_count || b.units_sold - a.units_sold);
    case "units_cancelled":
      return copy.sort((a, b) => b.units_cancelled - a.units_cancelled || b.units_sold - a.units_sold);
    default:
      return copy;
  }
}
