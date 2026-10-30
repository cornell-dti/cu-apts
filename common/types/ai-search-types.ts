import { Apartment } from './db-types';

/**
 * Neighborhood identifier. Reuses the existing `Apartment.area` union so it stays in sync with
 * the DB, excluding 'OTHER' (which has no curated neighborhood content).
 */
export type NeighborhoodId = Exclude<Apartment['area'], 'OTHER'>;

export type ListingSummary = {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly photoUrl: string | null;
  // Min/max from the apartment's roomTypes; null when roomTypes is empty.
  readonly minBeds: number | null;
  readonly maxBeds: number | null;
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
  readonly avgRating: number | null;
  readonly numReviews: number;
  readonly latitude: number;
  readonly longitude: number;
  // Text of the approved review with the most likes; null if none.
  readonly featuredReview: string | null;
};

export type Block =
  // Free-form prose from the AI (summary, caveats, follow-up suggestions).
  | { readonly type: 'text'; readonly content: string }
  // A group of listing cards under a heading, e.g. "Best for walkability".
  | {
      readonly type: 'property_cards';
      readonly heading: string;
      readonly intro?: string;
      readonly listingIds: readonly string[];
    }
  // Side-by-side listings, each with a one-line key differentiator.
  | {
      readonly type: 'comparison_table';
      readonly heading: string;
      readonly intro?: string;
      readonly rows: readonly { readonly listingId: string; readonly keyFeature: string }[];
    }
  // Neighborhood overview cards; content comes from the frontend's static config (frontend/src/constants/neighborhoods.ts).
  | {
      readonly type: 'neighborhoods';
      readonly heading: string;
      readonly neighborhoods: readonly NeighborhoodId[];
    };

export type AiSearchResponse = {
  readonly query: string;
  readonly blocks: readonly Block[];
  // Listings matching the search. Blocks reference a subset; the map shows all.
  readonly listings: Readonly<Record<string, ListingSummary>>;
};
