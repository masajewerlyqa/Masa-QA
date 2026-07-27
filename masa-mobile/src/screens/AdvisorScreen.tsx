import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { MobileTopBar } from '../components/MobileTopBar';
import { ProductCard } from '../components/ProductCard';
import { ToolPageHero } from '../components/tools/ToolPageHero';
import { ContentContainer } from '../components/layout/ContentContainer';
import { fontFamily, theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import {
  BUDGET_RANGES,
  JEWELRY_CATEGORY_OPTIONS,
  METALS,
  OCCASIONS,
  STYLES,
  type AdvisorPreferences,
} from '../lib/advisor-types';
import { goProduct } from '../navigation/routes';
import { getRecommendations } from '../services/advisorService';
import type { Product } from '../types/catalog';

export function AdvisorScreen(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<AdvisorPreferences>({
    occasion: 'any',
    budget: 'any',
    metal: 'any',
    categories: [],
    style: 'any',
    recipient: 'any',
  });
  const [summary, setSummary] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);

  const submit = async (): Promise<void> => {
    setLoading(true);
    const { response, products } = await getRecommendations(prefs);
    setSummary(response.summary);
    setResults(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        imageUrl: p.imageUrl,
        price: `$${Math.round(p.price)}`,
        priceUsd: p.price,
        storeName: p.storeName,
        brand: p.storeName,
      })),
    );
    setLoading(false);
  };

  return (
    <View style={styles.root}>
      <MobileTopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ToolPageHero
          badge={isArabic ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
          subtitle={
            isArabic
              ? 'توصيات مجوهرات مخصصة حسب ذوقك وميزانيتك'
              : 'Personalized jewelry recommendations for your style and budget'
          }
          title={t('tools.advisor.title')}
        />
        <ContentContainer>
          {summary == null ? (
            <MasaCard style={styles.card}>
              <Text style={styles.fieldLabel}>{isArabic ? 'المناسبة' : 'Occasion'}</Text>
              <View style={styles.chipRow}>
                {OCCASIONS.slice(0, 5).map((o) => (
                  <MasaButton
                    key={o.value}
                    label={o.label}
                    onPress={() => setPrefs((p) => ({ ...p, occasion: o.value }))}
                    variant={prefs.occasion === o.value ? 'primary' : 'outline'}
                  />
                ))}
              </View>
              <Text style={styles.fieldLabel}>{isArabic ? 'الميزانية' : 'Budget'}</Text>
              <View style={styles.chipRow}>
                {BUDGET_RANGES.slice(0, 4).map((b) => (
                  <MasaButton
                    key={b.value}
                    label={b.label}
                    onPress={() => setPrefs((p) => ({ ...p, budget: b.value }))}
                    variant={prefs.budget === b.value ? 'primary' : 'outline'}
                  />
                ))}
              </View>
              <Text style={styles.fieldLabel}>{isArabic ? 'المعدن' : 'Metal'}</Text>
              <View style={styles.chipRow}>
                {METALS.slice(0, 4).map((m) => (
                  <MasaButton
                    key={m.value}
                    label={m.label}
                    onPress={() => setPrefs((p) => ({ ...p, metal: m.value }))}
                    variant={prefs.metal === m.value ? 'primary' : 'outline'}
                  />
                ))}
              </View>
              <Text style={styles.fieldLabel}>{isArabic ? 'النوع' : 'Jewelry type'}</Text>
              <View style={styles.chipRow}>
                {JEWELRY_CATEGORY_OPTIONS.slice(0, 4).map((c) => (
                  <MasaButton
                    key={c.value}
                    label={c.label}
                    onPress={() =>
                      setPrefs((p) => ({
                        ...p,
                        categories: p.categories.includes(c.value)
                          ? p.categories.filter((x) => x !== c.value)
                          : [...p.categories, c.value],
                      }))
                    }
                    variant={prefs.categories.includes(c.value) ? 'primary' : 'outline'}
                  />
                ))}
              </View>
              <Text style={styles.fieldLabel}>{isArabic ? 'الأسلوب' : 'Style'}</Text>
              <View style={styles.chipRow}>
                {STYLES.slice(0, 4).map((s) => (
                  <MasaButton
                    key={s.value}
                    label={s.label}
                    onPress={() => setPrefs((p) => ({ ...p, style: s.value }))}
                    variant={prefs.style === s.value ? 'primary' : 'outline'}
                  />
                ))}
              </View>
              {loading ? (
                <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
              ) : (
                <MasaButton
                  label={isArabic ? 'احصل على التوصيات' : 'Get Recommendations'}
                  onPress={submit}
                />
              )}
            </MasaCard>
          ) : (
            <>
              <MasaCard style={styles.card}>
                <Text style={[styles.summary, { fontFamily: fontFamily(isArabic, 'body') }]}>
                  {summary}
                </Text>
                <MasaButton
                  label={isArabic ? 'ابدأ من جديد' : 'Start over'}
                  onPress={() => {
                    setSummary(null);
                    setResults([]);
                  }}
                  variant="outline"
                />
              </MasaCard>
              <View style={styles.resultsGrid}>
                {results.map((product) => (
                  <View key={product.id} style={styles.resultItem}>
                    <ProductCard onPress={() => goProduct(product.id)} product={product} />
                  </View>
                ))}
              </View>
            </>
          )}
        </ContentContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: theme.colors.background, flex: 1 },
  card: { marginBottom: 16, marginTop: -24 },
  fieldLabel: { color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  loader: { marginVertical: 16 },
  summary: { color: theme.colors.masaGray, fontSize: 15, lineHeight: 24, marginBottom: 16 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  resultItem: { width: '48%' },
});
