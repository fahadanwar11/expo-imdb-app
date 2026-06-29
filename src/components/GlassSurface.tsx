/**
 * The base glass surface used by every card / sheet / bar (§6 recipe):
 *   1) BlurView base   2) translucent fill + hairline border   3) top highlight
 */
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children?: ReactNode;
  intensity?: number;
  radius?: number;
  /** Use a stronger fill for surfaces carrying small text. */
  strong?: boolean;
  /** Render the top glass-edge highlight. */
  highlight?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassSurface({ children, intensity, radius, strong, highlight = true, style }: Props) {
  const { colors, blur, radius: tokenRadius } = useTheme();
  const r = radius ?? tokenRadius.card;

  return (
    <View
      style={[
        {
          borderRadius: r,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        style,
      ]}>
      <BlurView
        intensity={intensity ?? blur.card}
        tint={colors.blurTint}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? colors.surfaceStrong : colors.surface },
        ]}
      />
      {highlight && (
        <LinearGradient colors={colors.highlight} style={styles.highlight} pointerEvents="none" />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%' },
});
