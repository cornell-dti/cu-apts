import axios from 'axios';

export const BUS_STOPS: Record<string, string> = {
  'College and Oak': 'College Ave & Oak Ave, Ithaca, NY 14850',
  'Schwartz Performing Arts Center': '430 College Ave, Ithaca, NY 14850',
  'Collegetown Crossing': '307 College Ave Ste 1, Ithaca, NY 14850',
  'Catherine Commons': '304 College Ave, Ithaca, NY 14850',
  'College @ Mitchell': 'College Ave & Mitchell St, Ithaca, NY 14850',
};

const ITHACA_QUALIFIER = 'Ithaca, NY 14850';

/** Matches an origin already expressed as "latitude,longitude" rather than an address. */
const COORDINATE_PATTERN = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

/**
 * withIthacaContext – Qualifies a bare street address with its city, state, and ZIP.
 *
 * @remarks
 * Apartment addresses are stored without a city (e.g. "408 College Ave"), which the
 * Google Maps APIs resolve against the whole country — "408 College Ave" geocodes to
 * Texas, yielding walking times measured in days. Appending the city disambiguates it.
 *
 * Origins already given as "latitude,longitude", and addresses that already name
 * Ithaca, are returned untouched so this is safe to apply to any origin.
 *
 * @param location - An address, or coordinates in "latitude,longitude" format
 * @returns The location qualified with Ithaca, NY, or unchanged if not applicable
 */
export function withIthacaContext(location: string): string {
  const trimmed = location.trim().replace(/,+$/, '').trim();

  if (!trimmed) return location;
  if (COORDINATE_PATTERN.test(trimmed)) return trimmed;
  if (/\bithaca\b/i.test(trimmed)) return trimmed;

  return `${trimmed}, ${ITHACA_QUALIFIER}`;
}

/**
 * getTravelTimes – Calculates travel times between an origin and multiple destinations
 * using the Google Distance Matrix API.
 *
 * Times are converted from seconds to minutes before being returned.
 *
 * @param origin - Starting location as an address or "lat,lng" string
 * @param destinations - Array of destination addresses
 * @param mode - Transportation mode ('walking' | 'driving')
 * @returns Array of travel times in minutes, one per destination
 */
export async function getTravelTimes(
  origin: string,
  destinations: string[],
  mode: 'walking' | 'driving'
): Promise<number[]> {
  const { REACT_APP_MAPS_API_KEY } = process.env;
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${destinations
      .map((dest) => encodeURIComponent(dest))
      .join('|')}&mode=${mode}&key=${REACT_APP_MAPS_API_KEY}`
  );

  return response.data.rows[0].elements.map(
    (element: { duration: { value: number } }) => element.duration.value / 60
  );
}

export interface ClosestStop {
  name: string;
  timeMinutes: number;
}

/**
 * findClosestStop – Given a map of stop names to walking times (minutes), returns
 * the stop with the minimum time, or null if the map is empty or all times are
 * non-finite.
 */
export function findClosestStop(busStops: Record<string, number>): ClosestStop | null {
  return Object.entries(busStops).reduce<ClosestStop | null>((best, [name, time]) => {
    if (typeof time !== 'number' || !Number.isFinite(time)) return best;
    if (best === null || time < best.timeMinutes) return { name, timeMinutes: time };
    return best;
  }, null);
}
