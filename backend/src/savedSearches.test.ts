import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import savedSearchRouter, { parseSavedSearch, savedSearchDocumentId } from './savedSearches';

jest.mock('./firebase-config', () => {
  const documents = new Map<string, { userId: string; search: unknown }>();
  return {
    db: {
      clearSavedSearches: () => documents.clear(),
      collection: () => ({
        where: (_field: string, _operator: string, userId: string) => ({
          get: async () => ({
            docs: Array.from(documents.values())
              .filter((entry) => entry.userId === userId)
              .map((entry) => ({ data: () => entry })),
          }),
        }),
        doc: (id: string) => ({
          get: async () => ({ exists: documents.has(id), data: () => documents.get(id) }),
          set: async (entry: { userId: string; search: unknown }) => documents.set(id, entry),
          delete: async () => documents.delete(id),
        }),
      }),
    },
  };
});

jest.mock('./auth', () => ({
  __esModule: true,
  default: (req: Request, res: Response, next: NextFunction) => {
    const uid = req.header('x-test-user');
    if (!uid) return res.status(401).send('Not authenticated');
    req.user = { uid } as Request['user'];
    return next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/saved-searches', savedSearchRouter);

const filters = {
  locations: ['Collegetown'],
  minPrice: '',
  maxPrice: '2500',
  bedrooms: 2,
  bathrooms: 1,
  initialSortBy: 'avgRating',
  initialSortLowToHigh: false,
};
const search = {
  id: JSON.stringify([
    'manual',
    'quiet apartment',
    [['Collegetown'], '', '2500', 2, 1, 'avgRating', false],
  ]),
  mode: 'manual',
  query: 'Quiet Apartment',
  filters,
};

beforeEach(() => {
  jest.requireMock('./firebase-config').db.clearSavedSearches();
});

test('validates search identity and criteria', () => {
  expect(parseSavedSearch(search)).toEqual(search);
  expect(
    parseSavedSearch({
      ...search,
      id: JSON.stringify(['manual', '', [['Collegetown'], '', '2500', 2, 1, 'avgRating', false]]),
      query: '',
    })
  ).not.toBeNull();
  expect(
    parseSavedSearch({
      id: JSON.stringify(['ai', 'quiet studio', null]),
      mode: 'ai',
      query: 'quiet studio',
      filters: { ...filters, locations: [], maxPrice: '', bedrooms: 0, bathrooms: 0 },
    })
  ).not.toBeNull();
  expect(parseSavedSearch({ ...search, id: 'different' })).toBeNull();
  expect(
    parseSavedSearch({ ...search, query: '', filters: { ...filters, maxPrice: '' } })
  ).toBeNull();
  const emptyFilters = { ...filters, locations: [], maxPrice: '', bedrooms: 0, bathrooms: 0 };
  expect(
    parseSavedSearch({
      id: JSON.stringify(['manual', '', [[], '', '', 0, 0, 'avgRating', false]]),
      mode: 'manual',
      query: '',
      filters: emptyFilters,
    })
  ).toBeNull();
  expect(savedSearchDocumentId('user-a', search.id)).not.toBe(
    savedSearchDocumentId('user-b', search.id)
  );
});

test('authenticated saved searches persist per account and can be removed', async () => {
  expect((await request(app).get('/api/saved-searches')).status).toBe(401);
  expect(
    (
      await request(app)
        .post('/api/saved-searches')
        .set('x-test-user', 'user-a')
        .send({ ...search, id: 'different' })
    ).status
  ).toBe(400);

  const first = await request(app)
    .post('/api/saved-searches')
    .set('x-test-user', 'user-a')
    .send(search);
  expect(first.status).toBe(201);
  expect(first.body.savedAt).toEqual(expect.any(Number));

  const repeated = await request(app)
    .post('/api/saved-searches')
    .set('x-test-user', 'user-a')
    .send(search);
  expect(repeated.status).toBe(200);
  expect(repeated.body.savedAt).toBe(first.body.savedAt);

  const own = await request(app).get('/api/saved-searches').set('x-test-user', 'user-a');
  const other = await request(app).get('/api/saved-searches').set('x-test-user', 'user-b');
  expect(own.body).toEqual([first.body]);
  expect(other.body).toEqual([]);

  await request(app)
    .delete('/api/saved-searches')
    .set('x-test-user', 'user-b')
    .send({ id: search.id });
  expect(
    (await request(app).get('/api/saved-searches').set('x-test-user', 'user-a')).body
  ).toHaveLength(1);

  const removed = await request(app)
    .delete('/api/saved-searches')
    .set('x-test-user', 'user-a')
    .send({ id: search.id });
  expect(removed.status).toBe(204);
  expect((await request(app).get('/api/saved-searches').set('x-test-user', 'user-a')).body).toEqual(
    []
  );
});
