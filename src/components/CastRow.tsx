/** Horizontal cast list for the detail screen. */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import type { CastMember } from '@/types';

export function CastRow({ cast }: { cast: CastMember[] }) {
  const { colors } = useTheme();
  if (!cast.length) return null;

  return (
    <FlatList
      horizontal
      data={cast}
      keyExtractor={(c) => String(c.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
      renderItem={({ item }) => (
        <View style={styles.person}>
          <View style={[styles.avatar, { backgroundColor: colors.skeleton, borderColor: colors.border }]}>
            {item.profile ? (
              <Image
                source={{ uri: item.profile }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={styles.noAvatar}>
                <Ionicons name="person" size={26} color={colors.textDim} />
              </View>
            )}
          </View>
          <AppText variant="captionMedium" numberOfLines={1} center style={styles.name}>
            {item.name}
          </AppText>
          {item.character ? (
            <AppText variant="caption" dim numberOfLines={1} center style={styles.name}>
              {item.character}
            </AppText>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  person: { width: 84, alignItems: 'center', gap: 6 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  noAvatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { width: 82 },
});
