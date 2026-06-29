/** Animated wishlist toggle — bounce + fill, persists instantly, with haptics. */
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { useIsWished, useWishlist } from '@/store/wishlist';
import type { Title } from '@/types';

type Props = {
  title: Title;
  size?: number;
  /** Color of the outline (unsaved) heart — defaults to white for over-image use. */
  unsavedColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function WishlistHeart({ title, size = 22, unsavedColor = '#FFFFFF', style }: Props) {
  const { colors } = useTheme();
  const saved = useIsWished(title.id);
  const toggle = useWishlist((s) => s.toggle);
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPress = () => {
    toggle(title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!reduceMotion) {
      scale.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 220 }),
        withSpring(1, { damping: 12, stiffness: 180 }),
      );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? `Remove ${title.title} from wishlist` : `Add ${title.title} to wishlist`}>
      <Animated.View style={[animatedStyle, style]}>
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={size}
          color={saved ? colors.accent : unsavedColor}
        />
      </Animated.View>
    </Pressable>
  );
}
