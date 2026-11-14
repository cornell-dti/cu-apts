import { tagIdsQueryFromSearch, tagIdsSearchSuffix } from './tagQueryFromUrl';

const encodedFilters = (filters: unknown) =>
  `?filters=${encodeURIComponent(JSON.stringify(filters))}`;

describe('tagIdsQueryFromSearch', () => {
  it.each(['', '?query=collegetown', '?filters='])(
    'returns an empty query when tag filters are missing from %p',
    (search) => {
      expect(tagIdsQueryFromSearch(search)).toBe('');
    }
  );

  it('returns the single selected tag ID from encoded filter JSON', () => {
    expect(tagIdsQueryFromSearch(encodedFilters({ tagIds: ['pet-friendly'] }))).toBe(
      'tagIds=pet-friendly'
    );
  });

  it('joins and encodes multiple selected tag IDs', () => {
    expect(tagIdsQueryFromSearch(encodedFilters({ tagIds: ['near campus', 'best-value'] }))).toBe(
      'tagIds=near%20campus%2Cbest-value'
    );
  });

  it('supports raw filter JSON', () => {
    expect(tagIdsQueryFromSearch('?filters={"tagIds":["raw-id"]}')).toBe('tagIds=raw-id');
  });

  it.each([
    encodedFilters({}),
    encodedFilters({ tagIds: [] }),
    encodedFilters({ tagIds: 'not-an-array' }),
    '?filters=not-json',
  ])('returns an empty query for invalid or unusable tag filters in %p', (search) => {
    expect(tagIdsQueryFromSearch(search)).toBe('');
  });
});

describe('tagIdsSearchSuffix', () => {
  it('prefixes a valid tag query with a question mark', () => {
    expect(tagIdsSearchSuffix(encodedFilters({ tagIds: ['tag-1', 'tag-2'] }))).toBe(
      '?tagIds=tag-1%2Ctag-2'
    );
  });

  it('returns no suffix when there is no usable tag query', () => {
    expect(tagIdsSearchSuffix('?filters=not-json')).toBe('');
  });
});
