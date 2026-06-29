/** Round glass button cycling System → Light → Dark. */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { useThemeMode } from '@/store/theme';
import { useTheme } from '@/theme/ThemeProvider';

export function ThemeToggle() {
  const { colors } = useTheme();
  const mode = useThemeMode((s) => s.mode);
  const cycle = useThemeMode((s) => s.cycle);

  const icon =
    mode === 'system' ? 'contrast-outline' : mode === 'light' ? 'sunny-outline' : 'moon-outline';
  const labels = { system: 'System', light: 'Light', dark: 'Dark' } as const;

  return (
    <Pressable
      onPress={cycle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${labels[mode]}. Tap to change.`}>
      <GlassSurface strong radius={999} style={styles.btn}>
        <Ionicons name={icon} size={20} color={colors.text} />
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
