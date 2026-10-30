import { ListingSummary } from '../../../common/types/ai-search-types';

/** Formats a dollar amount compactly: 1300 → "$1.3K", 950 → "$950", 2000 → "$2K". */
export const formatPriceCompact = (price: number): string => {
  if (price < 1000) {
    return `$${price}`;
  }
  return `$${parseFloat((price / 1000).toFixed(1))}K`;
};

/**
 * Formats a price range for AI search listings: "$1.3K-$1.5K", or a single value when min equals
 * max. Returns "Price unavailable" when either bound is null.
 */
export const formatListingPrice = (minPrice: number | null, maxPrice: number | null): string => {
  if (minPrice === null || maxPrice === null) {
    return 'Price unavailable';
  }
  if (minPrice === maxPrice) {
    return formatPriceCompact(minPrice);
  }
  return `${formatPriceCompact(minPrice)}-${formatPriceCompact(maxPrice)}`;
};

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
