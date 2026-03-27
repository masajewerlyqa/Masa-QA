"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { productFormSchema, PRODUCT_STATUSES, CATEGORIES, type ProductFormValues } from "@/lib/validations/product";
import { createProduct, updateProduct, type ActionResult } from "@/app/seller/products/actions";
import type { SellerProductDetail } from "@/lib/seller-types";
import { useI18n } from "@/components/useI18n";
import { computeDynamicMarketPriceUsd, type PricingMarketSnapshot } from "@/lib/pricing-engine";

const QAR_TO_USD = 1 / 3.64;

const BUCKET = "product-images";
const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProductFormProps = {
  storeId: string;
  mode: "create";
  marketSnapshot: PricingMarketSnapshot | null;
  product?: never;
};

type ProductFormEditProps = {
  storeId: string;
  mode: "edit";
  marketSnapshot: PricingMarketSnapshot | null;
  product: SellerProductDetail;
};

export function ProductForm(props: ProductFormProps | ProductFormEditProps) {
  const { isArabic } = useI18n();
  const { storeId, mode, marketSnapshot } = props;
  const product = props.mode === "edit" ? props.product : null;
  const localizeOption = (value: string) => {
    const v = value.toLowerCase().replace(/\s+/g, "_");
    const map: Record<string, string> = {
      rings: "خواتم",
      necklaces: "قلائد",
      bracelets: "أساور",
      earrings: "أقراط",
      pendants: "تعليقات",
      anklets: "خلخال",
      other: "أخرى",
      draft: "مسودة",
      active: "نشط",
      inactive: "غير نشط",
      out_of_stock: "نفد المخزون",
      archived: "مؤرشف",
    };
    return isArabic ? (map[v] ?? value) : value;
  };

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.image_urls ?? []);
  const [imageErrors, setImageErrors] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});

  const defaultValues: ProductFormValues = product
    ? {
        title: product.name,
        description: product.description ?? "",
        category: (product.category as ProductFormValues["category"]) ?? "Other",
        metal_type: product.metal_type ?? "",
        gold_karat: product.gold_karat ?? "",
        weight: product.weight ?? undefined,
        craftsmanship_margin: product.craftsmanship_margin ?? 0,
        stock_quantity: product.stock_quantity,
        status: (product.status as ProductFormValues["status"]) ?? "draft",
      }
    : {
        title: "",
        description: "",
        category: "Other",
        metal_type: "",
        gold_karat: "",
        weight: undefined,
        craftsmanship_margin: 0,
        stock_quantity: 0,
        status: "draft",
      };

  const [metalTypeValue, setMetalTypeValue] = useState(defaultValues.metal_type ?? "");
  const [goldKaratValue, setGoldKaratValue] = useState(defaultValues.gold_karat ?? "");
  const [weightValue, setWeightValue] = useState<string>(defaultValues.weight != null ? String(defaultValues.weight) : "");
  const [craftsmanshipMarginValue, setCraftsmanshipMarginValue] = useState<string>(
    defaultValues.craftsmanship_margin != null ? String(defaultValues.craftsmanship_margin) : "0"
  );

  const preview = computeDynamicMarketPriceUsd(
    {
      metalType: metalTypeValue,
      goldKarat: goldKaratValue,
      weight: weightValue ? Number(weightValue) : null,
      craftsmanshipMargin: craftsmanshipMarginValue ? Number(craftsmanshipMarginValue) : 0,
      storedPrice: product?.price ?? 0,
    },
    marketSnapshot ?? {},
    QAR_TO_USD
  );

  async function handleUpload(files: FileList | null): Promise<string[]> {
    if (!files?.length) return [];
    const supabase = createClient();
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageErrors(isArabic ? `نوع غير صالح: ${file.name}. استخدم JPEG أو PNG أو WebP أو GIF.` : `Invalid type: ${file.name}. Use JPEG, PNG, WebP or GIF.`);
        return imageUrls;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageErrors(isArabic ? `الملف كبير جدًا: ${file.name}. الحد 5MB.` : `File too large: ${file.name}. Max 5MB.`);
        return imageUrls;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${storeId}/${crypto.randomUUID()}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
      if (uploadError) {
        setImageErrors(uploadError.message);
        return imageUrls;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setImageErrors(null);
    return urls;
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const total = imageUrls.length + files.length;
    if (total > MAX_IMAGES) {
      setImageErrors(isArabic ? `الحد الأقصى ${MAX_IMAGES} صور.` : `Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    handleUpload(files).then((newUrls) => setImageUrls((prev) => [...prev, ...newUrls]));
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const raw: Record<string, unknown> = {
      title: (form.elements.namedItem("title") as HTMLInputElement)?.value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement)?.value,
      category: (form.elements.namedItem("category") as HTMLSelectElement)?.value,
      metal_type: (form.elements.namedItem("metal_type") as HTMLInputElement)?.value,
      gold_karat: (form.elements.namedItem("gold_karat") as HTMLInputElement)?.value,
      weight: (form.elements.namedItem("weight") as HTMLInputElement)?.value || undefined,
      craftsmanship_margin: (form.elements.namedItem("craftsmanship_margin") as HTMLInputElement)?.value || 0,
      stock_quantity: (form.elements.namedItem("stock_quantity") as HTMLInputElement)?.value,
      status: (form.elements.namedItem("status") as HTMLSelectElement)?.value,
    };

    const parsed = productFormSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors(flat as Partial<Record<keyof ProductFormValues, string>>);
      setError(parsed.error.message);
      return;
    }

    setPending(true);
    let result: ActionResult;
    if (mode === "create") {
      result = await createProduct(parsed.data, imageUrls);
    } else if (product) {
      result = await updateProduct(product.id, parsed.data, imageUrls);
    } else {
      result = { ok: false, error: isArabic ? "حالة غير صالحة" : "Invalid state" };
    }
    setPending(false);

    if (!result.ok) {
      setError(result.error ?? (isArabic ? "حدث خطأ ما" : "Something went wrong"));
      return;
    }
    if (mode === "create" && result.productId) {
      window.location.href = "/seller/products";
    } else if (mode === "edit") {
      window.location.href = "/seller/products";
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="max-w-2xl border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{mode === "create" ? (isArabic ? "تفاصيل المنتج" : "Product details") : (isArabic ? "تعديل المنتج" : "Edit product")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{isArabic ? "العنوان" : "Title"}</Label>
            <Input
              id="title"
              name="title"
              placeholder={isArabic ? "مثال: خاتم ألماس للخطوبة" : "E.g. Diamond Engagement Ring"}
              defaultValue={defaultValues.title}
              className={fieldErrors.title ? "border-red-500" : ""}
            />
            {fieldErrors.title && <p className="text-sm text-red-600">{fieldErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{isArabic ? "الوصف" : "Description"}</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="flex w-full rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm"
              placeholder={isArabic ? "اكتب وصف المنتج..." : "Describe your product..."}
              defaultValue={defaultValues.description}
            />
            {fieldErrors.description && <p className="text-sm text-red-600">{fieldErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{isArabic ? "الفئة" : "Category"}</Label>
              <select
                id="category"
                name="category"
                defaultValue={defaultValues.category}
                className="flex h-9 w-full items-center justify-between rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {localizeOption(c)}
                  </option>
                ))}
              </select>
              {fieldErrors.category && <p className="text-sm text-red-600">{fieldErrors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "السعر النهائي (محسوب تلقائياً)" : "Final price (auto-calculated)"}</Label>
              <div className="rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm">
                <div className="font-medium text-primary">${preview.finalPriceUsd.toFixed(2)}</div>
                <div className="text-xs text-masa-gray mt-1">
                  {isArabic
                    ? "تسعير مرتبط بالسوق: قيمة المعدن/الألماس الحية + هامش الصياغة"
                    : "Market-based pricing: live material value + craftsmanship margin"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metal_type">{isArabic ? "نوع المعدن" : "Metal type"}</Label>
              <Input
                id="metal_type"
                name="metal_type"
                placeholder={isArabic ? "مثال: ذهب، فضة، بلاتين" : "e.g. Gold, Silver, Platinum"}
                defaultValue={defaultValues.metal_type}
                onChange={(e) => setMetalTypeValue(e.target.value)}
                className={fieldErrors.metal_type ? "border-red-500" : ""}
              />
              {fieldErrors.metal_type && <p className="text-sm text-red-600">{fieldErrors.metal_type}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gold_karat">{isArabic ? "عيار الذهب (إن وجد)" : "Gold karat (if applicable)"}</Label>
              <Input
                id="gold_karat"
                name="gold_karat"
                placeholder={isArabic ? "مثال: 18K, 24K" : "e.g. 18K, 24K"}
                defaultValue={defaultValues.gold_karat}
                onChange={(e) => setGoldKaratValue(e.target.value)}
              />
              {fieldErrors.gold_karat && <p className="text-sm text-red-600">{fieldErrors.gold_karat}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{isArabic ? "الوزن (غرام)" : "Weight (grams)"}</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min={0.01}
                placeholder={isArabic ? "مثال: 12.5" : "e.g. 12.5"}
                defaultValue={defaultValues.weight ?? ""}
                onChange={(e) => setWeightValue(e.target.value)}
                className={fieldErrors.weight ? "border-red-500" : ""}
              />
              {fieldErrors.weight && <p className="text-sm text-red-600">{fieldErrors.weight}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="craftsmanship_margin">
                {isArabic ? "هامش الصياغة / العمل ($)" : "Craftsmanship / labor margin ($)"}
              </Label>
              <Input
                id="craftsmanship_margin"
                name="craftsmanship_margin"
                type="number"
                step="0.01"
                min={0}
                defaultValue={defaultValues.craftsmanship_margin ?? 0}
                onChange={(e) => setCraftsmanshipMarginValue(e.target.value)}
                className={fieldErrors.craftsmanship_margin ? "border-red-500" : ""}
              />
              <p className="text-xs text-masa-gray">
                {isArabic
                  ? "اختياري. إذا تُرك فارغاً أو 0، يتم استخدام تسعير السوق فقط."
                  : "Optional. Leave empty or 0 to use pure market-based pricing."}
              </p>
              {fieldErrors.craftsmanship_margin && (
                <p className="text-sm text-red-600">{fieldErrors.craftsmanship_margin}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">{isArabic ? "كمية المخزون" : "Stock quantity"}</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min={0}
                defaultValue={defaultValues.stock_quantity}
                className={fieldErrors.stock_quantity ? "border-red-500" : ""}
              />
              {fieldErrors.stock_quantity && <p className="text-sm text-red-600">{fieldErrors.stock_quantity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{isArabic ? "الحالة" : "Status"}</Label>
            <select
              id="status"
              name="status"
              defaultValue={defaultValues.status}
              className="flex h-9 w-full items-center justify-between rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm"
            >
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {localizeOption(s.replace(/_/g, " "))}
                </option>
              ))}
            </select>
            {fieldErrors.status && <p className="text-sm text-red-600">{fieldErrors.status}</p>}
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "صور المنتج" : "Product images"}</Label>
            {imageErrors && <p className="text-sm text-red-600">{imageErrors}</p>}
            <div className="flex flex-wrap gap-4 items-start">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-primary/20 bg-masa-light">
                    <Image src={url} alt="" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 group-hover:opacity-100"
                    onClick={() => removeImage(i)}
                    aria-label={isArabic ? "حذف الصورة" : "Remove image"}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {imageUrls.length < MAX_IMAGES && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:bg-masa-light/50 text-masa-gray text-sm">
                  <input
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    multiple
                    className="hidden"
                    onChange={onFileChange}
                  />
                  {isArabic ? "+ إضافة" : "+ Add"}
                </label>
              )}
            </div>
            <p className="text-xs text-masa-gray">{isArabic ? `حتى ${MAX_IMAGES} صور. JPEG أو PNG أو WebP أو GIF. بحد أقصى 5MB لكل صورة.` : `Up to ${MAX_IMAGES} images. JPEG, PNG, WebP or GIF. Max 5MB each.`}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={pending}>
              {pending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : mode === "create" ? (isArabic ? "حفظ المنتج" : "Save product") : (isArabic ? "حفظ التغييرات" : "Save changes")}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/seller/products">{isArabic ? "إلغاء" : "Cancel"}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
