/** App button: solid accent (primary), frosted glass, or ghost. */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassSurface } from '@/components/GlassSurface';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'primary' | 'glass' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, style, accessibilityLabel }: Props) {
  const { colors, radius } = useTheme();
  const onAccent = '#0A0F1E';
  const contentColor = variant === 'primary' ? onAccent : colors.text;

  const inner = (
    <View style={styles.row}>
      {icon && <Ionicons name={icon} size={18} color={contentColor} />}
      <AppText variant="title" color={contentColor}>
        {label}
      </AppText>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.88 : 1 }, style]}>
      {variant === 'glass' ? (
        <GlassSurface strong radius={radius.chip} style={styles.glass}>
          {inner}
        </GlassSurface>
      ) : (
        <View
          style={[
            styles.solid,
            {
              borderRadius: radius.chip,
              backgroundColor: variant === 'primary' ? colors.accent : 'transparent',
              borderWidth: variant === 'ghost' ? StyleSheet.hairlineWidth : 0,
              borderColor: colors.border,
            },
          ]}>
          {inner}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  solid: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  glass: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
});
