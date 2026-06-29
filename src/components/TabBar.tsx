/** Floating, frosted-glass bottom tab bar (§2). */
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { GlassSurface } from '@/components/GlassSurface';
import { useWishlistCount } from '@/store/wishlist';
import { useTheme } from '@/theme/ThemeProvider';

type TabMeta = { label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap };

const TABS: Record<string, TabMeta> = {
  index: { label: 'Discover', icon: 'compass-outline', activeIcon: 'compass' },
  search: { label: 'Search', icon: 'search-outline', activeIcon: 'search' },
  wishlist: { label: 'Wishlist', icon: 'heart-outline', activeIcon: 'heart' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, blur, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const wishCount = useWishlistCount();

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none">
      <GlassSurface intensity={blur.tabbar} strong radius={radius.sheet} style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          const color = focused ? colors.accentText : colors.textDim;
          const showBadge = route.name === 'wishlist' && wishCount > 0;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              style={styles.tab}>
              <View>
                <Ionicons name={focused ? meta.activeIcon : meta.icon} size={24} color={color} />
                {showBadge && (
                  <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.bg }]}>
                    <AppText style={styles.badgeText}>{wishCount > 99 ? '99+' : wishCount}</AppText>
                  </View>
                )}
              </View>
              <AppText variant="overline" color={color} style={styles.label}>
                {meta.label}
              </AppText>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 2 },
  label: { letterSpacing: 0.4 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: { color: '#0A0F1E', fontSize: 10, fontWeight: '700' },
});
