import express from 'express';
import { ApartmentWithId } from '@common/types/db-types';
import { ListingSummary } from '@common/types/ai-search-types';
import { db } from './firebase-config';
import { EMPTY_FILTERS, ParsedFilters } from './llmSearch';
import {
  validateBlocks,
  MAX_COMPARISON_ROWS,
  MAX_NON_TEXT_BLOCKS,
  MAX_PROPERTY_CARDS,
  MAX_TEXT_BLOCKS,
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

describe('validateBlocks', () => {
  const listing = (id: string): ListingSummary => ({
    id,
    name: id,
    address: `${id} St`,
    photoUrl: null,
    minBeds: 1,
    maxBeds: 2,
    minPrice: 1000,
    maxPrice: 2000,
    avgRating: 4,
    numReviews: 3,
    latitude: 0,
    longitude: 0,
    featuredReview: null,
  });
  const listings = Object.fromEntries(
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((id) => [id, listing(id)])
  );

  const cards = (listingIds: unknown, extra: Record<string, unknown> = {}) => ({
    type: 'property_cards',
    heading: 'Best picks',
    listingIds,
    ...extra,
  });
  const table = (rows: unknown, extra: Record<string, unknown> = {}) => ({
    type: 'comparison_table',
    heading: 'Compare',
    rows,
    ...extra,
  });
  const row = (listingId: string, keyFeature = 'Closest to campus') => ({ listingId, keyFeature });

  it('passes well-formed blocks through unchanged', () => {
    const blocks = [
      { type: 'text', content: 'Here are some options.' },
      { type: 'property_cards', heading: 'Best picks', intro: 'Top two', listingIds: ['a', 'b'] },
      { type: 'comparison_table', heading: 'Compare', rows: [row('a'), row('b', 'Cheapest')] },
      { type: 'neighborhoods', heading: 'Areas', neighborhoods: ['COLLEGETOWN', 'NORTH'] },
    ];
    expect(validateBlocks({ blocks }, listings)).toEqual(blocks);
  });

  it('accepts a bare array as well as { blocks }', () => {
    expect(validateBlocks([{ type: 'text', content: 'hi' }], listings)).toHaveLength(1);
  });

  it.each([undefined, null, 'text', 42, {}, { blocks: 'nope' }])(
    'returns no blocks for unusable output %p',
    (raw) => {
      expect(validateBlocks(raw, listings)).toEqual([]);
    }
  );

  it('drops unknown listing IDs', () => {
    const [block] = validateBlocks([cards(['a', 'ghost', 'b'])], listings);
    expect(block).toMatchObject({ listingIds: ['a', 'b'] });
  });

  it('does not treat inherited object keys as listing IDs', () => {
    expect(validateBlocks([cards(['constructor', '__proto__', 'toString'])], listings)).toEqual([]);
  });

  it('drops duplicate listing IDs within a block, keeping the first', () => {
    const [block] = validateBlocks([cards(['b', 'a', 'b', 'a'])], listings);
    expect(block).toMatchObject({ listingIds: ['b', 'a'] });
  });

  it('ignores non-string IDs', () => {
    const [block] = validateBlocks([cards(['a', 7, null, { id: 'b' }])], listings);
    expect(block).toMatchObject({ listingIds: ['a'] });
  });

  it('allows the same listing in different blocks', () => {
    const blocks = validateBlocks([cards(['a']), table([row('a'), row('b')])], listings);
    expect(blocks).toHaveLength(2);
  });

  it(`caps property_cards at ${MAX_PROPERTY_CARDS} listings`, () => {
    const [block] = validateBlocks([cards(['a', 'b', 'c', 'd', 'e'])], listings);
    expect(block).toMatchObject({ listingIds: ['a', 'b', 'c'] });
  });

  it(`caps comparison_table at ${MAX_COMPARISON_ROWS} rows`, () => {
    const rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((id) => row(id));
    const [block] = validateBlocks([table(rows)], listings);
    expect(block.type === 'comparison_table' && block.rows).toHaveLength(MAX_COMPARISON_ROWS);
  });

  it('drops comparison rows with unknown or repeated IDs or no key feature', () => {
    const [block] = validateBlocks(
      [
        table([
          row('a'),
          row('ghost'),
          row('a', 'again'),
          row('b', '   '),
          row('c', 'Pet friendly'),
        ]),
      ],
      listings
    );
    expect(block).toMatchObject({ rows: [row('a'), row('c', 'Pet friendly')] });
  });

  it('drops a comparison_table left with fewer than two rows', () => {
    expect(validateBlocks([table([row('a'), row('ghost')])], listings)).toEqual([]);
  });

  it('drops a property_cards block with no valid listings', () => {
    expect(validateBlocks([cards(['ghost']), cards([])], listings)).toEqual([]);
  });

  it(`keeps at most ${MAX_NON_TEXT_BLOCKS} blocks besides text, first ones winning`, () => {
    const blocks = validateBlocks(
      [
        cards(['a'], { heading: 'one' }),
        cards(['b'], { heading: 'two' }),
        { type: 'neighborhoods', heading: 'three', neighborhoods: ['WEST'] },
        cards(['c'], { heading: 'four' }),
      ],
      listings
    );
    expect(blocks.map((b) => (b.type === 'text' ? '' : b.heading))).toEqual([
      'one',
      'two',
      'three',
    ]);
  });

  it('does not count text blocks against the non-text cap, but caps them separately', () => {
    const text = (content: string) => ({ type: 'text', content });
    const blocks = validateBlocks(
      [text('one'), cards(['a']), cards(['b']), cards(['c']), text('two'), text('three')],
      listings
    );
    expect(blocks.filter((b) => b.type === 'text')).toHaveLength(MAX_TEXT_BLOCKS);
    expect(blocks.filter((b) => b.type !== 'text')).toHaveLength(3);
  });

  it('drops invalid blocks rather than failing the rest', () => {
    const blocks = validateBlocks(
      [
        'not an object',
        null,
        { type: 'carousel', heading: 'x' },
        { type: 'text' },
        { type: 'text', content: 42 },
        { type: 'text', content: '   ' },
        cards('a'),
        { type: 'property_cards', listingIds: ['a'] },
        { type: 'neighborhoods', heading: 'Areas', neighborhoods: ['ATLANTIS', 'OTHER'] },
        { type: 'text', content: 'survivor' },
      ],
      listings
    );
    expect(blocks).toEqual([{ type: 'text', content: 'survivor' }]);
  });

  it('drops unknown neighborhoods and repeats, keeping valid ones', () => {
    const [block] = validateBlocks(
      [{ type: 'neighborhoods', heading: 'Areas', neighborhoods: ['WEST', 'ATLANTIS', 'WEST', 3] }],
      listings
    );
    expect(block).toMatchObject({ neighborhoods: ['WEST'] });
  });

  it('strips fields the model should not write, such as prices and addresses', () => {
    const [block] = validateBlocks(
      [cards(['a'], { price: 1, address: '1 Fake St', rating: 5, listings: [{ id: 'z' }] })],
      listings
    );
    expect(Object.keys(block).sort()).toEqual(['heading', 'listingIds', 'type']);
  });

  it('sanitizes and caps free text, and omits an empty intro', () => {
    const [block, text] = validateBlocks(
      [
        cards(['a'], { heading: `Hi\u202Ethere${'x'.repeat(200)}`, intro: '  ' }),
        { type: 'text', content: `a\u0000b ${'y'.repeat(2000)}` },
      ],
      listings
    );
    expect(block.type === 'property_cards' && block.heading.length).toEqual(80);
    expect(block.type === 'property_cards' && block.heading).not.toMatch(/\u202E/);
    expect('intro' in block).toBe(false);
    expect(text.type === 'text' && text.content.length).toEqual(1000);
    expect(text.type === 'text' && text.content.startsWith('a b ')).toBe(true);
  });
});
