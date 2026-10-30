import { Application } from 'express';
import { ApartmentWithId } from '@common/types/db-types';
import { db } from './firebase-config';
import { ParsedFilters } from './llmSearch';

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
