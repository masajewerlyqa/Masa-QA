import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Heart, Home, Search, ShoppingBag, User } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { CartScreen } from '../screens/CartScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcon = {
  Home,
  Discover: Search,
  Wishlist: Heart,
  Cart: ShoppingBag,
  Profile: User,
} as const;

function TabIcon({
  name,
  color,
  focused,
  badge,
}: {
  name: keyof MainTabParamList;
  color: string;
  focused: boolean;
  badge?: number;
}): React.JSX.Element {
  const Icon = tabIcon[name];
  return (
    <View style={styles.iconWrap}>
      {focused ? <View style={styles.activeBar} /> : null}
      <View>
        <Icon color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
        {badge != null && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function MainTabs(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.count);

  const screenOptions = ({
    route,
  }: {
    route: { name: keyof MainTabParamList };
  }): BottomTabNavigationOptions => ({
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.masaGray,
    tabBarStyle: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderTopColor: theme.colors.border,
      height: 64 + insets.bottom,
      paddingBottom: insets.bottom,
      paddingTop: 6,
    },
    tabBarLabel: ({ focused, color, children }) => (
      <Text
        style={[
          textStyle(isArabic, 'navLabel'),
          { color, fontWeight: focused ? '600' : '500' },
        ]}
      >
        {children}
      </Text>
    ),
    tabBarIcon: ({ color, focused }) => (
      <TabIcon
        badge={route.name === 'Cart' ? cartCount : route.name === 'Wishlist' ? wishlistCount : undefined}
        color={color}
        focused={focused}
        name={route.name}
      />
    ),
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen component={HomeScreen} name="Home" options={{ title: t('mobileNav.home') }} />
      <Tab.Screen
        component={CategoriesScreen}
        name="Discover"
        options={{ title: t('mobileNav.discover') }}
      />
      <Tab.Screen
        component={WishlistScreen}
        name="Wishlist"
        options={{ title: t('mobileNav.wishlist') }}
      />
      <Tab.Screen component={CartScreen} name="Cart" options={{ title: t('mobileNav.cart') }} />
      <Tab.Screen
        component={ProfileScreen}
        name="Profile"
        options={{ title: t('mobileNav.profile') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    width: '100%',
  },
  activeBar: {
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    height: 2,
    position: 'absolute',
    top: -6,
    width: 32,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -10,
    top: -6,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
