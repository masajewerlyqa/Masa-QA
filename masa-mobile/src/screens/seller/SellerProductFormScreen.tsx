import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { goSellerDashboard } from '../../navigation/routes';
import { pickProductImages, uploadProductImage } from '../../services/productImageService';
import { getSellerStoreForUser } from '../../services/sellerDashboardService';
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProductDetail,
  updateSellerProduct,
  type ProductFormValues,
} from '../../services/sellerWriteService';

/** Mirrors web CATEGORIES / PRODUCT_STATUSES (lib/validations/product.ts). */
const CATEGORIES: ProductFormValues['category'][] = [
  'Ring',
  'Necklace',
  'Bracelet',
  'Earrings',
  'Pendant',
  'Anklet',
  'Other',
];
const STATUSES: ProductFormValues['status'][] = ['draft', 'active', 'archived', 'out_of_stock'];

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  Ring: { en: 'Ring', ar: 'خاتم' },
  Necklace: { en: 'Necklace', ar: 'قلادة' },
  Bracelet: { en: 'Bracelet', ar: 'سوار' },
  Earrings: { en: 'Earrings', ar: 'أقراط' },
  Pendant: { en: 'Pendant', ar: 'دلاية' },
  Anklet: { en: 'Anklet', ar: 'خلخال' },
  Other: { en: 'Other', ar: 'أخرى' },
};

/** Mirrors mobile en.ts/ar.ts `order.statuses.*`, already used for the order/product status badge. */
const STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  draft: { en: 'Draft', ar: 'مسودة' },
  active: { en: 'Active', ar: 'نشط' },
  archived: { en: 'Archived', ar: 'مؤرشف' },
  out_of_stock: { en: 'Out of stock', ar: 'نفدت الكمية' },
};

type ImageItem = { url: string; localUri?: string };

/**
 * Create/edit product. Mirrors web `components/seller/ProductForm.tsx` fields
 * exactly (title, description, category, metal type, gold karat, weight,
 * craftsmanship margin, stock, status, images); field labels are inline
 * bilingual strings because that is how the web form is itself localized --
 * there is no `seller.products.*` i18n dictionary to diverge from.
 */
export function SellerProductFormScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'SellerProductForm'>>();
  const productId = route.params?.productId;
  const isEdit = Boolean(productId);
  const { isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(isEdit);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductFormValues['category']>('Ring');
  const [metalType, setMetalType] = useState('');
  const [goldKarat, setGoldKarat] = useState('');
  const [weight, setWeight] = useState('');
  const [craftsmanshipMargin, setCraftsmanshipMargin] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [status, setStatus] = useState<ProductFormValues['status']>('draft');
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const storeResult = await getSellerStoreForUser();
      if (!mounted) return;
      if (storeResult.ok && storeResult.store) setStoreId(storeResult.store.id);

      if (productId) {
        const res = await getSellerProductDetail(productId);
        if (!mounted) return;
        if (!res.ok) {
          setError(res.error);
          setLoading(false);
          return;
        }
        const p = res.product;
        setTitle(p.name);
        setDescription(p.description ?? '');
        setCategory((p.category as ProductFormValues['category']) ?? 'Ring');
        setMetalType(p.metal_type ?? '');
        setGoldKarat(p.gold_karat ?? '');
        setWeight(p.weight != null ? String(p.weight) : '');
        setCraftsmanshipMargin(p.craftsmanship_margin != null ? String(p.craftsmanship_margin) : '');
        setStockQuantity(String(p.stock_quantity));
        setStatus((p.status as ProductFormValues['status']) ?? 'draft');
        setImages(p.product_images.sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ url: i.url })));
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const addImages = async (): Promise<void> => {
    if (!storeId) return;
    const picked = await pickProductImages();
    if (picked.length === 0) return;
    setUploading(true);
    const uploaded: ImageItem[] = [];
    for (const asset of picked) {
      const res = await uploadProductImage(storeId, asset);
      if (res.ok) uploaded.push({ url: res.url });
      else Alert.alert(isArabic ? 'خطأ' : 'Error', res.error);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removeImage = (url: string): void => {
    setImages((prev) => prev.filter((i) => i.url !== url));
  };

  const validate = (): string | null => {
    if (!title.trim()) return isArabic ? 'العنوان مطلوب.' : 'Title is required.';
    if (!metalType.trim()) return isArabic ? 'نوع المعدن مطلوب.' : 'Metal type is required.';
    const metal = metalType.trim().toLowerCase();
    if ((metal === 'gold' || metal === 'ذهب') && !goldKarat.trim()) {
      return isArabic ? 'عيار الذهب مطلوب للمنتجات الذهبية.' : 'Gold karat is required for gold products.';
    }
    return null;
  };

  const handleSave = async (): Promise<void> => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);

    const formData: ProductFormValues = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      metal_type: metalType.trim(),
      gold_karat: goldKarat.trim() || undefined,
      weight: weight.trim() ? Number(weight) : null,
      craftsmanship_margin: craftsmanshipMargin.trim() ? Number(craftsmanshipMargin) : null,
      stock_quantity: Number(stockQuantity) || 0,
      status,
    };
    const imageUrls = images.map((i) => i.url);

    const result = productId
      ? await updateSellerProduct(productId, formData, imageUrls)
      : await createSellerProduct(formData, imageUrls);

    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? (isArabic ? 'تعذر الحفظ.' : 'Could not save.'));
      return;
    }
    goSellerDashboard();
  };

  const handleDelete = (): void => {
    if (!productId) return;
    Alert.alert(
      isArabic ? 'حذف المنتج' : 'Delete product',
      isArabic ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This cannot be undone.',
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isArabic ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setDeleting(true);
              const result = await deleteSellerProduct(productId);
              setDeleting(false);
              if (!result.ok) {
                Alert.alert(isArabic ? 'خطأ' : 'Error', result.error ?? '');
                return;
              }
              goSellerDashboard();
            })();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={isArabic ? 'العودة' : 'Back'} />
        <Text style={[styles.title, { fontFamily: luxury }]}>
          {isEdit ? (isArabic ? 'تعديل المنتج' : 'Edit product') : isArabic ? 'إضافة منتج' : 'Add product'}
        </Text>

        <MasaCard style={styles.card}>
          <Field label={isArabic ? 'العنوان' : 'Title'}>
            <TextInput
              onChangeText={setTitle}
              placeholder={isArabic ? 'مثال: خاتم ألماس للخطوبة' : 'E.g. Diamond Engagement Ring'}
              placeholderTextColor={theme.colors.masaGray}
              style={styles.input}
              value={title}
            />
          </Field>

          <Field label={isArabic ? 'الوصف' : 'Description'}>
            <TextInput
              multiline
              numberOfLines={4}
              onChangeText={setDescription}
              placeholder={isArabic ? 'اكتب وصف المنتج...' : 'Describe your product...'}
              placeholderTextColor={theme.colors.masaGray}
              style={[styles.input, styles.textarea]}
              textAlignVertical="top"
              value={description}
            />
          </Field>

          <Field label={isArabic ? 'الفئة' : 'Category'}>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.chip, category === c ? styles.chipActive : null]}
                >
                  <Text style={[styles.chipText, category === c ? styles.chipTextActive : null]}>
                    {isArabic ? CATEGORY_LABELS[c].ar : CATEGORY_LABELS[c].en}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={isArabic ? 'نوع المعدن' : 'Metal type'}>
            <TextInput
              onChangeText={setMetalType}
              placeholder={isArabic ? 'مثال: ذهب، فضة، بلاتين' : 'e.g. Gold, Silver, Platinum'}
              placeholderTextColor={theme.colors.masaGray}
              style={styles.input}
              value={metalType}
            />
          </Field>

          <Field label={isArabic ? 'عيار الذهب (إن وجد)' : 'Gold karat (if applicable)'}>
            <TextInput
              onChangeText={setGoldKarat}
              placeholder={isArabic ? 'مثال: 18K, 24K' : 'e.g. 18K, 24K'}
              placeholderTextColor={theme.colors.masaGray}
              style={styles.input}
              value={goldKarat}
            />
          </Field>

          <View style={styles.row}>
            <Field label={isArabic ? 'الوزن (غرام)' : 'Weight (grams)'} style={styles.rowItem}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setWeight}
                placeholder="12.5"
                placeholderTextColor={theme.colors.masaGray}
                style={styles.input}
                value={weight}
              />
            </Field>
            <Field label={isArabic ? 'هامش الصنعة' : 'Craftsmanship margin'} style={styles.rowItem}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setCraftsmanshipMargin}
                placeholder="0"
                placeholderTextColor={theme.colors.masaGray}
                style={styles.input}
                value={craftsmanshipMargin}
              />
            </Field>
          </View>

          <Field label={isArabic ? 'كمية المخزون' : 'Stock quantity'}>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setStockQuantity}
              placeholder="0"
              placeholderTextColor={theme.colors.masaGray}
              style={styles.input}
              value={stockQuantity}
            />
          </Field>

          <Field label={isArabic ? 'الحالة' : 'Status'}>
            <View style={styles.chipRow}>
              {STATUSES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[styles.chip, status === s ? styles.chipActive : null]}
                >
                  <Text style={[styles.chipText, status === s ? styles.chipTextActive : null]}>
                    {isArabic ? STATUS_LABELS[s].ar : STATUS_LABELS[s].en}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={isArabic ? 'صور المنتج' : 'Product images'}>
            <View style={styles.imageGrid}>
              {images.map((img) => (
                <View key={img.url} style={styles.imageWrap}>
                  <Image source={{ uri: img.url }} style={styles.image} />
                  <Pressable onPress={() => removeImage(img.url)} style={styles.imageRemove}>
                    <Trash2 color={theme.colors.white} size={14} />
                  </Pressable>
                </View>
              ))}
            </View>
            <MasaButton
              disabled={uploading || !storeId}
              label={uploading ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : isArabic ? 'إضافة صور' : 'Add images'}
              onPress={() => void addImages()}
              variant="outline"
            />
          </Field>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <MasaButton
            disabled={saving}
            label={saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : isArabic ? 'حفظ' : 'Save'}
            onPress={() => void handleSave()}
          />

          {isEdit ? (
            <MasaButton
              disabled={deleting}
              label={deleting ? (isArabic ? 'جاري الحذف...' : 'Deleting...') : isArabic ? 'حذف المنتج' : 'Delete product'}
              onPress={handleDelete}
              variant="outline"
            />
          ) : null}
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}): React.JSX.Element {
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  chip: {
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chipText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: theme.colors.white },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  errorText: { color: '#dc2626', fontSize: 13 },
  fieldLabel: {
    color: theme.colors.masaDark,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  image: { borderRadius: 8, height: 72, width: 72 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  imageRemove: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: -6,
    width: 22,
  },
  imageWrap: { position: 'relative' },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: { marginTop: 60 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  textarea: { minHeight: 100 },
  title: { color: theme.colors.primary, fontSize: 24 },
});
