/**
 * Horizontal, infinitely-paginated rail of GlassCards with header, skeleton
 * loading row, and inline error/retry. Consumes any infinite-titles query.
 */
import { FlatList, StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/StateViews';
import { RAIL_CARD_WIDTH, POSTER_ASPECT } from '@/lib/constants';
import type { Title } from '@/types';

/** Minimal shape of an infinite-titles query result (structurally compatible). */
export type TitlesQuery = {
  data?: Title[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  fetchNextPage: () => unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => unknown;
};

const CARD_HEIGHT = RAIL_CARD_WIDTH / POSTER_ASPECT;

type Props = { title: string; query: TitlesQuery };

export function Rail({ title, query }: Props) {
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = query;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {isPending ? (
        <RailSkeleton />
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorState error={error} onRetry={refetch} compact />
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => `${item.mediaType}-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={Separator}
          renderItem={({ item, index }) => (
            <GlassCard title={item} width={RAIL_CARD_WIDTH} index={index} />
          )}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <Skeleton width={RAIL_CARD_WIDTH} height={CARD_HEIGHT} radius={20} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

function Separator() {
  return <View style={{ width: 12 }} />;
}

function RailSkeleton() {
  return (
    <View style={[styles.content, styles.skeletonRow]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} width={RAIL_CARD_WIDTH} height={CARD_HEIGHT} radius={20} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 26 },
  content: { paddingHorizontal: 16 },
  skeletonRow: { flexDirection: 'row', gap: 12 },
  footer: { marginLeft: 12 },
  errorWrap: { paddingHorizontal: 16 },
});
