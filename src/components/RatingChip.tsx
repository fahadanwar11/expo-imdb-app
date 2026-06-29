/** Small rating pill (star + score) shown over posters and on the hero. */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

type Props = {
  rating: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

export function RatingChip({ rating, size = 'md', style }: Props) {
  const { colors } = useTheme();
  if (!rating || rating <= 0) return null;
  const sm = size === 'sm';

  return (
    <View
      style={[
        styles.pill,
        { paddingHorizontal: sm ? 6 : 8, paddingVertical: sm ? 2 : 4 },
        style,
      ]}
      accessibilityLabel={`Rated ${rating.toFixed(1)} out of 10`}>
      <Ionicons name="star" size={sm ? 10 : 12} color={colors.accent} />
      <Text style={[styles.text, { fontSize: sm ? 11 : 13 }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(7,10,18,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  text: { color: '#F5F7FA', fontFamily: fonts.numerals },
});
