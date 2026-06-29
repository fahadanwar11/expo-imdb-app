/**
 * Full-bleed, swipeable hero of trending titles (§3.1): backdrop + gradient
 * scrim, title, genres, rating, and a +Wishlist toggle. Paging dots below.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { RatingChip } from '@/components/RatingChip';
import { BACKDROP_BLURHASH } from '@/lib/constants';
import { useIsWished, useWishlist } from '@/store/wishlist';
import { useTheme } from '@/theme/ThemeProvider';
import type { Title } from '@/types';

type Props = {
  titles: Title[];
  genreById?: Record<number, string>;
};

// Stable across renders — FlatList requires viewability config not to change.
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

export function HeroCarousel({ titles, genreById }: Props) {
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const [active, setActive] = useState(0);

  const heroHeight = Math.min(Math.round(height * 0.56), 470);
  const slides = titles.filter((t) => t.backdrop).slice(0, 6);

  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActive(viewableItems[0].index);
    }
  }, []);

  if (slides.length === 0) return null;

  return (
    <View style={{ height: heroHeight + 20 }}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.mediaType}-${item.id}`}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewable}
        renderItem={({ item }) => (
          <HeroSlide title={item} width={width} height={heroHeight} genreById={genreById} />
        )}
      />
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View
            key={`${s.mediaType}-${s.id}`}
            style={[
              styles.dot,
              {
                width: i === active ? 18 : 6,
                backgroundColor: i === active ? colors.accent : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function HeroSlide({
  title,
  width,
  height,
  genreById,
}: {
  title: Title;
  width: number;
  height: number;
  genreById?: Record<number, string>;
}) {
  const router = useRouter();
  const genres = (title.genreIds ?? [])
    .map((id) => genreById?.[id])
    .filter(Boolean)
    .slice(0, 3)
    .join(' · ');

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/title/[id]', params: { id: String(title.id), mediaType: title.mediaType } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${title.title}. Open details.`}
      style={{ width, height }}>
      <Image
        source={{ uri: title.backdrop }}
        placeholder={{ blurhash: BACKDROP_BLURHASH }}
        contentFit="cover"
        transition={260}
        cachePolicy="memory-disk"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(7,10,18,0)', 'rgba(7,10,18,0.55)', 'rgba(7,10,18,0.96)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>
        <AppText variant="overline" color="rgba(245,247,250,0.7)">
          {title.mediaType === 'tv' ? 'Trending Series' : 'Trending'}
        </AppText>
        <AppText variant="display" color="#F5F7FA" numberOfLines={2}>
          {title.title}
        </AppText>
        {genres ? (
          <AppText variant="captionMedium" color="rgba(245,247,250,0.75)">
            {genres}
          </AppText>
        ) : null}
        <View style={styles.row}>
          <RatingChip rating={title.rating} />
          {title.year ? (
            <AppText variant="captionMedium" color="rgba(245,247,250,0.75)">
              {title.year}
            </AppText>
          ) : null}
          <View style={{ flex: 1 }} />
          <HeroWishButton title={title} />
        </View>
      </View>
    </Pressable>
  );
}

function HeroWishButton({ title }: { title: Title }) {
  const { colors } = useTheme();
  const saved = useIsWished(title.id);
  const toggle = useWishlist((s) => s.toggle);
  const onPress = () => {
    toggle(title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      style={[
        styles.wishBtn,
        {
          backgroundColor: saved ? colors.accent : 'rgba(7,10,18,0.55)',
          borderColor: saved ? colors.accent : 'rgba(255,255,255,0.18)',
        },
      ]}>
      <Ionicons name={saved ? 'heart' : 'add'} size={16} color={saved ? '#0A0F1E' : '#F5F7FA'} />
      <AppText variant="captionMedium" color={saved ? '#0A0F1E' : '#F5F7FA'}>
        {saved ? 'Saved' : 'Wishlist'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { position: 'absolute', left: 20, right: 20, bottom: 30, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  wishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dots: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  dot: { height: 6, borderRadius: 999 },
});
