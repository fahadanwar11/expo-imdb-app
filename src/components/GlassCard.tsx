/**
 * The signature interactive poster card (§8): press scale + colored glow,
 * blurhash placeholder, bottom scrim, title + rating overlay, wishlist heart.
 * Reused across rails, the search grid, wishlist and "More like this".
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { RatingChip } from '@/components/RatingChip';
import { WishlistHeart } from '@/components/WishlistHeart';
import { POSTER_BLURHASH } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Title } from '@/types';

type Props = {
  title: Title;
  /** Fixed width (rail). Omit inside a flex grid cell. */
  width?: number;
  showHeart?: boolean;
  /** Stagger index for entering animation. */
  index?: number;
  /** Optional long-press (e.g. remove-from-wishlist). */
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function GlassCardBase({ title, width, showHeart = true, index = 0, onLongPress, style }: Props) {
  const { colors, radius } = useTheme();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.955]) }],
    shadowOpacity: interpolate(press.value, [0, 1], [0.18, 0.55]),
    shadowRadius: interpolate(press.value, [0, 1], [8, 20]),
    elevation: interpolate(press.value, [0, 1], [3, 10]),
  }));

  const onPressIn = () => {
    if (!reduceMotion) press.value = withSpring(1, { damping: 18, stiffness: 260 });
  };
  const onPressOut = () => {
    if (!reduceMotion) press.value = withSpring(0, { damping: 18, stiffness: 260 });
  };
  const open = () =>
    router.push({ pathname: '/title/[id]', params: { id: String(title.id), mediaType: title.mediaType } });

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.delay(Math.min(index, 8) * 35).duration(280)}
      style={[
        styles.shadowWrap,
        { width, borderRadius: radius.card, shadowColor: colors.accent2 },
        animatedStyle,
        style,
      ]}>
      <Pressable
        onPress={open}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${title.title}${title.year ? `, ${title.year}` : ''}${
          title.rating > 0 ? `, rated ${title.rating.toFixed(1)} out of 10` : ''
        }. Open details.`}
        accessibilityHint={onLongPress ? 'Long press to remove from wishlist' : undefined}
        style={[styles.clip, { borderRadius: radius.card, borderColor: colors.border }]}>
        <View style={[styles.poster, { backgroundColor: colors.skeleton }]}>
          {title.poster ? (
            <Image
              source={{ uri: title.poster }}
              placeholder={{ blurhash: POSTER_BLURHASH }}
              contentFit="cover"
              transition={220}
              cachePolicy="memory-disk"
              recyclingKey={String(title.id)}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={styles.noPoster}>
              <Ionicons name="film-outline" size={28} color={colors.textDim} />
            </View>
          )}

          <LinearGradient
            colors={['rgba(7,10,18,0)', 'rgba(7,10,18,0.85)']}
            locations={[0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {showHeart && (
            <WishlistHeart title={title} size={20} style={styles.heart} />
          )}

          <View style={styles.caption}>
            <AppText variant="title" numberOfLines={2} color="#F5F7FA">
              {title.title}
            </AppText>
            <View style={styles.meta}>
              <RatingChip rating={title.rating} size="sm" />
              {title.year ? (
                <AppText variant="caption" color="rgba(245,247,250,0.75)">
                  {title.year}
                </AppText>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowOffset: { width: 0, height: 6 },
  },
  clip: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  noPoster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: { position: 'absolute', top: 8, right: 8 },
  caption: { position: 'absolute', left: 10, right: 10, bottom: 10, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

export const GlassCard = memo(GlassCardBase);
