/** Friendly error + empty states (§9). */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TmdbError, MISSING_KEY_MESSAGE } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

export function errorMessage(error: unknown): string {
  if (error instanceof TmdbError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

type ErrorStateProps = {
  error?: unknown;
  onRetry?: () => void;
  /** Compact inline variant for rails. */
  compact?: boolean;
};

export function ErrorState({ error, onRetry, compact }: ErrorStateProps) {
  const { colors } = useTheme();
  const message = errorMessage(error);
  const isKeyError = message === MISSING_KEY_MESSAGE;

  return (
    <View style={[styles.container, compact ? styles.compact : styles.full]}>
      <Ionicons
        name={isKeyError ? 'key-outline' : 'cloud-offline-outline'}
        size={compact ? 28 : 40}
        color={colors.textDim}
      />
      <AppText variant={compact ? 'caption' : 'body'} dim center>
        {message}
      </AppText>
      {onRetry && (
        <Button label="Try again" variant="glass" icon="refresh" onPress={onRetry} />
      )}
    </View>
  );
}

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'sparkles-outline', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, styles.full]}>
      <View style={[styles.iconHalo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name={icon} size={36} color={colors.accentText} />
      </View>
      <AppText variant="h1" center>
        {title}
      </AppText>
      {subtitle && (
        <AppText variant="body" dim center style={styles.subtitle}>
          {subtitle}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 14 },
  full: { flex: 1, paddingHorizontal: 40, paddingVertical: 48 },
  compact: { height: 198, width: 260, gap: 10, paddingHorizontal: 16 },
  iconHalo: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  subtitle: { maxWidth: 300 },
  cta: { marginTop: 8, alignSelf: 'stretch' },
});
