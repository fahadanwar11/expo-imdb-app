import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { GlassSurface } from '@/components/GlassSurface';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState } from '@/components/StateViews';
import { TitleGrid } from '@/components/TitleGrid';
import { useWishlist, useWishlistItems, type WishItem } from '@/store/wishlist';
import { useTheme } from '@/theme/ThemeProvider';
import type { Title, TypeFilter } from '@/types';

type SortKey = 'recent' | 'rating';

const TYPE_OPTIONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV' },
];

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const items = useWishlistItems();
  const remove = useWishlist((s) => s.remove);
  const restore = useWishlist((s) => s.restore);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [undoItem, setUndoItem] = useState<WishItem | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear a pending undo timer if the screen unmounts mid-window.
  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  const visible = useMemo(() => {
    return items
      .filter((t) => typeFilter === 'all' || t.mediaType === typeFilter)
      .sort((a, b) => (sort === 'rating' ? b.rating - a.rating : b.addedAt - a.addedAt));
  }, [items, typeFilter, sort]);

  const dismissUndo = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoItem(null);
  };
  const removeWithUndo = (item: Title) => {
    const wishItem = item as WishItem; // runtime value comes from the wishlist store
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    remove(wishItem.id);
    setUndoItem(wishItem);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoItem(null), 4000);
  };
  const onUndo = () => {
    if (undoItem) restore(undoItem);
    dismissUndo();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + 8 }]}>
      <ScreenHeader
        title="Wishlist"
        subtitle={items.length ? `${items.length} saved title${items.length === 1 ? '' : 's'}` : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Your wishlist is empty"
          subtitle="Tap the heart on any title to save it here. Your list is stored on this device and survives restarts."
          actionLabel="Browse titles"
          onAction={() => router.navigate('/')}
        />
      ) : (
        <>
          <View style={styles.controls}>
            <View style={styles.row}>
              {TYPE_OPTIONS.map((o) => (
                <Chip
                  key={o.key}
                  label={o.label}
                  selected={typeFilter === o.key}
                  onPress={() => setTypeFilter(o.key)}
                />
              ))}
            </View>
            <Chip
              label={sort === 'recent' ? 'Recent' : 'Rating'}
              icon={sort === 'recent' ? 'time-outline' : 'star-outline'}
              onPress={() => setSort((s) => (s === 'recent' ? 'rating' : 'recent'))}
            />
          </View>

          <TitleGrid
            titles={visible}
            contentContainerStyle={{ paddingBottom: 110 }}
            onItemLongPress={removeWithUndo}
            ListEmptyComponent={
              <EmptyState icon="filter-outline" title="Nothing here" subtitle="No saved titles of this type." />
            }
          />
        </>
      )}

      {undoItem && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={[styles.toastWrap, { bottom: insets.bottom + 90 }]}>
          <GlassSurface strong radius={16} style={styles.toast}>
            <Ionicons name="trash-outline" size={18} color={colors.textDim} />
            <AppText variant="captionMedium" numberOfLines={1} style={styles.toastText}>
              Removed “{undoItem.title}”
            </AppText>
            <Pressable onPress={onUndo} hitSlop={12} accessibilityRole="button">
              <AppText variant="title" color={colors.accentText}>
                Undo
              </AppText>
            </Pressable>
          </GlassSurface>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  row: { flexDirection: 'row', gap: 8 },
  toastWrap: { position: 'absolute', left: 16, right: 16 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  toastText: { flex: 1 },
});
