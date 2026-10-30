import { Application } from 'express';
import { ApartmentWithId } from '@common/types/db-types';
import { z } from 'zod';
import { Block, ListingSummary, NeighborhoodId } from '@common/types/ai-search-types';
import { db } from './firebase-config';
import { ParsedFilters, sanitizeText } from './llmSearch';

/** Longest featured review we return on a listing card. */
export const MAX_FEATURED_REVIEW_LENGTH = 300;

/**
 * AI Search - Turns a natural language query into a set of blocks (prose, property cards,
 * comparison tables, neighborhood cards) that reference apartments by ID, plus the apartments
 * themselves. See common/types/ai-search-types.ts for the response contract.
 */

/** Most apartments returned as `listings`. */
export const MAX_CANDIDATES = 20;

/**
 * Apartments hydrated when the sort needs review data. We take the nearest matches, hydrate
 * them, sort by the review-derived field, and keep {@link MAX_CANDIDATES}.
 */
export const REVIEW_SORT_POOL = 30;

/** Sort fields that can only be evaluated after reviews are fetched. */
export type ReviewSortField = 'avgRating' | 'numReviews';

export type CandidateSelection = {
  /** Ordered candidates. At most {@link MAX_CANDIDATES}, or {@link REVIEW_SORT_POOL} when `reviewSort` is set. */
  readonly candidates: readonly ApartmentWithId[];
  /** False when the filters matched nothing and a broader set was used instead. */
  readonly filtersMatched: boolean;
  /** Set when the caller must hydrate the candidates, sort by this field, and keep the top 20. */
  readonly reviewSort: { readonly field: ReviewSortField; readonly ascending: boolean } | null;
};

type MatchFilters = Pick<ParsedFilters, 'area' | 'numBeds' | 'minPrice' | 'maxPrice'>;

/**
 * Whether an apartment satisfies the filters. Beds and price must be satisfied by the same room
 * type: a 2-bed over budget plus an in-budget 3-bed does not match "2 beds under $1500".
 * `numBeds: 0` (studio) is not enforced, as in /api/search-with-query-and-filters.
 */
const matchesFilters = (apt: ApartmentWithId, filters: MatchFilters): boolean => {
  if (filters.area.length > 0 && !filters.area.includes(apt.area?.toUpperCase() as never)) {
    return false;
  }

  const { numBeds, minPrice, maxPrice } = filters;
  const wantsBeds = numBeds !== null && numBeds > 0;
  if (!wantsBeds && minPrice === null && maxPrice === null) {
    return true;
  }

  return (apt.roomTypes ?? []).some(
    (room) =>
      (!wantsBeds || room.beds === numBeds) &&
      (minPrice === null || room.price >= minPrice) &&
      (maxPrice === null || room.price <= maxPrice)
  );
};

const byDistance = (a: ApartmentWithId, b: ApartmentWithId): number =>
  a.distanceToCampus - b.distanceToCampus;

/**
 * Picks the apartments to show for a set of filters.
 *
 * If nothing matches, filters are relaxed in order - price, then beds, then area - until
 * something does, ending with every apartment. `filtersMatched` reports whether the original
 * filters were satisfied, so the prompt can avoid claiming a match that did not happen.
 *
 * Ordering follows `sortBy`: distance (the default) and original order need no review data and
 * are applied here; `avgRating` and `numReviews` return the {@link REVIEW_SORT_POOL} nearest
 * matches along with `reviewSort`, for the caller to finish once reviews are loaded.
 */
export const selectCandidates = (
  apts: readonly ApartmentWithId[],
  filters: ParsedFilters
): CandidateSelection => {
  const stages: MatchFilters[] = [
    filters,
    { ...filters, minPrice: null, maxPrice: null },
    { ...filters, minPrice: null, maxPrice: null, numBeds: null },
    { area: [], numBeds: null, minPrice: null, maxPrice: null },
  ];

  const stageMatches = stages.map((stage) => apts.filter((apt) => matchesFilters(apt, stage)));
  const firstHit = stageMatches.findIndex((found) => found.length > 0);
  const matched = firstHit === -1 ? [] : stageMatches[firstHit];
  const filtersMatched = firstHit === 0;

  const { sortBy, sortLowToHigh } = filters;
  if (sortBy === 'avgRating' || sortBy === 'numReviews') {
    return {
      candidates: [...matched].sort(byDistance).slice(0, REVIEW_SORT_POOL),
      filtersMatched,
      // Higher is better for both fields unless the user asked for the reverse.
      reviewSort: { field: sortBy, ascending: sortLowToHigh === true },
    };
  }

  let ordered = matched;
  if (sortBy !== 'originalOrder') {
    ordered = [...matched].sort(byDistance);
    if (sortLowToHigh === false) ordered.reverse();
  }
  return { candidates: ordered.slice(0, MAX_CANDIDATES), filtersMatched, reviewSort: null };
};

/**
 * Returns the apartments cached on the app, loading the `buildings` collection once if the
 * cache is empty (it is normally filled by POST /api/set-data when a client loads the site).
 */
export const loadApartments = async (app: Application): Promise<ApartmentWithId[]> => {
  const cached = app.get('apts') as ApartmentWithId[] | undefined;
  if (cached && cached.length > 0) {
    return cached;
  }

  const { docs } = await db.collection('buildings').get();
  const apts = docs.map((doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId));
  app.set('apts', apts);
  return apts;
};

/**
 * Collapses whitespace and shortens text to at most `max` characters, cutting at a word
 * boundary and ending with "…". Text that already fits is returned (tidied) without the mark.
 */
export const truncateAtWord = (text: string, max: number): string => {
  const tidy = text.replace(/\s+/g, ' ').trim();
  if (tidy.length <= max) {
    return tidy;
  }
  // Leave room for the ellipsis, and fall back to a hard cut for a single very long word.
  const room = tidy.slice(0, max - 1);
  const lastSpace = room.lastIndexOf(' ');
  // If a space follows `room`, it already ends on a whole word and nothing needs dropping.
  const endsOnWord = tidy[max - 1] === ' ';
  const cut = lastSpace > 0 && !endsOnWord ? room.slice(0, lastSpace) : room;
  return `${cut.replace(/[\s,.;:!?-]+$/, '')}…`;
};

type ReviewFields = {
  readonly overallRating?: number;
  readonly likes?: number;
  readonly reviewText?: string;
};

const range = (values: readonly number[]): [number, number] | [null, null] =>
  values.length === 0 ? [null, null] : [Math.min(...values), Math.max(...values)];

const buildListing = (apt: ApartmentWithId, reviews: readonly ReviewFields[]): ListingSummary => {
  const rooms = apt.roomTypes ?? [];
  const [minBeds, maxBeds] = range(rooms.map((room) => room.beds));
  const [minPrice, maxPrice] = range(rooms.map((room) => room.price));

  const ratingSum = reviews.reduce((sum, review) => sum + (review.overallRating ?? 0), 0);

  // The most-liked review with text to show; the earliest wins a tie.
  const featured = reviews.reduce<ReviewFields | null>((best, review) => {
    if (!review.reviewText?.trim()) return best;
    if (best === null || (review.likes ?? 0) > (best.likes ?? 0)) return review;
    return best;
  }, null);

  return {
    id: apt.id,
    name: apt.name,
    address: apt.address,
    photoUrl: apt.photos?.[0] || null,
    minBeds,
    maxBeds,
    minPrice,
    maxPrice,
    avgRating: reviews.length > 0 ? ratingSum / reviews.length : null,
    numReviews: reviews.length,
    latitude: apt.latitude,
    longitude: apt.longitude,
    featuredReview: featured?.reviewText
      ? truncateAtWord(featured.reviewText, MAX_FEATURED_REVIEW_LENGTH)
      : null,
  };
};

/**
 * Builds a {@link ListingSummary} for each apartment, in the same order.
 *
 * Ratings and the featured review come from APPROVED reviews only. All reviews are fetched in
 * one `aptId in [...]` query (Firestore allows 30 values), so the cost is one read per approved
 * review of these apartments.
 */
export const hydrateListings = async (
  apts: readonly ApartmentWithId[]
): Promise<ListingSummary[]> => {
  if (apts.length === 0) {
    return [];
  }

  const snapshot = await db
    .collection('reviews')
    .where(
      'aptId',
      'in',
      apts.map((apt) => apt.id)
    )
    .where('status', '==', 'APPROVED')
    .get();

  const reviewsByApt = new Map<string, ReviewFields[]>();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const list = reviewsByApt.get(data.aptId) ?? [];
    list.push(data);
    reviewsByApt.set(data.aptId, list);
  });

  return apts.map((apt) => buildListing(apt, reviewsByApt.get(apt.id) ?? []));
};

/**
 * Finishes a rating or review-count sort once listings are hydrated, keeping the top
 * {@link MAX_CANDIDATES}. Unrated listings sort last in either direction, and ties keep the
 * incoming (nearest-first) order.
 */
export const sortByReviewField = (
  listings: readonly ListingSummary[],
  sort: { readonly field: ReviewSortField; readonly ascending: boolean }
): ListingSummary[] => {
  const direction = sort.ascending ? 1 : -1;
  return listings
    .map((listing, index) => ({ listing, index, value: listing[sort.field] }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) {
        if (a.value === b.value) return a.index - b.index;
        return a.value === null ? 1 : -1;
      }
      return direction * (a.value - b.value) || a.index - b.index;
    })
    .slice(0, MAX_CANDIDATES)
    .map(({ listing }) => listing);
};

/** Neighborhoods the model may pick from; mirrors {@link NeighborhoodId}. */
export const NEIGHBORHOOD_IDS: readonly NeighborhoodId[] = [
  'COLLEGETOWN',
  'WEST',
  'NORTH',
  'DOWNTOWN',
];

export const MAX_PROPERTY_CARDS = 3;
export const MAX_COMPARISON_ROWS = 8;
/** Most blocks of any type other than text. */
export const MAX_NON_TEXT_BLOCKS = 3;
export const MAX_TEXT_BLOCKS = 2;

const MAX_TEXT_LENGTH = 1000;
const MAX_HEADING_LENGTH = 80;
const MAX_INTRO_LENGTH = 300;
const MAX_KEY_FEATURE_LENGTH = 120;

/** A required string, sanitized and capped; fails if nothing is left. */
const requiredText = (max: number) =>
  z
    .string()
    .transform((value) => sanitizeText(value, max))
    .refine((value) => value.length > 0);

/** An optional string, sanitized and capped; a bad or empty value is dropped, not fatal. */
const optionalText = (max: number) =>
  z
    .string()
    .transform((value) => sanitizeText(value, max) || undefined)
    .optional()
    .catch(undefined);

const TextBlockSchema = z.object({ content: requiredText(MAX_TEXT_LENGTH) });
const SectionSchema = {
  heading: requiredText(MAX_HEADING_LENGTH),
  intro: optionalText(MAX_INTRO_LENGTH),
};
const PropertyCardsSchema = z.object({ ...SectionSchema, listingIds: z.array(z.unknown()) });
const ComparisonTableSchema = z.object({ ...SectionSchema, rows: z.array(z.unknown()) });
const ComparisonRowSchema = z.object({
  listingId: z.string(),
  keyFeature: requiredText(MAX_KEY_FEATURE_LENGTH),
});
const NeighborhoodsSchema = z.object({
  heading: requiredText(MAX_HEADING_LENGTH),
  neighborhoods: z.array(z.unknown()),
});

/** Keeps the first occurrence of each known listing ID, up to `max`. */
const takeKnownIds = (ids: readonly unknown[], known: ReadonlySet<string>, max: number) =>
  Array.from(
    new Set(ids.filter((id): id is string => typeof id === 'string' && known.has(id)))
  ).slice(0, max);

/** Validates one block from the model, or returns null if it cannot be salvaged. */
const validateBlock = (raw: unknown, known: ReadonlySet<string>): Block | null => {
  const type = (raw as { type?: unknown } | null)?.type;

  if (type === 'text') {
    const parsed = TextBlockSchema.safeParse(raw);
    return parsed.success ? { type, content: parsed.data.content } : null;
  }

  if (type === 'property_cards') {
    const parsed = PropertyCardsSchema.safeParse(raw);
    if (!parsed.success) return null;
    const listingIds = takeKnownIds(parsed.data.listingIds, known, MAX_PROPERTY_CARDS);
    if (listingIds.length === 0) return null;
    const { heading, intro } = parsed.data;
    return { type, heading, ...(intro ? { intro } : {}), listingIds };
  }

  if (type === 'comparison_table') {
    const parsed = ComparisonTableSchema.safeParse(raw);
    if (!parsed.success) return null;
    const seen = new Set<string>();
    const rows: { listingId: string; keyFeature: string }[] = [];
    parsed.data.rows.forEach((candidate) => {
      const row = ComparisonRowSchema.safeParse(candidate);
      if (!row.success || !known.has(row.data.listingId) || seen.has(row.data.listingId)) return;
      if (rows.length >= MAX_COMPARISON_ROWS) return;
      seen.add(row.data.listingId);
      rows.push(row.data);
    });
    // A comparison needs something to compare.
    if (rows.length < 2) return null;
    const { heading, intro } = parsed.data;
    return { type, heading, ...(intro ? { intro } : {}), rows };
  }

  if (type === 'neighborhoods') {
    const parsed = NeighborhoodsSchema.safeParse(raw);
    if (!parsed.success) return null;
    const neighborhoods = Array.from(
      new Set(
        parsed.data.neighborhoods.filter((id): id is NeighborhoodId =>
          (NEIGHBORHOOD_IDS as readonly unknown[]).includes(id)
        )
      )
    );
    if (neighborhoods.length === 0) return null;
    return { type, heading: parsed.data.heading, neighborhoods };
  }

  return null;
};

/**
 * Validates the blocks the model returned, never failing the whole response over a bad one.
 *
 * Blocks that are malformed or have an unknown type are dropped. Listing IDs the model made up
 * are dropped, as are repeats within a block, and a block left with nothing to show is dropped
 * too. Prices, beds, ratings and addresses are not accepted from the model at all: blocks carry
 * IDs, and the client looks the facts up in `listings`. Counts are capped; the first blocks in
 * the model's order win.
 *
 * @param raw - the parsed model output: `{ blocks: [...] }`, or the bare array
 * @param listings - the hydrated candidates; only these IDs are valid
 */
export const validateBlocks = (
  raw: unknown,
  listings: Readonly<Record<string, ListingSummary>>
): Block[] => {
  const candidates = Array.isArray(raw) ? raw : (raw as { blocks?: unknown } | null)?.blocks;
  if (!Array.isArray(candidates)) {
    return [];
  }

  const known = new Set(Object.keys(listings));
  const blocks: Block[] = [];
  let textCount = 0;
  let nonTextCount = 0;

  candidates.forEach((candidate) => {
    const block = validateBlock(candidate, known);
    if (!block) return;
    if (block.type === 'text') {
      if (textCount >= MAX_TEXT_BLOCKS) return;
      textCount += 1;
    } else {
      if (nonTextCount >= MAX_NON_TEXT_BLOCKS) return;
      nonTextCount += 1;
    }
    blocks.push(block);
  });

  return blocks;
};
