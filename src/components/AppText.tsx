/** Themed Text that applies a typography preset + theme color. */
import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { textVariants, type TextVariant } from '@/theme/typography';

type Props = TextProps & {
  variant?: TextVariant;
  /** Explicit color; overrides `dim`. */
  color?: string;
  /** Use the dimmed text color. */
  dim?: boolean;
  center?: boolean;
};

export function AppText({ variant = 'body', color, dim, center, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        textVariants[variant],
        { color: color ?? (dim ? colors.textDim : colors.text) },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
