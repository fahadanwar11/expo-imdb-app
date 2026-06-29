/** Rail / section header: title with optional trailing action. */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <AppText variant="h2">{title}</AppText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action} accessibilityRole="button">
          <AppText variant="captionMedium" color={colors.accentText}>
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.accentText} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
