import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { FilterSheet } from '@/components/FilterSheet';
import { useTheme } from '@/theme/ThemeProvider';

export default function FiltersModal() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FilterSheet onClose={() => router.back()} />
    </View>
  );
}
