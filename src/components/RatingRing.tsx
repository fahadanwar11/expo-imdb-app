/** Circular rating ring (detail screen). Color reflects the score. */
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';
import { AppText } from '@/components/AppText';

function ratingColor(rating: number): string {
  if (rating >= 7) return '#4ADE80';
  if (rating >= 5) return '#FFC857';
  return '#FB7185';
}

type Props = {
  rating: number;
  size?: number;
  stroke?: number;
};

export function RatingRing({ rating, size = 64, stroke = 5 }: Props) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(10, rating));
  const pct = clamped / 10;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const color = ratingColor(clamped);

  return (
    <View
      accessible
      accessibilityRole="text"
      style={{ width: size, height: size }}
      accessibilityLabel={`TMDB rating ${clamped.toFixed(1)} out of 10`}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <AppText style={{ fontFamily: fonts.numerals, fontSize: size * 0.3 }}>
            {clamped.toFixed(1)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
