import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MobileTopBar } from '../components/MobileTopBar';
import { MasaCard } from '../components/MasaCard';
import { PageContainer } from '../components/PageContainer';
import { SectionHeader } from '../components/SectionHeader';
import { infoPages } from '../constants/infoPages';
import { sitePages } from '../constants/siteMap';
import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { goInfo } from '../navigation/routes';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

const channels = [
  { id: 'chat', title: 'Live Chat', subtitle: 'Instant support from MASA team', icon: 'chatbubble-outline' },
  { id: 'email', title: 'Email Support', subtitle: 'support@masa.com', icon: 'mail-outline' },
  { id: 'call', title: 'Phone', subtitle: '+974 0000 0000', icon: 'call-outline' },
] as const;

const supportLinks = [
  { page: sitePages.sizeGuide, labelKey: 'footer.supportLinks.sizeGuide' },
  { page: sitePages.delivery, labelKey: 'footer.supportLinks.delivery' },
  { page: sitePages.returns, labelKey: 'footer.supportLinks.returns' },
  { page: sitePages.contact, labelKey: 'footer.supportLinks.contactUs' },
  { page: sitePages.faq, labelKey: 'footer.supportLinks.faq' },
] as const;

export function SupportScreen(): React.JSX.Element {
  const { t, language } = useSettings();
  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.count);

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MobileTopBar cartCount={cartCount} wishlistCount={wishlistCount} />
        <SectionHeader
          title={t('navbar.support')}
          subtitle={infoPages.contact[language].intro}
        />
        {channels.map((channel) => (
          <MasaCard key={channel.id} style={styles.card}>
            <View style={styles.row}>
              <Ionicons color={theme.colors.primary} name={channel.icon} size={18} />
              <View>
                <Text style={styles.title}>{channel.title}</Text>
                <Text style={styles.subtitle}>{channel.subtitle}</Text>
              </View>
            </View>
          </MasaCard>
        ))}
        <MasaCard style={styles.card}>
          <Text style={styles.groupTitle}>{t('footer.support')}</Text>
          {supportLinks.map((item) => (
            <Pressable key={item.page.pageKey} onPress={() => goInfo(item.page)}>
              <Text style={styles.linkItem}>{t(item.labelKey)}</Text>
            </Pressable>
          ))}
        </MasaCard>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.xs,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.bodyLg,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.masaGray,
    fontSize: theme.typography.sizes.body,
    marginTop: 2,
  },
  groupTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.bodyLg,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  linkItem: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.body,
    marginBottom: theme.spacing.xs,
  },
});
