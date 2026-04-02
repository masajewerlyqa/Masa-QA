"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Eye, Percent, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormattedPrice } from "@/components/FormattedPrice";
import { DeleteProductButton } from "@/components/seller/DeleteProductButton";
import { ProductDiscountForm } from "@/components/seller/ProductDiscountForm";
import { applyProductDiscount, removeProductDiscount } from "@/app/seller/products/actions";
import { isDiscountValid, computeDiscountedPrice } from "@/lib/discount";
import type { ProductRow } from "@/lib/seller-types";
import { useI18n } from "@/components/useI18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortProductsByEngagement, type ProductEngagementSortKey } from "@/lib/product-list-sort";

type Props = { products: ProductRow[] };

function discountLabel(product: ProductRow, t: (key: string, fallback?: string) => string): string | null {
  if (!product.discount_active || product.discount_type == null || product.discount_value == null) return null;
  if (!isDiscountValid(product.discount_active, product.discount_start_at, product.discount_end_at)) return null;
  if (product.discount_type === "percentage") return t("seller.products.percentOff").replace("{value}", String(product.discount_value));
  return t("seller.products.discounted");
}

export function SellerProductsTable({ products }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [sort, setSort] = useState<ProductEngagementSortKey>("newest");

  const sortedProducts = useMemo(() => sortProductsByEngagement(products, sort), [products, sort]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sortedProducts.length) setSelected(new Set());
    else setSelected(new Set(sortedProducts.map((p) => p.id)));
  };

  const selectedCount = selected.size;

  async function handleApplyDiscount(payload: Parameters<typeof applyProductDiscount>[1]) {
    const result = await applyProductDiscount(Array.from(selected), payload);
    if (result.ok) setSelected(new Set());
    return result;
  }

  async function handleRemoveDiscount() {
    if (selectedCount === 0) return;
    await removeProductDiscount(Array.from(selected));
    setSelected(new Set());
  }

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 min-w-0 flex-1">
            <CardTitle>{t("seller.products.allProducts")}</CardTitle>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-masa-gray font-sans">{t("seller.products.selected").replace("{count}", String(selectedCount))}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDiscountModalOpen(true)}
                  className="font-sans"
                >
                  <Percent className="w-4 h-4 mr-1" />
                  {t("seller.products.applyDiscount")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveDiscount}
                  className="font-sans text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t("seller.products.removeDiscount")}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[220px]">
            <span className="text-xs text-masa-gray font-sans">{t("seller.products.sortBy")}</span>
            <Select value={sort} onValueChange={(v) => setSort(v as ProductEngagementSortKey)}>
              <SelectTrigger className="w-full font-sans">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("seller.products.sortNewest")}</SelectItem>
                <SelectItem value="units_sold">{t("seller.products.sortBestSeller")}</SelectItem>
                <SelectItem value="revenue_usd">{t("seller.products.sortRevenue")}</SelectItem>
                <SelectItem value="wishlist_count">{t("seller.products.sortWishlist")}</SelectItem>
                <SelectItem value="units_cancelled">{t("seller.products.sortMostCancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <Table className="min-w-[1000px] md:min-w-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={sortedProducts.length > 0 && selected.size === sortedProducts.length}
                  onChange={toggleAll}
                  aria-label={t("seller.products.selectAll")}
                  className="rounded border-primary/20"
                />
              </TableHead>
              <TableHead>{t("seller.products.product")}</TableHead>
              <TableHead>{t("seller.products.price")}</TableHead>
              <TableHead>{t("seller.products.discount")}</TableHead>
              <TableHead>{t("seller.products.stock")}</TableHead>
              <TableHead>{t("seller.products.unitsSold")}</TableHead>
              <TableHead>{t("seller.products.wishlist")}</TableHead>
              <TableHead>{t("seller.products.revenue")}</TableHead>
              <TableHead>{t("seller.products.unitsCancelled")}</TableHead>
              <TableHead>{t("seller.products.status")}</TableHead>
              <TableHead>{t("seller.products.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-masa-gray py-8 font-sans">
                  {t("seller.products.noProductsYet")}
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => {
                const label = discountLabel(product, t);
                const basePrice = Number(product.price);
                const effectivePrice =
                  label && product.discount_type && product.discount_value != null
                    ? computeDiscountedPrice(basePrice, product.discount_type, product.discount_value)
                    : basePrice;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleOne(product.id)}
                        aria-label={t("seller.products.selectItem").replace("{name}", product.name)}
                        className="rounded border-primary/20"
                      />
                    </TableCell>
                    <TableCell className="font-sans">
                      <div className="flex items-center gap-3">
                        {product.image_urls?.[0] ? (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-masa-light shrink-0">
                            <Image
                              src={product.image_urls[0]}
                              alt=""
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-masa-light shrink-0" />
                        )}
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-sans">
                      {label ? (
                        <span>
                          <FormattedPrice usd={effectivePrice} />
                          <span className="text-masa-gray text-sm ml-1">({t("seller.products.was")} <FormattedPrice usd={basePrice} />)</span>
                        </span>
                      ) : (
                        <div>
                          <FormattedPrice usd={basePrice} />
                          <div className="text-xs text-masa-gray">
                            {t("seller.products.marketBased", "Market-based")}
                            {" · "}
                            {t("seller.products.margin", "Margin")}{" "}
                            <FormattedPrice usd={Number(product.craftsmanship_margin ?? 0)} />
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {label ? (
                        <Badge variant="secondary" className="font-sans">{label}</Badge>
                      ) : (
                        <span className="text-masa-gray text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell className="font-sans tabular-nums">{product.units_sold}</TableCell>
                    <TableCell className="font-sans tabular-nums">{product.wishlist_count}</TableCell>
                    <TableCell className="font-sans">
                      <FormattedPrice usd={Number(product.revenue_usd)} />
                    </TableCell>
                    <TableCell className="font-sans tabular-nums">{product.units_cancelled}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.status === "active" ? "default" : product.status === "out_of_stock" ? "warning" : "secondary"}
                      >
                        {product.status === "out_of_stock" ? t("seller.products.outOfStock") : t("order.statuses." + product.status, product.status.replace(/_/g, " "))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/product/${product.id}`} aria-label={t("seller.products.view")}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/seller/products/${product.id}/edit`} aria-label={t("seller.products.edit")}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
        <ProductDiscountForm
          open={discountModalOpen}
          onOpenChange={setDiscountModalOpen}
          onSubmit={handleApplyDiscount}
          productCount={selectedCount}
        />
      </CardContent>
    </Card>
  );
}
