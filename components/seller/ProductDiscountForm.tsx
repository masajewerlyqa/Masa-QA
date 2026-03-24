"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import type { DiscountPayload } from "@/app/seller/products/actions";
import { useI18n } from "@/components/useI18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DiscountPayload) => Promise<{ ok: boolean; error?: string }>;
  productCount: number;
};

export function ProductDiscountForm({
  open,
  onOpenChange,
  onSubmit,
  productCount,
}: Props) {
  const { t } = useI18n();
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const num = parseFloat(value);
    if (Number.isNaN(num) || num < 0) {
      setError(t("common.invalidValue", "Enter a valid value"));
      return;
    }
    if (type === "percentage" && num > 100) {
      setError(t("common.invalidPercentage", "Percentage must be 0–100"));
      return;
    }
    setLoading(true);
    try {
      const result = await onSubmit({
        discount_type: type,
        discount_value: num,
        discount_start_at: startAt.trim() || null,
        discount_end_at: endAt.trim() || null,
        discount_active: active,
      });
      if (result.ok) {
        onOpenChange(false);
        setValue("");
        setStartAt("");
        setEndAt("");
      } else {
        setError(result.error ?? t("common.failed", "Failed"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>{t("seller.products.applyDiscount")} ({productCount})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("seller.products.discount")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as "percentage" | "fixed")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">{t("admin.promo.percentage")}</SelectItem>
                <SelectItem value="fixed">{t("admin.promo.fixedAmount")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{type === "percentage" ? t("common.percentage", "Percentage (0–100)") : t("common.amountUsd", "Amount (USD)")}</Label>
            <Input
              type="number"
              min={0}
              max={type === "percentage" ? 100 : undefined}
              step={type === "percentage" ? 1 : 0.01}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percentage" ? "e.g. 15" : "e.g. 50"}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-masa-gray">{t("admin.promo.startsAtOptional")}</Label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-masa-gray">{t("admin.promo.expiresAtOptional")}</Label>
              <Input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="discount-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-primary/20"
            />
            <Label htmlFor="discount-active">{t("common.activeNow", "Active (apply discount now)")}</Label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("checkout.applying") : t("seller.products.applyDiscount")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
