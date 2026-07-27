import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MobileFooter } from '../components/MobileFooter';
import { MobileTopBar } from '../components/MobileTopBar';
import { MasaCard } from '../components/MasaCard';
import { PageContainer } from '../components/PageContainer';
import { SectionHeader } from '../components/SectionHeader';
import { theme } from '../constants/theme';

const notifications = [
  {
    id: 'n1',
    title: 'Order #MASA-2041 is being prepared',
    subtitle: 'We will notify you once shipped.',
  },
  {
    id: 'n2',
    title: 'Exclusive offer available now',
    subtitle: 'Limited-time offer from verified sellers.',
  },
];

export function NotificationsScreen(): React.JSX.Element {
  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MobileTopBar />
        <SectionHeader
          title="Notifications"
          subtitle="Your MASA account notifications."
        />
        {notifications.map((item) => (
          <MasaCard key={item.id} style={styles.card}>
            <View style={styles.row}>
              <Ionicons color={theme.colors.primary} name="notifications-outline" size={18} />
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </MasaCard>
        ))}
        <MobileFooter />
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
  textBlock: {
    flex: 1,
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
});
