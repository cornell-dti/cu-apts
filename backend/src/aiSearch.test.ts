import express from 'express';
import { ApartmentWithId } from '@common/types/db-types';
import { db } from './firebase-config';
import { EMPTY_FILTERS, ParsedFilters } from './llmSearch';
import {
  hydrateListings,
  loadApartments,
  selectCandidates,
  sortByReviewField,
  truncateAtWord,
  MAX_CANDIDATES,
  MAX_FEATURED_REVIEW_LENGTH,
  REVIEW_SORT_POOL,
} from './aiSearch';

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

/** Stubs `reviews.where().where().get()` and returns the `where` spy. */
const stubReviews = (reviews: Record<string, unknown>[]) => {
  const get = jest.fn().mockResolvedValue({ docs: reviews.map((data) => ({ data: () => data })) });
  const where = jest.fn();
  const chain = { where, get };
  where.mockReturnValue(chain);
  mockedCollection.mockReturnValue(chain);
  return where;
};

const review = (aptId: string, overrides: Record<string, unknown> = {}) => ({
  aptId,
  overallRating: 4,
  likes: 0,
  reviewText: 'Nice place',
  ...overrides,
});

describe('hydrateListings', () => {
  beforeEach(() => jest.resetAllMocks());

  it('skips Firestore for an empty list', async () => {
    expect(await hydrateListings([])).toEqual([]);
    expect(mockedCollection).not.toHaveBeenCalled();
  });

  it('fetches approved reviews for all apartments in one query', async () => {
    const where = stubReviews([]);
    await hydrateListings([apt('a'), apt('b')]);
    expect(mockedCollection).toHaveBeenCalledTimes(1);
    expect(mockedCollection).toHaveBeenCalledWith('reviews');
    expect(where).toHaveBeenNthCalledWith(1, 'aptId', 'in', ['a', 'b']);
    expect(where).toHaveBeenNthCalledWith(2, 'status', '==', 'APPROVED');
  });

  it('computes bed and price ranges from room types', async () => {
    stubReviews([]);
    const [listing] = await hydrateListings([
      apt('a', {
        roomTypes: [
          { id: '1', beds: 1, baths: 1, price: 1800 },
          { id: '2', beds: 3, baths: 2, price: 1200 },
          { id: '3', beds: 2, baths: 1, price: 2500 },
        ],
      }),
    ]);
    expect(listing).toMatchObject({ minBeds: 1, maxBeds: 3, minPrice: 1200, maxPrice: 2500 });
  });

  it('uses null ranges when there are no room types', async () => {
    stubReviews([]);
    const [listing] = await hydrateListings([apt('a', { roomTypes: [] })]);
    expect(listing).toMatchObject({
      minBeds: null,
      maxBeds: null,
      minPrice: null,
      maxPrice: null,
    });
  });

  it('averages ratings and counts reviews per apartment', async () => {
    stubReviews([
      review('a', { overallRating: 5 }),
      review('a', { overallRating: 3 }),
      review('b', { overallRating: 2 }),
    ]);
    const [a, b] = await hydrateListings([apt('a'), apt('b')]);
    expect(a).toMatchObject({ avgRating: 4, numReviews: 2 });
    expect(b).toMatchObject({ avgRating: 2, numReviews: 1 });
  });

  it('reports null rating, zero reviews and no featured review for an unreviewed apartment', async () => {
    stubReviews([review('other')]);
    const [listing] = await hydrateListings([apt('a')]);
    expect(listing).toMatchObject({ avgRating: null, numReviews: 0, featuredReview: null });
  });

  it('features the most-liked review, treating missing likes as zero', async () => {
    stubReviews([
      review('a', { likes: undefined, reviewText: 'unliked' }),
      review('a', { likes: 7, reviewText: 'most liked' }),
      review('a', { likes: 3, reviewText: 'some likes' }),
    ]);
    const [listing] = await hydrateListings([apt('a')]);
    expect(listing.featuredReview).toEqual('most liked');
  });

  it('keeps the earliest review on a likes tie and skips reviews without text', async () => {
    stubReviews([
      review('a', { likes: 9, reviewText: '   ' }),
      review('a', { likes: 2, reviewText: 'first' }),
      review('a', { likes: 2, reviewText: 'second' }),
    ]);
    const [listing] = await hydrateListings([apt('a')]);
    expect(listing.featuredReview).toEqual('first');
  });

  it('truncates a long featured review', async () => {
    stubReviews([review('a', { reviewText: 'word '.repeat(200) })]);
    const [listing] = await hydrateListings([apt('a')]);
    expect(listing.featuredReview?.length).toBeLessThanOrEqual(MAX_FEATURED_REVIEW_LENGTH);
    expect(listing.featuredReview?.endsWith('…')).toBe(true);
  });

  it('uses the first photo, or null when there are none', async () => {
    stubReviews([]);
    const [withPhoto, without] = await hydrateListings([
      apt('a', { photos: ['one.jpg', 'two.jpg'] }),
      apt('b', { photos: [] }),
    ]);
    expect(withPhoto.photoUrl).toEqual('one.jpg');
    expect(without.photoUrl).toBeNull();
  });

  it('copies identity and location fields and keeps input order', async () => {
    stubReviews([]);
    const listings = await hydrateListings([
      apt('b', { name: 'Bee', address: '2 B St', latitude: 1, longitude: 2 }),
      apt('a'),
    ]);
    expect(listings.map((l) => l.id)).toEqual(['b', 'a']);
    expect(listings[0]).toMatchObject({
      name: 'Bee',
      address: '2 B St',
      latitude: 1,
      longitude: 2,
    });
  });
});

describe('truncateAtWord', () => {
  it('returns short text unchanged apart from whitespace', () => {
    expect(truncateAtWord('  hello   world ', 50)).toEqual('hello world');
  });

  it('cuts at a word boundary and adds an ellipsis within the limit', () => {
    const result = truncateAtWord('the quick brown fox jumps over', 20);
    expect(result).toEqual('the quick brown fox…');
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('drops trailing punctuation before the ellipsis', () => {
    expect(truncateAtWord('well, then, it ends here', 12)).toEqual('well, then…');
  });

  it('hard-cuts a single word longer than the limit', () => {
    const result = truncateAtWord('a'.repeat(50), 10);
    expect(result).toEqual(`${'a'.repeat(9)}…`);
  });
});

describe('sortByReviewField', () => {
  const listing = (id: string, avgRating: number | null, numReviews: number) =>
    ({ id, avgRating, numReviews } as never);
  const input = [
    listing('unrated', null, 0),
    listing('low', 2, 40),
    listing('high', 5, 3),
    listing('mid', 3.5, 10),
  ];
  const order = (result: { id: string }[]) => result.map((l) => l.id);

  it('sorts best rating first, unrated last', () => {
    const result = sortByReviewField(input, { field: 'avgRating', ascending: false });
    expect(order(result)).toEqual(['high', 'mid', 'low', 'unrated']);
  });

  it('sorts lowest rating first, still with unrated last', () => {
    const result = sortByReviewField(input, { field: 'avgRating', ascending: true });
    expect(order(result)).toEqual(['low', 'mid', 'high', 'unrated']);
  });

  it('sorts by review count', () => {
    const result = sortByReviewField(input, { field: 'numReviews', ascending: false });
    expect(order(result)).toEqual(['low', 'mid', 'high', 'unrated']);
  });

  it('keeps incoming order on ties and keeps only the top 20', () => {
    const tied = Array.from({ length: 30 }, (_, i) => listing(`t${i}`, 4, 1));
    const result = sortByReviewField(tied, { field: 'avgRating', ascending: false });
    expect(result).toHaveLength(MAX_CANDIDATES);
    expect(order(result).slice(0, 3)).toEqual(['t0', 't1', 't2']);
  });
});
