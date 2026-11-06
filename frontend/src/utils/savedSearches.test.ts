import { defaultFilters } from '../components/Search/FilterSection';
import {
  clearRecentSearches,
  readSearches,
  recordSearch,
  replaceSavedSearches,
  searchId,
  searchUrl,
} from './savedSearches';

beforeEach(() => localStorage.clear());

test('a repeated search moves to the front without losing its saved state', () => {
  const filters = { ...defaultFilters, bedrooms: 2, locations: ['Collegetown' as const] };
  recordSearch('manual', '  sunny apartment  ', filters, 'user-1');
  replaceSavedSearches(
    [
      {
        id: searchId('manual', 'sunny apartment', filters),
        mode: 'manual',
        query: 'sunny apartment',
        filters,
        lastSearchedAt: 1,
        savedAt: 2,
      },
    ],
    'user-1'
  );
  recordSearch('manual', 'other search', defaultFilters, 'user-1');
  recordSearch('manual', 'SUNNY APARTMENT', filters, 'user-1');

  const searches = readSearches('user-1');
  expect(searches).toHaveLength(2);
  expect(searches[0].savedAt).toBeDefined();
  expect(searches[0].query).toBe('SUNNY APARTMENT');
  expect(searches[0].filters).toEqual(filters);
  expect(readSearches('user-2')).toEqual([]);
});

test('clearing history preserves favorites and filter-only searches', () => {
  recordSearch('manual', '', { ...defaultFilters, maxPrice: '2500' });
  recordSearch('ai', 'quiet studio');
  const filters = { ...defaultFilters, maxPrice: '2500' };
  replaceSavedSearches(
    [
      {
        id: searchId('manual', '', filters),
        mode: 'manual',
        query: '',
        filters,
        lastSearchedAt: 1,
        savedAt: 2,
      },
    ],
    'guest'
  );
  clearRecentSearches();

  const searches = readSearches();
  expect(searches).toHaveLength(1);
  expect(searches[0].savedAt).toBeDefined();
  expect(searches[0].filters.maxPrice).toBe('2500');
});

test('server favorites replace stale local favorites while preserving recent history', () => {
  recordSearch('manual', 'recent', defaultFilters, 'user-1');
  const old = {
    id: searchId('ai', 'old', defaultFilters),
    mode: 'ai' as const,
    query: 'old',
    filters: defaultFilters,
    lastSearchedAt: 1,
    savedAt: 2,
  };
  replaceSavedSearches([old], 'user-1');
  replaceSavedSearches([], 'user-1');

  expect(readSearches('user-1').map((item) => item.query)).toEqual(['recent']);
});

test('saved search URLs replay queries and filters', () => {
  const filters = { ...defaultFilters, bedrooms: 3, maxPrice: '3200' };
  const url = searchUrl({ mode: 'manual', query: 'sunny & quiet', filters });
  const params = new URLSearchParams(url.split('?')[1]);

  expect(params.get('q')).toBe('sunny & quiet');
  expect(JSON.parse(decodeURIComponent(params.get('filters') || '{}'))).toEqual(filters);
  expect(searchUrl({ mode: 'ai', query: 'sunny & quiet', filters })).toBe(
    '/ai-search?q=sunny%20%26%20quiet'
  );
});
