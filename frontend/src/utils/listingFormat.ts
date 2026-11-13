import { ListingSummary } from '../../../common/types/ai-search-types';

type Rounding = 'nearest' | 'down' | 'up';

/**
 * Formats a dollar amount compactly, rounded to 0.1K: 1300 → "$1.3K", 2000 → "$2K". Amounts under
 * $1,000 are shown exactly.
 */
export const formatPriceCompact = (price: number, rounding: Rounding = 'nearest'): string => {
  if (price < 1000) {
    return `$${price}`;
  }
  const round = { nearest: Math.round, down: Math.floor, up: Math.ceil }[rounding];
  return `$${round(price / 100) / 10}K`;
};

/**
 * Formats a price range for AI search listings: "$1.3K-$1.5K", or a single value when min equals
 * max. The min rounds down and the max rounds up so the range always contains the real prices
 * ($1,250-$1,480 → "$1.2K-$1.5K"); a single price rounds to nearest. Returns "Price unavailable" when either bound is null.
 */
export const formatListingPrice = (minPrice: number | null, maxPrice: number | null): string => {
  if (minPrice === null || maxPrice === null) {
    return 'Price unavailable';
  }
  if (minPrice === maxPrice) {
    return formatPriceCompact(minPrice);
  }
  return `${formatPriceCompact(minPrice, 'down')}-${formatPriceCompact(maxPrice, 'up')}`;
};

/**
 * Formats the "Est. Price" shown for a listing: "~" + the compact minimum price (rounded down)
 * + "+", e.g. "~$1.2K+". Returns "—" when the minimum price is unknown.
 */
export const formatEstimatedPrice = (minPrice: number | null): string =>
  minPrice === null ? '—' : `~${formatPriceCompact(minPrice, 'down')}+`;

/** Formats a review count: "1 Review", "19 Reviews". */
export const formatReviewCount = (numReviews: number): string =>
  `${numReviews} ${numReviews === 1 ? 'Review' : 'Reviews'}`;

const formatBedCount = (beds: number): string => (beds === 0 ? 'Studio' : `${beds} BR`);

/**
 * Formats a bedroom range: "2-4 BR", "2 BR" when min equals max, and "Studio" for 0. A range
 * starting at a studio reads "Studio-3 BR". Returns null when either bound is null so callers
 * can hide the line.
 */
export const formatListingBeds = (
  minBeds: number | null,
  maxBeds: number | null
): string | null => {
  if (minBeds === null || maxBeds === null) {
    return null;
  }
  if (minBeds === maxBeds) {
    return formatBedCount(minBeds);
  }
  return minBeds === 0 ? `Studio-${maxBeds} BR` : `${minBeds}-${maxBeds} BR`;
};

/**
 * Resolves listing ids against the response's listings table, in order. Ids missing from the
 * table are skipped with a warning, and duplicate ids are skipped silently.
 */
export const selectListings = (
  ids: readonly string[],
  listings: Readonly<Record<string, ListingSummary>>
): ListingSummary[] => {
  const seen = new Set<string>();
  const selected: ListingSummary[] = [];
  ids.forEach((id) => {
    if (seen.has(id)) {
      return;
    }
    seen.add(id);
    const listing = listings[id];
    if (!listing) {
      console.warn(`AI search: listing ${id} is not in the listings table; skipping`);
      return;
    }
    selected.push(listing);
  });
  return selected;
};
