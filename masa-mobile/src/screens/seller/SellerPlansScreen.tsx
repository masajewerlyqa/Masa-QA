import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useTransition } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { SELLER_PLAN_LIMITS, type SellerPlanId } from '../../constants/sellerPlans';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import { goSellerApplication } from '../../lib/sellerNavigation';
import type { RootStackParamList } from '../../navigation/types';
import { goAuth } from '../../navigation/routes';
import { stashPreRegistrationSellerPlan } from '../../services/pendingSellerPlanStorage';
import { savePendingSellerPlan } from '../../services/sellerApplicationService';

function PlanCard({
  planId,
  highlighted,
  name,
  badge,
  description,
  features,
  feeLabel,
  commissionLabel,
  productLabel,
  ctaLabel,
  loading,
  onSelect,
  isArabic,
}: {
  planId: SellerPlanId;
  highlighted: boolean;
  name: string;
  badge: string;
  description: string;
  features: string[];
  feeLabel: string;
  commissionLabel: string;
  productLabel: string;
  ctaLabel: string;
  loading: boolean;
  onSelect: (id: SellerPlanId) => void;
  isArabic: boolean;
}): React.JSX.Element {
  const limits = SELLER_PLAN_LIMITS[planId];
  const luxury = fontFamily(isArabic, 'luxury');

  return (
    <MasaCard
      style={
        highlighted
          ? { ...styles.planCard, ...styles.planCardHighlighted }
          : styles.planCard
      }
    >
      <Text style={[textStyle(isArabic, 'caption'), styles.planBadge]}>{badge}</Text>
      <Text style={[styles.planName, { fontFamily: luxury }]}>{name}</Text>
      <Text style={textStyle(isArabic, 'body')}>{description}</Text>
      <View style={styles.featureList}>
        {features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Check color={theme.colors.primary} size={16} />
            <Text style={[textStyle(isArabic, 'bodySm'), styles.featureText]}>{f}</Text>
          </View>
        ))}
      </View>
      <View style={styles.limitsBox}>
        <View style={styles.limitRow}>
          <Text style={textStyle(isArabic, 'caption')}>{productLabel}</Text>
          <Text style={textStyle(isArabic, 'bodySm')}>
            {limits.maxProducts === null ? '∞' : limits.maxProducts}
          </Text>
        </View>
        <View style={styles.limitRow}>
          <Text style={textStyle(isArabic, 'caption')}>{feeLabel}</Text>
          <Text style={textStyle(isArabic, 'bodySm')}>
            {limits.registrationFeeQar.toLocaleString()} QAR
          </Text>
        </View>
        <View style={styles.limitRow}>
          <Text style={textStyle(isArabic, 'caption')}>{commissionLabel}</Text>
          <Text style={textStyle(isArabic, 'bodySm')}>{limits.commissionPercent}%</Text>
        </View>
      </View>
      <MasaButton
        disabled={loading}
        label={ctaLabel}
        onPress={() => onSelect(planId)}
        variant={highlighted ? 'primary' : 'outline'}
      />
    </MasaCard>
  );
}

export function SellerPlansScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, tList, isArabic } = useSettings();
  const { user } = useAuth();
  const luxury = fontFamily(isArabic, 'luxury');
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<SellerPlanId | null>(null);
  const [isPending, startTransition] = useTransition();

  const isRegistrationFlow = !user;
  const title = isRegistrationFlow
    ? t('auth.register.sellerPickPlanTitle')
    : t('sellerOnboarding.choosePlanTitle');
  const subtitle = isRegistrationFlow
    ? t('auth.register.sellerPickPlanSubtitle')
    : t('sellerOnboarding.choosePlanSubtitle');

  const basicList = tList('sellerOnboarding.basicFeatures');
  const premiumList = tList('sellerOnboarding.premiumFeatures');

  const handleSelect = (planId: SellerPlanId): void => {
    setError(null);
    setPendingId(planId);

    if (!user) {
      startTransition(() => {
        void stashPreRegistrationSellerPlan(planId).then(() => {
          setPendingId(null);
          goAuth({ mode: 'signup', intent: 'seller' });
        });
      });
      return;
    }

    startTransition(() => {
      void savePendingSellerPlan(planId).then((res) => {
        if (!res.ok) {
          setError(
            res.error === 'Not signed in'
              ? isArabic
                ? 'يرجى تسجيل الدخول لاختيار خطة.'
                : 'Please sign in to select a plan.'
              : res.error,
          );
          setPendingId(null);
          return;
        }
        goSellerApplication();
        setPendingId(null);
      });
    });
  };

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {navigation.canGoBack() ? (
          <MasaButton
            label={t('auth.register.changeAccountType')}
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
        ) : null}
        <Text style={[textStyle(isArabic, 'caption'), styles.eyebrow]}>
          {t('sellerOnboarding.choosePlanEyebrow')}
        </Text>
        <Text style={[styles.title, { fontFamily: luxury }]}>{title}</Text>
        <Text style={[textStyle(isArabic, 'body'), styles.subtitle]}>{subtitle}</Text>
        <Text style={[textStyle(isArabic, 'bodySm'), styles.trust]}>
          {isRegistrationFlow
            ? t('auth.register.sellerNextStep')
            : t('sellerOnboarding.trustNote')}
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <PlanCard
          badge={t('sellerOnboarding.basicBadge')}
          commissionLabel={t('sellerOnboarding.commission')}
          ctaLabel={
            isPending && pendingId === 'basic'
              ? t('sellerOnboarding.selectingPlan')
              : t('sellerOnboarding.selectPlan')
          }
          description={t('sellerOnboarding.basicDesc')}
          features={basicList}
          feeLabel={t('sellerOnboarding.registrationFee')}
          highlighted={false}
          isArabic={isArabic}
          loading={isPending && pendingId === 'basic'}
          name={t('sellerOnboarding.basicName')}
          onSelect={handleSelect}
          planId="basic"
          productLabel={t('sellerOnboarding.productLimit')}
        />
        <PlanCard
          badge={t('sellerOnboarding.premiumBadge')}
          commissionLabel={t('sellerOnboarding.commission')}
          ctaLabel={
            isPending && pendingId === 'premium'
              ? t('sellerOnboarding.selectingPlan')
              : t('sellerOnboarding.selectPlan')
          }
          description={t('sellerOnboarding.premiumDesc')}
          features={premiumList}
          feeLabel={t('sellerOnboarding.registrationFee')}
          highlighted
          isArabic={isArabic}
          loading={isPending && pendingId === 'premium'}
          name={t('sellerOnboarding.premiumName')}
          onSelect={handleSelect}
          planId="premium"
          productLabel={t('sellerOnboarding.productLimit')}
        />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
  },
  eyebrow: {
    color: theme.colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.primary,
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.masaGray,
    textAlign: 'center',
  },
  trust: {
    color: theme.colors.masaGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  planCard: { gap: 12 },
  planCardHighlighted: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  planBadge: { color: theme.colors.primary },
  planName: {
    color: theme.colors.primary,
    fontSize: 22,
    lineHeight: 28,
  },
  featureList: { gap: 8 },
  featureRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  featureText: { flex: 1 },
  limitsBox: {
    backgroundColor: theme.colors.masaLight,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 12,
  },
  errorText: { color: '#991b1b', fontSize: 14 },
});
