import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MasaCard } from '../components/MasaCard';
import { MobileTopBar } from '../components/MobileTopBar';
import { PageContainer } from '../components/PageContainer';
import { SectionHeader } from '../components/SectionHeader';
import { fontFamily, theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { goAdvisor, goSellGold, goZakat } from '../navigation/routes';

const tools = [
  {
    id: 'advisor',
    icon: 'sparkles-outline' as const,
    titleKey: 'home.advisorTitle',
    descKey: 'home.advisorDesc',
    action: goAdvisor,
  },
  {
    id: 'zakat',
    icon: 'calculator-outline' as const,
    titleKey: 'home.zakatTitle',
    descKey: 'home.zakatDesc',
    action: goZakat,
  },
  {
    id: 'sell',
    icon: 'cash-outline' as const,
    titleKey: 'home.sellTitle',
    descKey: 'home.sellDesc',
    action: goSellGold,
  },
];

export function ToolsScreen(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  return (
    <PageContainer>
      <MobileTopBar />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader
          subtitle={t('home.smartSubtitle')}
          title={t('home.smartTitle')}
        />
        {tools.map((tool) => (
          <Pressable key={tool.id} onPress={tool.action}>
            <MasaCard style={styles.toolCard}>
              <View style={styles.toolIconWrap}>
                <Ionicons color={theme.colors.primary} name={tool.icon} size={28} />
              </View>
              <Text style={[styles.toolTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
                {t(tool.titleKey)}
              </Text>
              <Text style={styles.toolDesc}>{t(tool.descKey)}</Text>
            </MasaCard>
          </Pressable>
        ))}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48, paddingTop: theme.spacing.lg },
  toolCard: { marginBottom: theme.spacing.lg, padding: theme.spacing.xl },
  toolIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(83,28,36,0.1)',
    borderRadius: theme.radius.xl,
    height: 56,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    width: 56,
  },
  toolTitle: { color: theme.colors.masaDark, fontSize: 20, marginBottom: 8 },
  toolDesc: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22 },
});
