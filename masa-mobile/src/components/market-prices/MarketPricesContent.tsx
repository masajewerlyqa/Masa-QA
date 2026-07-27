import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Coins, Gem, TrendingDown, TrendingUp } from 'lucide-react-native';

import { MasaButton } from '../MasaButton';
import { MasaCard } from '../MasaCard';
import { MarketLineChart } from './MarketLineChart';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import type { AllMarketData } from '../../types/marketPrices';
import { useSettings } from '../../context/SettingsContext';

const TIME_RANGES = ['1D', '7D', '1M', '6M', '1Y'] as const;
const QAR_TO_USD = 0.2747;

function formatMarketPrice(qar: number, currency: 'USD' | 'QAR', isArabic: boolean): string {
  const amount = currency === 'QAR' ? qar : qar * QAR_TO_USD;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === 'USD') return `$ ${formatted}`;
  const prefix = isArabic ? 'ر.ق' : 'QAR';
  return `${prefix} ${formatted}`;
}

function formatTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function KpiTrend({ changePercent, todayLabel }: { changePercent: number; todayLabel: string }): React.JSX.Element {
  const v = typeof changePercent === 'number' && !Number.isNaN(changePercent) ? changePercent : 0;
  const up = v >= 0;
  return (
    <View style={styles.trendRow}>
      {up ? (
        <TrendingUp color="#16a34a" size={12} />
      ) : (
        <TrendingDown color="#dc2626" size={12} />
      )}
      <Text style={[styles.trendPct, { color: up ? '#16a34a' : '#dc2626' }]}>
        {up ? '+' : ''}
        {v.toFixed(2)}%
      </Text>
      <Text style={styles.trendLabel}>{todayLabel}</Text>
    </View>
  );
}

type MarketPricesContentProps = {
  data: AllMarketData | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  source?: 'api' | 'gold-prices' | 'fallback';
};

export function MarketPricesContent({
  data,
  loading,
  error,
  onRetry,
  source,
}: MarketPricesContentProps): React.JSX.Element {
  const { t, isArabic, currency } = useSettings();
  const displayCurrency = currency === 'QAR' ? 'QAR' : 'USD';
  const format = (qar: number) => formatMarketPrice(qar, displayCurrency, isArabic);
  const luxury = fontFamily(isArabic, 'luxury');

  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>('7D');
  const [activeTab, setActiveTab] = useState<'gold' | 'silver' | 'diamond'>('gold');

  const insightText = useMemo(() => {
    if (!data) return '';
    const { gold, silver } = data;
    const parts: string[] = [];
    if (gold.weeklyChangePercent > 0.5) {
      parts.push(
        t('tools.market.insight.goldUpGcc').replace('{percent}', gold.weeklyChangePercent.toFixed(1)),
      );
    }
    if (silver.changePercent > 0.2) {
      parts.push(
        t('tools.market.insight.silverUpToday').replace('{percent}', silver.changePercent.toFixed(2)),
      );
    }
    return parts.length ? parts.join(' ') : t('tools.market.insight.stableRangeFallback');
  }, [data, t]);

  const chartSeries = useMemo(() => {
    if (!data) return [];
    const { gold, silver, diamond } = data;
    const series =
      activeTab === 'gold'
        ? gold.historyByRange[timeRange] ?? gold.historyByRange['7D']
        : activeTab === 'silver'
          ? silver.historyByRange[timeRange] ?? silver.historyByRange['7D']
          : diamond.historyByRange[timeRange] ?? diamond.historyByRange['7D'];
    return series ?? [];
  }, [data, activeTab, timeRange]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loader}>
        <Text style={[styles.errorText, textStyle(isArabic, 'body')]}>{error ?? t('common.somethingWentWrong')}</Text>
        {onRetry ? (
          <MasaButton
            label={isArabic ? 'حاول مرة أخرى' : 'Try again'}
            onPress={onRetry}
            style={styles.retryBtn}
          />
        ) : null}
      </View>
    );
  }

  const { gold, silver, diamond } = data;

  const tabs = [
    { id: 'gold' as const, label: t('tools.market.gold') },
    { id: 'silver' as const, label: t('tools.market.silver') },
    { id: 'diamond' as const, label: t('tools.market.diamond') },
  ];

  return (
    <View>
      {error ? (
        <View style={styles.warningBanner}>
          <Text style={[styles.warningText, textStyle(isArabic, 'caption')]}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.hero}>
        <Text style={[styles.heroTitle, { fontFamily: luxury }]}>{t('tools.market.heroTitle')}</Text>
        <Text style={[styles.heroSub, textStyle(isArabic, 'body')]}>{t('tools.market.heroSubtitle')}</Text>
      </View>

      <View style={styles.kpiGrid}>
        <KpiCard
          Icon={Coins}
          changePercent={gold.changePercent}
          format={format}
          isArabic={isArabic}
          price={gold.price24KPerGramQAR}
          title={t('tools.market.gold24k')}
          todayLabel={t('tools.market.today')}
          updated={formatTime(gold.updatedAt)}
          updatedLabel={t('tools.market.updated')}
        />
        <KpiCard
          Icon={Coins}
          changePercent={gold.changePercent}
          format={format}
          hideUpdated
          isArabic={isArabic}
          price={gold.price22KPerGramQAR}
          title={t('tools.market.gold22k')}
          todayLabel={t('tools.market.today')}
        />
        <KpiCard
          Icon={Coins}
          changePercent={gold.changePercent}
          format={format}
          hideUpdated
          isArabic={isArabic}
          price={gold.price18KPerGramQAR}
          title={t('tools.market.gold18k')}
          todayLabel={t('tools.market.today')}
        />
        <KpiCard
          Icon={Coins}
          changePercent={silver.changePercent}
          format={format}
          isArabic={isArabic}
          price={silver.priceQAR}
          title={t('tools.market.silver')}
          todayLabel={t('tools.market.today')}
          updated={formatTime(silver.updatedAt)}
          updatedLabel={t('tools.market.updated')}
        />
        <View style={styles.kpiWide}>
          <KpiCard
            Icon={Gem}
            changePercent={diamond.changePercent}
            format={format}
            isArabic={isArabic}
            price={diamond.priceQAR}
            subLabel={t('tools.market.oneCaratAvg')}
            title={t('tools.market.diamondIndex')}
            todayLabel={t('tools.market.today')}
            updated={formatTime(diamond.updatedAt)}
            updatedLabel={t('tools.market.updated')}
          />
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('tools.market.priceTrend')}</Text>
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.rangeRow}>
          {TIME_RANGES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setTimeRange(r)}
              style={[styles.rangeBtn, timeRange === r && styles.rangeBtnActive]}
            >
              <Text style={[styles.rangeText, timeRange === r && styles.rangeTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </View>
        <MarketLineChart data={chartSeries} />
      </View>

      <View style={styles.detailsSection}>
        <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('tools.market.marketDetails')}</Text>
        <MasaCard style={styles.detailsCard}>
          {activeTab === 'gold' ? (
            <DetailsGrid
              isArabic={isArabic}
              rows={[
                [t('tools.market.labels.gold24PerGram'), format(gold.price24KPerGramQAR)],
                [t('tools.market.labels.gold22PerGram'), format(gold.price22KPerGramQAR)],
                [t('tools.market.labels.gold18PerGram'), format(gold.price18KPerGramQAR)],
                [t('tools.market.labels.perOunce'), format(gold.pricePerOunceQAR)],
                [
                  t('tools.market.labels.weeklyChange'),
                  `${gold.weeklyChangePercent >= 0 ? '+' : ''}${gold.weeklyChangePercent}%`,
                ],
                [t('tools.market.labels.monthlyTrend'), gold.monthlyTrend],
                [t('tools.market.labels.qatarPremium'), `${gold.qatarPremiumEstimatePercent}%`],
              ]}
            />
          ) : activeTab === 'silver' ? (
            <DetailsGrid
              isArabic={isArabic}
              rows={[
                [t('tools.market.labels.silverPerGram'), format(silver.pricePerGramQAR)],
                [t('tools.market.labels.silverPerKg'), format(silver.pricePerKgQAR)],
                [t('tools.market.labels.industrialDemand'), silver.industrialDemandTrend],
              ]}
            />
          ) : (
            <DetailsGrid
              isArabic={isArabic}
              rows={[
                [t('tools.market.labels.avgDiamond1ct'), format(diamond.avg1CtPriceQAR)],
                [t('tools.market.labels.investmentIndex'), `${diamond.investmentIndex}/100`],
                [t('tools.market.labels.luxuryTrend'), diamond.luxuryRetailTrend],
                [t('tools.market.labels.demandIndicator'), diamond.demandIndicator],
              ]}
            />
          )}
        </MasaCard>
      </View>

      <View style={styles.insightSection}>
        <MasaCard style={styles.insightCard}>
          <Text style={[styles.cardTitle, { fontFamily: luxury }]}>{t('tools.market.aiInsight')}</Text>
          <Text style={textStyle(isArabic, 'body')}>{insightText}</Text>
        </MasaCard>
      </View>

      <View style={styles.opportunitySection}>
        <MasaCard>
          <Text style={[styles.cardTitle, { fontFamily: luxury }]}>{t('tools.market.sellerOpportunity')}</Text>
          <Text style={textStyle(isArabic, 'body')}>
            <Text style={styles.bold}>{t('tools.market.bestMetal')} </Text>
            {t('tools.market.sellerMetal.gold24k')}
          </Text>
          <Text style={textStyle(isArabic, 'body')}>
            <Text style={styles.bold}>{t('tools.market.estimatedMargin')} </Text>~12%
          </Text>
          <Text style={textStyle(isArabic, 'body')}>
            <Text style={styles.bold}>{t('tools.market.trendingCategory')} </Text>
            {t('tools.market.sellerCategory.diamondRings')}
          </Text>
        </MasaCard>
      </View>
    </View>
  );
}

function KpiCard({
  title,
  price,
  format,
  changePercent,
  todayLabel,
  updated,
  updatedLabel,
  hideUpdated,
  subLabel,
  Icon,
  isArabic,
}: {
  title: string;
  price: number;
  format: (q: number) => string;
  changePercent: number;
  todayLabel: string;
  updated?: string;
  updatedLabel?: string;
  hideUpdated?: boolean;
  subLabel?: string;
  Icon: typeof Coins;
  isArabic: boolean;
}): React.JSX.Element {
  const luxury = fontFamily(isArabic, 'luxury');
  return (
    <MasaCard style={styles.kpiCard}>
      <View style={styles.kpiHead}>
        <Icon color={theme.colors.masaGold} size={12} />
        <Text style={textStyle(isArabic, 'caption')}>{title}</Text>
      </View>
      <Text style={[styles.kpiPrice, { fontFamily: luxury }]}>
        {format(price)}
        <Text style={styles.perGram}> {tPerGram(isArabic)}</Text>
      </Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
      <KpiTrend changePercent={changePercent} todayLabel={todayLabel} />
      {!hideUpdated && updated ? (
        <Text style={styles.updated}>
          {updatedLabel} {updated}
        </Text>
      ) : null}
    </MasaCard>
  );
}

function tPerGram(isArabic: boolean): string {
  return isArabic ? '/غرام' : '/gram';
}

function DetailsGrid({
  rows,
  isArabic,
}: {
  rows: [string, string][];
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.dl}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.dlItem}>
          <Text style={textStyle(isArabic, 'caption')}>{label}</Text>
          <Text style={[textStyle(isArabic, 'bodySm'), { color: theme.colors.primary }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { alignItems: 'center', gap: 16, paddingHorizontal: MOBILE_CONTENT_PADDING_X, paddingVertical: 48 },
  errorText: { color: theme.colors.primary, textAlign: 'center' },
  retryBtn: { marginTop: 8 },
  warningBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderBottomColor: 'rgba(251, 191, 36, 0.5)',
    borderBottomWidth: 1,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 10,
  },
  warningText: { color: theme.colors.masaDark, textAlign: 'center' },
  hero: {
    alignItems: 'center',
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 64,
    paddingBottom: 16,
  },
  heroTitle: {
    color: theme.colors.primary,
    fontSize: 36,
    lineHeight: 44,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSub: { fontSize: 18, textAlign: 'center' },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingBottom: 32,
  },
  kpiCard: { gap: 4, padding: 12, width: '48%' },
  kpiWide: { width: '100%' },
  kpiHead: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  kpiPrice: { color: theme.colors.primary, fontSize: 18, lineHeight: 24 },
  perGram: { color: theme.colors.masaGray, fontSize: 10 },
  subLabel: { color: theme.colors.masaGray, fontSize: 10 },
  trendRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 4 },
  trendPct: { fontSize: 10 },
  trendLabel: { color: theme.colors.masaGray, fontSize: 10 },
  updated: { color: theme.colors.masaGray, fontSize: 10, marginTop: 4 },
  chartSection: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: 16,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 48,
  },
  sectionTitle: { color: theme.colors.primary, fontSize: 24, lineHeight: 32 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  tabActive: { borderBottomColor: theme.colors.primary },
  tabText: { color: theme.colors.masaGray, fontSize: 14 },
  tabTextActive: { color: theme.colors.primary, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rangeBtn: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rangeBtnActive: { backgroundColor: theme.colors.primary },
  rangeText: { color: theme.colors.masaDark, fontSize: 14 },
  rangeTextActive: { color: theme.colors.white },
  detailsSection: {
    backgroundColor: 'rgba(247, 243, 238, 0.5)',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: 16,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 48,
  },
  detailsCard: { padding: 24 },
  dl: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dlItem: { gap: 4, width: '46%' },
  insightSection: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 48,
  },
  insightCard: { gap: 16 },
  cardTitle: { color: theme.colors.primary, fontSize: 20 },
  opportunitySection: {
    backgroundColor: 'rgba(247, 243, 238, 0.5)',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: 12,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 48,
  },
  bold: { color: theme.colors.primary, fontWeight: '600' },
});
