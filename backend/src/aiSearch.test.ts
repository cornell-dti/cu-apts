import express from 'express';
import { ApartmentWithId } from '@common/types/db-types';
import { db } from './firebase-config';
import { EMPTY_FILTERS, ParsedFilters } from './llmSearch';
import { loadApartments, selectCandidates, MAX_CANDIDATES, REVIEW_SORT_POOL } from './aiSearch';

jest.mock('./firebase-config', () => ({ db: { collection: jest.fn() } }));

const mockedCollection = db.collection as jest.Mock;

/** Builds an apartment; overrides win. */
const apt = (id: string, overrides: Partial<ApartmentWithId> = {}): ApartmentWithId => ({
  id,
  name: `Apt ${id}`,
  address: `${id} Main St`,
  landlordId: null,
  roomTypes: [{ id: `${id}-r`, beds: 2, baths: 1, price: 1500 }],
  photos: [],
  area: 'COLLEGETOWN',
  latitude: 42.44,
  longitude: -76.5,
  distanceToCampus: 10,
  ...overrides,
});

const filters = (overrides: Partial<ParsedFilters> = {}): ParsedFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

const ids = (selection: { candidates: readonly ApartmentWithId[] }) =>
  selection.candidates.map((a) => a.id);

describe('selectCandidates - matching', () => {
  const apts = [
    apt('ct-2br', { area: 'COLLEGETOWN' }),
    apt('north-2br', { area: 'NORTH' }),
    apt('west-3br', {
      area: 'WEST',
      roomTypes: [{ id: 'r', beds: 3, baths: 2, price: 2400 }],
    }),
  ];

  it('filters by area', () => {
    const result = selectCandidates(apts, filters({ area: ['NORTH'] }));
    expect(ids(result)).toEqual(['north-2br']);
    expect(result.filtersMatched).toBe(true);
  });

  it('filters by beds and price together', () => {
    const result = selectCandidates(apts, filters({ numBeds: 3, maxPrice: 2500 }));
    expect(ids(result)).toEqual(['west-3br']);
  });

  it('requires one room type to satisfy beds and price together', () => {
    const mixed = apt('mixed', {
      roomTypes: [
        { id: 'a', beds: 2, baths: 1, price: 3000 },
        { id: 'b', beds: 3, baths: 1, price: 1000 },
      ],
    });
    const result = selectCandidates([mixed], filters({ numBeds: 2, maxPrice: 1500 }));
    expect(result.filtersMatched).toBe(false);
  });

  it('applies a minimum price', () => {
    const result = selectCandidates(apts, filters({ minPrice: 2000 }));
    expect(ids(result)).toEqual(['west-3br']);
  });

  it('does not enforce numBeds: 0', () => {
    const result = selectCandidates(apts, filters({ numBeds: 0 }));
    expect(ids(result)).toHaveLength(3);
  });

  it('never matches an apartment without room types on a beds or price filter', () => {
    const result = selectCandidates([apt('none', { roomTypes: [] })], filters({ maxPrice: 5000 }));
    expect(result.filtersMatched).toBe(false);
  });
});

describe('selectCandidates - relaxation', () => {
  const apts = [
    apt('ct', { area: 'COLLEGETOWN', roomTypes: [{ id: 'r', beds: 2, baths: 1, price: 2000 }] }),
    apt('north', { area: 'NORTH', roomTypes: [{ id: 'r', beds: 4, baths: 2, price: 2000 }] }),
  ];

  it('drops price first', () => {
    const result = selectCandidates(
      apts,
      filters({ area: ['COLLEGETOWN'], numBeds: 2, maxPrice: 500 })
    );
    expect(ids(result)).toEqual(['ct']);
    expect(result.filtersMatched).toBe(false);
  });

  it('drops beds second, keeping area', () => {
    const result = selectCandidates(
      apts,
      filters({ area: ['COLLEGETOWN'], numBeds: 6, maxPrice: 500 })
    );
    expect(ids(result)).toEqual(['ct']);
    expect(result.filtersMatched).toBe(false);
  });

  it('drops area last, falling back to every apartment', () => {
    const result = selectCandidates(apts, filters({ area: ['DOWNTOWN'], numBeds: 6 }));
    expect(ids(result).sort()).toEqual(['ct', 'north']);
    expect(result.filtersMatched).toBe(false);
  });

  it('reports a match when no filters were given', () => {
    const result = selectCandidates(apts, filters());
    expect(result.filtersMatched).toBe(true);
    expect(result.candidates).toHaveLength(2);
  });

  it('returns nothing, unmatched, when there are no apartments at all', () => {
    const result = selectCandidates([], filters({ area: ['NORTH'] }));
    expect(result.candidates).toEqual([]);
    expect(result.filtersMatched).toBe(false);
  });
});

describe('selectCandidates - ordering', () => {
  const many = Array.from({ length: 40 }, (_, i) => apt(`a${i}`, { distanceToCampus: 40 - i }));

  it('sorts by distance, nearest first, when no sortBy is given', () => {
    const result = selectCandidates(many, filters());
    expect(result.candidates).toHaveLength(MAX_CANDIDATES);
    expect(ids(result)[0]).toEqual('a39');
    expect(result.reviewSort).toBeNull();
  });

  it('sorts by distance farthest first when sortLowToHigh is false', () => {
    const result = selectCandidates(
      many,
      filters({ sortBy: 'distanceToCampus', sortLowToHigh: false })
    );
    expect(ids(result)[0]).toEqual('a0');
  });

  it('keeps database order for originalOrder', () => {
    const result = selectCandidates(many, filters({ sortBy: 'originalOrder' }));
    expect(ids(result).slice(0, 3)).toEqual(['a0', 'a1', 'a2']);
  });

  it.each<['avgRating' | 'numReviews']>([['avgRating'], ['numReviews']])(
    'takes the nearest %s pool for the caller to hydrate and sort',
    (field) => {
      const result = selectCandidates(many, filters({ sortBy: field }));
      expect(result.candidates).toHaveLength(REVIEW_SORT_POOL);
      expect(ids(result)[0]).toEqual('a39');
      expect(result.reviewSort).toEqual({ field, ascending: false });
    }
  );

  it('sorts a review field ascending when asked for low to high', () => {
    const result = selectCandidates(many, filters({ sortBy: 'avgRating', sortLowToHigh: true }));
    expect(result.reviewSort).toEqual({ field: 'avgRating', ascending: true });
  });

  it('does not mutate the input array', () => {
    const input = [apt('far', { distanceToCampus: 30 }), apt('near', { distanceToCampus: 1 })];
    selectCandidates(input, filters());
    expect(input.map((a) => a.id)).toEqual(['far', 'near']);
  });
});

describe('loadApartments', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns the cached apartments without reading Firestore', async () => {
    const app = express();
    app.set('apts', [apt('cached')]);
    const result = await loadApartments(app);
    expect(result.map((a) => a.id)).toEqual(['cached']);
    expect(mockedCollection).not.toHaveBeenCalled();
  });

  it('loads buildings once when the cache is empty and stores them on the app', async () => {
    const get = jest.fn().mockResolvedValue({
      docs: [{ id: 'x', data: () => ({ name: 'X' }) }],
    });
    mockedCollection.mockReturnValue({ get });
    const app = express();

    const first = await loadApartments(app);
    const second = await loadApartments(app);

    expect(mockedCollection).toHaveBeenCalledWith('buildings');
    expect(get).toHaveBeenCalledTimes(1);
    expect(first).toEqual([{ id: 'x', name: 'X' }]);
    expect(second).toBe(first);
    expect(app.get('apts')).toBe(first);
  });

  it('treats an empty cached array as not loaded', async () => {
    const get = jest.fn().mockResolvedValue({ docs: [] });
    mockedCollection.mockReturnValue({ get });
    const app = express();
    app.set('apts', []);
    await loadApartments(app);
    expect(get).toHaveBeenCalledTimes(1);
  });
});
