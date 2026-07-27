import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { MobileTopBar } from '../components/MobileTopBar';
import { ToolPageHero } from '../components/tools/ToolPageHero';
import { ContentContainer } from '../components/layout/ContentContainer';
import { fontFamily, theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_GOLD_PRICE_QAR,
  goldPricePerGramAtPurity,
} from '../lib/tools/gold-karat-price';

const GOLD_KARATS = [
  { value: '24', label: '24K (99.9% Pure)', purity: 0.999 },
  { value: '22', label: '22K (91.7% Pure)', purity: 0.917 },
  { value: '21', label: '21K (87.5% Pure)', purity: 0.875 },
  { value: '18', label: '18K (75% Pure)', purity: 0.75 },
  { value: '14', label: '14K (58.3% Pure)', purity: 0.583 },
];

const NISAB_GRAMS = 85;
const ZAKAT_RATE = 0.025;

function formatQar(amount: number, isArabic: boolean): string {
  const prefix = isArabic ? 'ر.ق' : 'QAR';
  return `${prefix} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ZakatCalculatorScreen(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';
  const [weight, setWeight] = useState('');
  const [karat, setKarat] = useState('22');
  const [syncPrice, setSyncPrice] = useState(true);
  const [goldPrice, setGoldPrice] = useState(
    goldPricePerGramAtPurity(DEFAULT_GOLD_PRICE_QAR, 0.917).toFixed(2),
  );
  const [result, setResult] = useState<{
    pureGold: number;
    totalValue: number;
    zakatDue: number;
    meetsNisab: boolean;
  } | null>(null);

  useEffect(() => {
    if (!syncPrice) return;
    const p = GOLD_KARATS.find((k) => k.value === karat)?.purity ?? 0.917;
    setGoldPrice(goldPricePerGramAtPurity(DEFAULT_GOLD_PRICE_QAR, p).toFixed(2));
  }, [karat, syncPrice]);

  const calculate = (): void => {
    const weightNum = parseFloat(weight) || 0;
    const karatInfo = GOLD_KARATS.find((k) => k.value === karat);
    const purity = karatInfo?.purity ?? 0.917;
    const priceNum = parseFloat(goldPrice) || goldPricePerGramAtPurity(DEFAULT_GOLD_PRICE_QAR, purity);
    const pureGold = weightNum * purity;
    const totalValue = weightNum * priceNum;
    const meetsNisab = pureGold >= NISAB_GRAMS;
    const zakatDue = meetsNisab ? totalValue * ZAKAT_RATE : 0;
    setResult({
      pureGold: Math.round(pureGold * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      zakatDue: Math.round(zakatDue * 100) / 100,
      meetsNisab,
    });
  };

  return (
    <View style={styles.root}>
      <MobileTopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ToolPageHero
          badge={isArabic ? 'أداة ماسا' : 'MASA Tool'}
          subtitle={
            isArabic
              ? 'احسب زكاة الذهب وفقاً للنصاب وقيمة السوق'
              : 'Calculate your gold zakat based on nisab and market value'
          }
          title={t('tools.zakat.title')}
        />
        <ContentContainer>
          <MasaCard style={styles.card}>
            <Text style={styles.label}>{isArabic ? 'الوزن (جرام)' : 'Weight (grams)'}</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setWeight}
              placeholder="0.00"
              style={styles.input}
              value={weight}
            />
            <Text style={styles.label}>{isArabic ? 'العيار' : 'Gold Karat'}</Text>
            <View style={styles.chipRow}>
              {GOLD_KARATS.map((k) => (
                <MasaButton
                  key={k.value}
                  label={k.label.split(' ')[0]}
                  onPress={() => setKarat(k.value)}
                  variant={karat === k.value ? 'primary' : 'outline'}
                />
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>
                {isArabic ? 'مزامنة سعر السوق' : 'Sync to spot price'}
              </Text>
              <Switch onValueChange={setSyncPrice} value={syncPrice} />
            </View>
            <Text style={styles.label}>{isArabic ? 'سعر الغرام (ر.ق)' : 'Price per gram (QAR)'}</Text>
            <TextInput
              editable={!syncPrice}
              keyboardType="decimal-pad"
              onChangeText={setGoldPrice}
              style={styles.input}
              value={goldPrice}
            />
            <MasaButton label={isArabic ? 'احسب الزكاة' : 'Calculate Zakat'} onPress={calculate} />
          </MasaCard>
          {result ? (
            <MasaCard style={styles.card}>
              <Text style={[styles.resultTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
                {isArabic ? 'النتيجة' : 'Results'}
              </Text>
              <Text style={styles.resultLine}>
                {isArabic ? 'ذهب صافٍ:' : 'Pure gold:'} {result.pureGold}g
              </Text>
              <Text style={styles.resultLine}>
                {isArabic ? 'القيمة الإجمالية:' : 'Total value:'}{' '}
                {formatQar(result.totalValue, isArabic)}
              </Text>
              <Text style={styles.resultHighlight}>
                {isArabic ? 'الزكاة المستحقة:' : 'Zakat due:'}{' '}
                {formatQar(result.zakatDue, isArabic)}
              </Text>
              <Text style={styles.resultNote}>
                {result.meetsNisab
                  ? isArabic
                    ? 'بلغت ذهبك النصاب (85غ صافٍ).'
                    : 'Your gold meets nisab (85g pure).'
                  : isArabic
                    ? 'لم يبلغ الذهب النصاب — لا زكاة مستحقة.'
                    : 'Below nisab — no zakat due.'}
              </Text>
            </MasaCard>
          ) : null}
        </ContentContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: theme.colors.background, flex: 1 },
  card: { marginBottom: 16, marginTop: -24 },
  label: { color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  switchRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  resultTitle: { color: theme.colors.primary, fontSize: 20, marginBottom: 12 },
  resultLine: { color: theme.colors.masaGray, fontSize: 14, marginBottom: 6 },
  resultHighlight: { color: theme.colors.primary, fontSize: 18, fontWeight: '700', marginTop: 8 },
  resultNote: { color: theme.colors.masaGray, fontSize: 13, marginTop: 12 },
});
