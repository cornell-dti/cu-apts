import { CardData } from '../../App';
import { ListingSummary } from '../../../../common/types/ai-search-types';
import { ApartmentWithId, RoomType } from '../../../../common/types/db-types';

const hasValidCoordinates = (listing: ListingSummary): boolean =>
  Number.isFinite(listing.latitude) &&
  Number.isFinite(listing.longitude) &&
  Math.abs(listing.latitude) <= 90 &&
  Math.abs(listing.longitude) <= 180;

// SearchResultsMap's hover card derives its price line from room types, so the summary's price
// bounds become two room types. Beds and baths are not shown there.
const toRoomTypes = (listing: ListingSummary): RoomType[] => {
  if (listing.minPrice === null || listing.maxPrice === null) {
    return [];
  }
  const beds = listing.minBeds ?? 1;
  return [
    { id: `${listing.id}-min`, beds, baths: 1, price: listing.minPrice },
    { id: `${listing.id}-max`, beds, baths: 1, price: listing.maxPrice },
  ];
};

const toBuildingData = (listing: ListingSummary): ApartmentWithId => ({
  id: listing.id,
  name: listing.name,
  address: listing.address,
  photos: listing.photoUrl ? [listing.photoUrl] : [],
  roomTypes: toRoomTypes(listing),
  latitude: listing.latitude,
  longitude: listing.longitude,
  // Not part of an AI search listing, and not shown by the map's hover card.
  landlordId: null,
  area: 'OTHER',
  distanceToCampus: 0,
});

/**
 * Converts AI search listings to the CardData the search results map takes. Listings with missing
 * or invalid coordinates are skipped with a warning, since they cannot be pinned (and would
 * break the map's centering).
 */
export const toMapCardData = (listings: Readonly<Record<string, ListingSummary>>): CardData[] =>
  Object.values(listings)
    .filter((listing) => {
      if (!hasValidCoordinates(listing)) {
        console.warn(`AI search: listing ${listing.id} has invalid coordinates; not mapping it`);
        return false;
      }
      return true;
    })
    .map((listing) => ({
      buildingData: toBuildingData(listing),
      numReviews: listing.numReviews,
      avgRating: listing.avgRating ?? undefined,
    }));
