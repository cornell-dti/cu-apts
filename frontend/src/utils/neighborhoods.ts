import { NEIGHBORHOODS, NeighborhoodInfo } from '../constants/neighborhoods';
import { NeighborhoodId } from '../../../common/types/ai-search-types';
import { LocationType, defaultFilters } from '../components/Search/FilterSection';

// The search page's area filter uses these labels, which also serve as the short names on buttons.
const SEARCH_LOCATIONS: Readonly<Record<NeighborhoodId, LocationType>> = {
  COLLEGETOWN: 'Collegetown',
  NORTH: 'North',
  WEST: 'West',
  DOWNTOWN: 'Downtown',
};

export type NeighborhoodItem = {
  readonly id: NeighborhoodId;
  readonly info: NeighborhoodInfo;
  // Short name for the search button, e.g. "North".
  readonly shortName: LocationType;
};

const isPlaceholder = (info: NeighborhoodInfo): boolean =>
  [info.displayName, info.distanceText, info.description].some((text) => text.trim() === 'TODO');

/**
 * Resolves neighborhood ids against the static config, in order. Duplicate ids are skipped, and
 * so are ids with no config or config that is still a TODO (with a warning), so placeholder text
 * never reaches the page.
 */
export const selectNeighborhoods = (ids: readonly NeighborhoodId[]): NeighborhoodItem[] => {
  const seen = new Set<NeighborhoodId>();
  const items: NeighborhoodItem[] = [];
  ids.forEach((id) => {
    if (seen.has(id)) {
      return;
    }
    seen.add(id);
    const info = NEIGHBORHOODS[id];
    if (!info || isPlaceholder(info)) {
      console.warn(`AI search: neighborhood ${id} has no finished config; skipping`);
      return;
    }
    items.push({ id, info, shortName: SEARCH_LOCATIONS[id] });
  });
  return items;
};

/** Path to the manual search results filtered to a neighborhood's area. */
export const getNeighborhoodSearchPath = (id: NeighborhoodId): string => {
  const filters = { ...defaultFilters, locations: [SEARCH_LOCATIONS[id]] };
  return `/search?q=&filters=${encodeURIComponent(JSON.stringify(filters))}`;
};
