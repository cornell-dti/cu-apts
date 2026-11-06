import { defaultFilters, FilterState } from '../components/Search/FilterSection';

export type SavedSearch = {
  id: string;
  mode: 'manual' | 'ai';
  query: string;
  filters: FilterState;
  lastSearchedAt: number;
  savedAt?: number;
};

const storageKey = (userId?: string) => `cuapts.searches.v1.${userId || 'guest'}`;
export const searchesChangedEvent = 'cuapts-searches-changed';

export const searchId = (mode: SavedSearch['mode'], query: string, filters: FilterState) =>
  JSON.stringify([
    mode,
    query.trim().toLowerCase(),
    mode === 'ai'
      ? null
      : [
          [...filters.locations].sort(),
          filters.minPrice,
          filters.maxPrice,
          filters.bedrooms,
          filters.bathrooms,
          filters.initialSortBy,
          filters.initialSortLowToHigh,
        ],
  ]);

export const hasSearchCriteria = (query: string, filters: FilterState, mode: SavedSearch['mode']) =>
  query.trim() !== '' ||
  (mode === 'manual' &&
    (filters.locations.length > 0 ||
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.bedrooms > 0 ||
      filters.bathrooms > 0));

export const searchUrl = (search: Pick<SavedSearch, 'mode' | 'query' | 'filters'>) =>
  search.mode === 'ai'
    ? `/ai-search?q=${encodeURIComponent(search.query)}`
    : `/search?q=${encodeURIComponent(search.query)}&filters=${encodeURIComponent(
        JSON.stringify(search.filters)
      )}`;

export const searchLabel = (search: Pick<SavedSearch, 'mode' | 'query' | 'filters'>) => {
  if (search.query.trim()) return search.query.trim();
  const { locations, minPrice, maxPrice, bedrooms, bathrooms } = search.filters;
  return [
    locations.join(', '),
    minPrice && `Min $${minPrice}`,
    maxPrice && `Max $${maxPrice}`,
    bedrooms && `${bedrooms}+ beds`,
    bathrooms && `${bathrooms}+ baths`,
  ]
    .filter(Boolean)
    .join(' · ');
};

export const readSearches = (userId?: string): SavedSearch[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedSearch =>
        item &&
        typeof item.id === 'string' &&
        (item.mode === 'manual' || item.mode === 'ai') &&
        typeof item.query === 'string' &&
        item.filters &&
        Array.isArray(item.filters.locations) &&
        typeof item.filters.minPrice === 'string' &&
        typeof item.filters.maxPrice === 'string' &&
        typeof item.filters.bedrooms === 'number' &&
        typeof item.filters.bathrooms === 'number' &&
        typeof item.filters.initialSortBy === 'string' &&
        typeof item.filters.initialSortLowToHigh === 'boolean' &&
        typeof item.lastSearchedAt === 'number' &&
        (item.savedAt === undefined || typeof item.savedAt === 'number')
    );
  } catch {
    return [];
  }
};

const writeSearches = (searches: SavedSearch[], userId?: string) => {
  const saved = searches
    .filter((item) => item.savedAt)
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
    .slice(0, 50);
  const recent = searches
    .filter((item) => !item.savedAt)
    .sort((a, b) => b.lastSearchedAt - a.lastSearchedAt)
    .slice(0, 20);
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...saved, ...recent]));
    window.dispatchEvent(new Event(searchesChangedEvent));
  } catch {
    // Searching remains usable when browser storage is disabled or full.
  }
};

export const recordSearch = (
  mode: SavedSearch['mode'],
  query: string,
  filters: FilterState = defaultFilters,
  userId?: string
) => {
  if (!hasSearchCriteria(query, filters, mode)) return;
  const id = searchId(mode, query, filters);
  const searches = readSearches(userId);
  const previous = searches.find((item) => item.id === id);
  writeSearches(
    [
      {
        id,
        mode,
        query: query.trim(),
        filters,
        lastSearchedAt: Date.now(),
        savedAt: previous?.savedAt,
      },
      ...searches.filter((item) => item.id !== id),
    ],
    userId
  );
};

export const toggleSavedSearch = (
  mode: SavedSearch['mode'],
  query: string,
  filters: FilterState = defaultFilters,
  userId?: string
) => {
  if (!hasSearchCriteria(query, filters, mode)) return;
  const id = searchId(mode, query, filters);
  const searches = readSearches(userId);
  const previous = searches.find((item) => item.id === id);
  writeSearches(
    [
      {
        id,
        mode,
        query: query.trim(),
        filters,
        lastSearchedAt: previous?.lastSearchedAt || Date.now(),
        savedAt: previous?.savedAt ? undefined : Date.now(),
      },
      ...searches.filter((item) => item.id !== id),
    ],
    userId
  );
};

export const removeSearch = (id: string, userId?: string) =>
  writeSearches(
    readSearches(userId).filter((item) => item.id !== id),
    userId
  );

export const clearRecentSearches = (userId?: string) =>
  writeSearches(
    readSearches(userId).filter((item) => item.savedAt),
    userId
  );
