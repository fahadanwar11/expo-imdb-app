/** Selectable / removable glass pill used for filters and genres. */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Show a trailing ✕; calls onRemove when tapped. */
  onRemove?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected, onPress, onRemove, icon, style }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.accent : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {icon && (
        <Ionicons name={icon} size={14} color={selected ? '#0A0F1E' : colors.textDim} />
      )}
      <AppText
        variant="captionMedium"
        color={selected ? '#0A0F1E' : colors.text}>
        {label}
      </AppText>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={16} accessibilityLabel={`Remove ${label} filter`}>
          <View style={styles.remove}>
            <Ionicons name="close" size={13} color={selected ? '#0A0F1E' : colors.textDim} />
          </View>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  remove: { marginLeft: 1 },
});
