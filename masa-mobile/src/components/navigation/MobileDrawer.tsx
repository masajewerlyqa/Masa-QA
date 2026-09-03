import {
  Building2,
  Calculator,
  Coins,
  Heart,
  HelpCircle,
  Phone,
  RotateCcw,
  Ruler,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  X,
} from 'lucide-react-native';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { webAssets } from '../../constants/assets';
import { CurrencyDropdown } from '../ui/CurrencyDropdown';
import { LanguageDropdown } from '../ui/LanguageDropdown';
import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import {
  goAdvisor,
  goAuth,
  goCart,
  goDiscover,
  goHome,
  goInfo,
  goMarketPrices,
  goSellGold,
  goWishlist,
  goZakat,
} from '../../navigation/routes';
import { sitePages } from '../../constants/siteMap';

type MobileDrawerProps = {
  visible: boolean;
  onClose: () => void;
  cartCount?: number;
  wishlistCount?: number;
};

export function MobileDrawer({
  visible,
  onClose,
  cartCount = 0,
  wishlistCount = 0,
}: MobileDrawerProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t, isArabic } = useSettings();
  const { user } = useAuth();

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <View
          style={[
            styles.panel,
            isArabic ? styles.panelRtl : styles.panelLtr,
            { paddingTop: insets.top },
          ]}
        >
          <View style={styles.panelHeader}>
            <Pressable onPress={() => { onClose(); goHome(); }}>
              <Image resizeMode="contain" source={webAssets.logoNav} style={styles.drawerLogo} />
            </Pressable>
            <Pressable accessibilityLabel={t('navbar.closeMenu')} onPress={onClose} style={styles.closeBtn}>
              <X color={theme.colors.masaDark} size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[textStyle(isArabic, 'menuSection'), styles.sectionLabel]}>
              {t('navbar.account')}
            </Text>
            {!user ? (
              <DrawerLink
                icon={User}
                isArabic={isArabic}
                label={t('auth.register.signIn')}
                onPress={() => { onClose(); goAuth(); }}
              />
            ) : (
              <View style={styles.profileCard}>
                <Text style={textStyle(isArabic, 'caption')}>{t('mobileNav.profile')}</Text>
                <Text numberOfLines={1} style={[textStyle(isArabic, 'bodySm'), styles.profileName]}>
                  {(user.user_metadata?.full_name as string | undefined)?.trim() ||
                    user.email ||
                    '—'}
                </Text>
              </View>
            )}

            <DrawerLink icon={Search} isArabic={isArabic} label={t('navbar.marketplace')} onPress={() => { onClose(); goDiscover(); }} />
            <DrawerLink icon={TrendingUp} isArabic={isArabic} label={t('navbar.marketPrices')} onPress={() => { onClose(); goMarketPrices(); }} />
            <DrawerLink icon={Building2} isArabic={isArabic} label={t('navbar.about')} onPress={() => { onClose(); goInfo(sitePages.about); }} />
            <DrawerLink
              count={wishlistCount}
              icon={Heart}
              isArabic={isArabic}
              label={t('navbar.wishlist')}
              onPress={() => { onClose(); goWishlist(); }}
            />
            <DrawerLink
              count={cartCount}
              icon={ShoppingCart}
              isArabic={isArabic}
              label={t('navbar.cart')}
              onPress={() => { onClose(); goCart(); }}
            />

            <View style={styles.divider} />

            <Text style={[textStyle(isArabic, 'menuSection'), styles.sectionLabel]}>{t('navbar.tools')}</Text>
            <DrawerLink icon={Sparkles} isArabic={isArabic} label={t('navbar.aiAdvisor')} onPress={() => { onClose(); goAdvisor(); }} />
            <DrawerLink icon={Calculator} isArabic={isArabic} label={t('navbar.zakat')} onPress={() => { onClose(); goZakat(); }} />
            <DrawerLink icon={Coins} isArabic={isArabic} label={t('navbar.sellGold')} onPress={() => { onClose(); goSellGold(); }} />

            <View style={styles.divider} />

            <Text style={[textStyle(isArabic, 'menuSection'), styles.sectionLabel]}>{t('navbar.support')}</Text>
            <DrawerLink icon={Ruler} isArabic={isArabic} label={t('navbar.sizeGuide')} onPress={() => { onClose(); goInfo(sitePages.sizeGuide); }} />
            <DrawerLink icon={Truck} isArabic={isArabic} label={t('navbar.shipping')} onPress={() => { onClose(); goInfo(sitePages.delivery); }} />
            <DrawerLink icon={RotateCcw} isArabic={isArabic} label={t('navbar.returns')} onPress={() => { onClose(); goInfo(sitePages.returns); }} />
            <DrawerLink icon={Phone} isArabic={isArabic} label={t('navbar.contact')} onPress={() => { onClose(); goInfo(sitePages.contact); }} />
            <DrawerLink icon={HelpCircle} isArabic={isArabic} label={t('navbar.faq')} onPress={() => { onClose(); goInfo(sitePages.faq); }} />

            <View style={styles.divider} />

            <View style={styles.prefsRow}>
              <LanguageDropdown onSelected={onClose} />
              <CurrencyDropdown onSelected={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DrawerLink({
  icon: Icon,
  label,
  count,
  onPress,
  isArabic,
}: {
  icon: typeof User;
  label: string;
  count?: number;
  onPress: () => void;
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.drawerLink}>
      <Icon color={theme.colors.primary} size={20} />
      <Text style={[textStyle(isArabic, 'menuLabel'), styles.drawerLinkText]}>{label}</Text>
      {count != null && count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, flexDirection: 'row' },
  panel: {
    backgroundColor: theme.colors.white,
    maxWidth: 384,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    width: '85%',
  },
  panelLtr: { alignSelf: 'flex-start' },
  panelRtl: { alignSelf: 'flex-end' },
  panelHeader: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  drawerLogo: { height: 40, width: 160 },
  closeBtn: { padding: 8 },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionLabel: { marginBottom: 8, paddingHorizontal: 12 },
  profileCard: {
    backgroundColor: 'rgba(247,243,238,0.8)',
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  profileName: { color: theme.colors.masaDark, marginTop: 4 },
  drawerLink: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  drawerLinkText: { flex: 1 },
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 6,
  },
  badgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '700' },
  divider: { backgroundColor: theme.colors.border, height: 1, marginVertical: 16 },
  prefsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
});
