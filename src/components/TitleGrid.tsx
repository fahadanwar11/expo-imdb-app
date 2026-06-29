/** 2-column grid of GlassCards — the scrollable surface for Search & Wishlist. */
import type { ReactElement } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Skeleton } from '@/components/Skeleton';
import { POSTER_ASPECT } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Title } from '@/types';

const GAP = 14;
const PAD = 16;

type Props = {
  titles: Title[];
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showHeart?: boolean;
  onItemLongPress?: (title: Title) => void;
};

export function TitleGrid({
  titles,
  onEndReached,
  isFetchingNextPage,
  refreshing,
  onRefresh,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  showHeart = true,
  onItemLongPress,
}: Props) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const cardWidth = (width - PAD * 2 - GAP) / 2;
  const cardHeight = cardWidth / POSTER_ASPECT;

  return (
    <FlatList
      data={titles}
      keyExtractor={(item) => `${item.mediaType}-${item.id}`}
      numColumns={2}
      renderItem={({ item, index }) => (
        <GlassCard
          title={item}
          width={cardWidth}
          index={index}
          showHeart={showHeart}
          onLongPress={onItemLongPress ? () => onItemLongPress(item) : undefined}
        />
      )}
      columnWrapperStyle={styles.column}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        ) : undefined
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <Skeleton width={cardWidth} height={cardHeight} radius={20} />
            <Skeleton width={cardWidth} height={cardHeight} radius={20} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: PAD, paddingBottom: 24 },
  column: { gap: GAP, marginBottom: GAP },
  footer: { flexDirection: 'row', gap: GAP, marginTop: 2 },
});
