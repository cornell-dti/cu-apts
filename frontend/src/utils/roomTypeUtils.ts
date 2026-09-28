import { RoomType } from '../../../common/types/db-types';

/**
 * Formats a price value into a readable string with K suffix for thousands.
 * Examples: 1500 → "$1.5K", 3200 → "$3.2K", 800 → "$800"
 *
 * @param {number} price - The price in dollars
 * @returns {string} The formatted price string
 */
export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    const priceInK = price / 1000;
    // Format with 1 decimal place, but remove .0 if it's a whole number
    const formatted = priceInK % 1 === 0 ? priceInK.toFixed(0) : priceInK.toFixed(1);
    return `$${formatted}K`;
  }
  return `$${price}`;
};

/**
 * Formats a bedroom count into a readable string.
 * Examples: 1 → "1 bed", 2 → "2 beds", 0 → "Studio"
 *
 * @param {number} beds - The number of bedrooms
 * @returns {string} The formatted bedroom string
 */
export const formatBeds = (beds: number): string => {
  if (beds === 0) return 'Studio';
  if (beds === 1) return '1 bed';
  return `${beds} beds`;
};

/**
 * Formats a bathroom count into a readable string.
 * Examples: 1 → "1 bath", 2 → "2 baths", 1.5 → "1.5 baths"
 *
 * @param {number} baths - The number of bathrooms
 * @returns {string} The formatted bathroom string
 */
export const formatBaths = (baths: number): string => {
  if (baths === 1) return '1 bath';
  return `${baths} baths`;
};

/**
 * Gets the min and max values for beds, baths, and price from a room types array.
 * Returns null if the array is empty.
 *
 * @param {readonly RoomType[]} roomTypes - Array of room types
 * @returns {{ minBeds: number; maxBeds: number; minBaths: number; maxBaths: number; minPrice: number; maxPrice: number } | null}
 */
export const getRoomTypeRange = (
  roomTypes: readonly RoomType[]
): {
  minBeds: number;
  maxBeds: number;
  minBaths: number;
  maxBaths: number;
  minPrice: number;
  maxPrice: number;
} | null => {
  if (!roomTypes || roomTypes.length === 0) {
    return null;
  }

  const beds = roomTypes.map((rt) => rt.beds);
  const baths = roomTypes.map((rt) => rt.baths);
  const prices = roomTypes.map((rt) => rt.price);

  return {
    minBeds: Math.min(...beds),
    maxBeds: Math.max(...beds),
    minBaths: Math.min(...baths),
    maxBaths: Math.max(...baths),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
};

/**
 * Formats a price range into a readable string.
 * Examples: (1500, 3000) → "$1.5K - $3K", (2000, 2000) → "$2K"
 *
 * @param {number} minPrice - The minimum price
 * @param {number} maxPrice - The maximum price
 * @returns {string} The formatted price range string
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  const min = formatPrice(minPrice);
  const max = formatPrice(maxPrice);

  if (minPrice === maxPrice) {
    return min;
  }

  return `${min} - ${max}`;
};

/**
 * Formats a bedroom range into a readable string.
 * Examples: (1, 3) → "1-3 beds", (2, 2) → "2 beds", (0, 2) → "Studio-2 beds"
 *
 * @param {number} minBeds - The minimum number of bedrooms
 * @param {number} maxBeds - The maximum number of bedrooms
 * @returns {string} The formatted bedroom range string
 */
export const formatBedsRange = (minBeds: number, maxBeds: number): string => {
  if (minBeds === maxBeds) {
    return formatBeds(minBeds);
  }

  // Handle studio to X beds case
  if (minBeds === 0) {
    return `Studio-${maxBeds} beds`;
  }

  return `${minBeds}-${maxBeds} beds`;
};

/**
 * Formats a bathroom range into a readable string.
 * Examples: (1, 2) → "1-2 baths", (1.5, 1.5) → "1.5 baths"
 *
 * @param {number} minBaths - The minimum number of bathrooms
 * @param {number} maxBaths - The maximum number of bathrooms
 * @returns {string} The formatted bathroom range string
 */
export const formatBathsRange = (minBaths: number, maxBaths: number): string => {
  if (minBaths === maxBaths) {
    return formatBaths(minBaths);
  }

  return `${minBaths}-${maxBaths} baths`;
};

/**
 * Formats room type information for display on apartment cards.
 * Returns "Coming soon" if no room types, otherwise returns formatted ranges.
 * Example outputs:
 * - No room types: "Coming soon"
 * - Single room type: "$2K | 2 beds | 1 bath"
 * - Multiple room types: "$1.5K - $3K | 1-3 beds | 1-2 baths"
 *
 * @param {readonly RoomType[]} roomTypes - Array of room types
 * @returns {string} The formatted display string
 */
export const formatRoomTypesDisplay = (roomTypes: readonly RoomType[]): string => {
  const range = getRoomTypeRange(roomTypes);

  if (!range) {
    return 'Coming soon';
  }

  const priceStr = formatPriceRange(range.minPrice, range.maxPrice);
  const bedsStr = formatBedsRange(range.minBeds, range.maxBeds);
  const bathsStr = formatBathsRange(range.minBaths, range.maxBaths);

  return `${priceStr} | ${bedsStr} | ${bathsStr}`;
};

/**
 * Gets the minimum price from a room types array, or null if empty.
 *
 * @param {readonly RoomType[]} roomTypes - Array of room types
 * @returns {number | null} The minimum price or null if no room types
 */
export const getMinPrice = (roomTypes: readonly RoomType[]): number | null => {
  const range = getRoomTypeRange(roomTypes);
  return range ? range.minPrice : null;
};

/**
 * Gets the maximum price from a room types array, or null if empty.
 *
 * @param {readonly RoomType[]} roomTypes - Array of room types
 * @returns {number | null} The maximum price or null if no room types
 */
export const getMaxPrice = (roomTypes: readonly RoomType[]): number | null => {
  const range = getRoomTypeRange(roomTypes);
  return range ? range.maxPrice : null;
};
