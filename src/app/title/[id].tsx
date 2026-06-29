import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CastRow } from '@/components/CastRow';
import { GlassCard } from '@/components/GlassCard';
import { GlassSurface } from '@/components/GlassSurface';
import { RatingRing } from '@/components/RatingRing';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/StateViews';
import { useExternalRatings, useTitleDetail } from '@/hooks/useTitleDetail';
import { BACKDROP_BLURHASH, POSTER_BLURHASH } from '@/lib/constants';
import { useIsWished, useWishlist } from '@/store/wishlist';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';
import type { ExternalRatings, MediaType, TitleDetail, WatchProvider } from '@/types';
import * as Haptics from 'expo-haptics';

const BACKDROP_H = 360;
const OVERLAP = 64;

function formatRuntime(minutes?: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function TitleDetailScreen() {
  const params = useLocalSearchParams<{ id: string; mediaType?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const id = Number(params.id);
  const mediaType: MediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const query = useTitleDetail(mediaType, id);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {query.isPending ? (
        <DetailSkeleton />
      ) : query.isError || !query.data ? (
        <View style={styles.centered}>
          <ErrorState error={query.error} onRetry={query.refetch} />
        </View>
      ) : (
        <DetailContent detail={query.data} />
      )}

      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={[styles.close, { top: insets.top + 8 }]}>
        <GlassSurface strong radius={999} style={styles.closeInner}>
          <Ionicons name="chevron-down" size={22} color={colors.text} />
        </GlassSurface>
      </Pressable>
    </View>
  );
}

function DetailContent({ detail }: { detail: TitleDetail }) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const saved = useIsWished(detail.id);
  const toggle = useWishlist((s) => s.toggle);
  const external = useExternalRatings(detail.imdbId).data;

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const backdropStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return {
      transform: [
        { translateY: interpolate(scrollY.value, [-200, 0, 300], [-90, 0, 80], Extrapolation.CLAMP) },
        { scale: interpolate(scrollY.value, [-200, 0], [1.4, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  const runtime = formatRuntime(detail.runtime);
  const meta = [
    detail.year,
    runtime,
    detail.mediaType === 'tv' ? 'Series' : 'Movie',
  ].filter(Boolean);

  const onToggle = () => {
    toggle(detail);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const openTrailer = () => {
    if (detail.trailerKey) Linking.openURL(`https://www.youtube.com/watch?v=${detail.trailerKey}`);
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none">
        {detail.backdrop ? (
          <Image
            source={{ uri: detail.backdrop }}
            placeholder={{ blurhash: BACKDROP_BLURHASH }}
            contentFit="cover"
            transition={260}
            cachePolicy="memory-disk"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.skeleton }]} />
        )}
        <LinearGradient
          colors={['rgba(7,10,18,0.15)', `${hexToRgba(colors.bg, 0.2)}`, colors.bg]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={{ height: BACKDROP_H - OVERLAP }} pointerEvents="none" />

        <View
          style={[
            styles.body,
            {
              backgroundColor: colors.bg,
              borderTopLeftRadius: radius.sheet,
              borderTopRightRadius: radius.sheet,
            },
          ]}>
          <View style={styles.headerRow}>
            <View style={[styles.poster, { borderColor: colors.border, backgroundColor: colors.skeleton }]}>
              {detail.poster ? (
                <Image
                  source={{ uri: detail.poster }}
                  placeholder={{ blurhash: POSTER_BLURHASH }}
                  contentFit="cover"
                  transition={220}
                  cachePolicy="memory-disk"
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <View style={styles.noPoster}>
                  <Ionicons name="film-outline" size={30} color={colors.textDim} />
                </View>
              )}
            </View>

            <View style={styles.headerInfo}>
              <AppText variant="h1" numberOfLines={3}>
                {detail.title}
              </AppText>
              {detail.tagline ? (
                <AppText variant="caption" dim numberOfLines={2}>
                  {detail.tagline}
                </AppText>
              ) : null}
              <AppText variant="captionMedium" dim>
                {meta.join('  ·  ')}
              </AppText>
              <View style={styles.ratingRow}>
                <RatingRing rating={detail.rating} size={56} />
                <View style={styles.ratingMeta}>
                  <AppText variant="overline" dim>
                    TMDB
                  </AppText>
                  {detail.voteCount > 0 && (
                    <AppText variant="caption" dim>
                      {detail.voteCount.toLocaleString()} votes
                    </AppText>
                  )}
                </View>
              </View>
            </View>
          </View>

          {external && <ExternalRatingsRow ratings={external} />}

          <View style={styles.actions}>
            <Button
              label={saved ? 'In your Wishlist' : 'Add to Wishlist'}
              icon={saved ? 'heart' : 'heart-outline'}
              variant={saved ? 'glass' : 'primary'}
              onPress={onToggle}
              accessibilityLabel={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              style={styles.flex1}
            />
            {detail.trailerKey ? (
              <Button label="Trailer" icon="play" variant="ghost" onPress={openTrailer} style={styles.flex1} />
            ) : null}
          </View>

          {detail.genres.length > 0 && (
            <View style={styles.genres}>
              {detail.genres.map((g) => (
                <View key={g.id} style={[styles.genreChip, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <AppText variant="caption">{g.name}</AppText>
                </View>
              ))}
            </View>
          )}

          {detail.overview ? (
            <Section title="Overview">
              <AppText variant="body" dim>
                {detail.overview}
              </AppText>
            </Section>
          ) : null}

          {detail.watchProviders.length > 0 && (
            <Section title="Where to watch">
              <WatchProvidersRow providers={detail.watchProviders} />
            </Section>
          )}

          {detail.cast.length > 0 && (
            <Section title="Cast" noPad>
              <CastRow cast={detail.cast} />
            </Section>
          )}

          {detail.recommendations.length > 0 && (
            <Section title="More like this" noPad>
              <FlatList
                horizontal
                data={detail.recommendations}
                keyExtractor={(t) => `${t.mediaType}-${t.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recContent}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item, index }) => <GlassCard title={item} width={120} index={index} />}
              />
            </Section>
          )}
        </View>
      </Animated.ScrollView>
    </>
  );
}

function Section({ title, children, noPad }: { title: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <View style={styles.section}>
      <AppText variant="h2" style={styles.sectionTitle}>
        {title}
      </AppText>
      <View style={noPad ? undefined : styles.sectionBody}>{children}</View>
    </View>
  );
}

function ExternalRatingsRow({ ratings }: { ratings: ExternalRatings }) {
  const { colors } = useTheme();
  const badges: { label: string; value: string; color: string }[] = [];
  if (ratings.imdb) badges.push({ label: 'IMDb', value: `${ratings.imdb}`, color: '#F5C518' });
  if (ratings.rottenTomatoes) badges.push({ label: 'RT', value: ratings.rottenTomatoes, color: '#FA320A' });
  if (ratings.metascore) badges.push({ label: 'Metascore', value: ratings.metascore, color: '#66CC33' });
  if (!badges.length) return null;

  return (
    <View style={styles.externalRow}>
      {badges.map((b) => (
        <View key={b.label} style={[styles.badge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={[styles.badgeDot, { backgroundColor: b.color }]} />
          <AppText variant="overline" dim>
            {b.label}
          </AppText>
          <AppText style={{ fontFamily: fonts.numerals, color: colors.text, fontSize: 15 }}>{b.value}</AppText>
        </View>
      ))}
    </View>
  );
}

function WatchProvidersRow({ providers }: { providers: WatchProvider[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.providers}>
      {providers.map((p) => (
        <View key={p.providerId} style={styles.provider}>
          <View style={[styles.providerLogo, { borderColor: colors.border, backgroundColor: colors.skeleton }]}>
            {p.logo ? (
              <Image source={{ uri: p.logo }} contentFit="cover" style={StyleSheet.absoluteFill} cachePolicy="memory-disk" />
            ) : null}
          </View>
          <AppText variant="caption" dim numberOfLines={1} style={{ width: 60 }} center>
            {p.providerName}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={BACKDROP_H} radius={0} />
      <View style={styles.skeletonBody}>
        <View style={styles.headerRow}>
          <Skeleton width={110} height={165} radius={14} />
          <View style={styles.flex1}>
            <Skeleton width="80%" height={26} />
            <Skeleton width="50%" height={16} style={{ marginTop: 10 }} />
            <Skeleton width={56} height={56} radius={999} style={{ marginTop: 16 }} />
          </View>
        </View>
        <Skeleton height={52} radius={999} style={{ marginTop: 20 }} />
        <Skeleton height={80} radius={14} style={{ marginTop: 20 }} />
      </View>
    </View>
  );
}

/** Convert our #RRGGBB tokens to rgba for gradient blending. */
function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return hex;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center' },
  close: { position: 'absolute', left: 16, zIndex: 20 },
  closeInner: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: BACKDROP_H },
  body: { paddingHorizontal: 16, paddingTop: 18, minHeight: 600, gap: 18 },
  headerRow: { flexDirection: 'row', gap: 16 },
  poster: { width: 110, height: 165, borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  noPoster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  ratingMeta: { gap: 2 },
  externalRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 999 },
  actions: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  section: { gap: 12 },
  sectionTitle: { paddingHorizontal: 0 },
  sectionBody: {},
  recContent: { paddingRight: 16 },
  providers: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  provider: { alignItems: 'center', gap: 6, width: 60 },
  providerLogo: { width: 52, height: 52, borderRadius: 12, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  skeleton: { flex: 1 },
  skeletonBody: { paddingHorizontal: 16, paddingTop: 18, gap: 6 },
});
