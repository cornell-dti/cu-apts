/**
 * userDirectory.test.ts
 *
 * Tests for finding people to invite to a shared folder:
 * - the search and profile helpers in userDirectory.ts
 * - saving a profile at POST /api/users/profile
 * - searching by NetID or name at GET /api/users/search
 *
 * Firebase is replaced with a fake, so these tests never touch real data and don't need the
 * Firestore emulator.
 *
 * Run from the backend folder with: npx jest src/userDirectory.test.ts --forceExit
 */
import request from 'supertest';
import app from './app';
import { buildUserProfile, normalizeSearch } from './userDirectory';

type FakeDoc = Record<string, unknown>;
type Filter = { field: string; op: '>=' | '<='; value: string };

// Fake `users` collection the tests read from and write to
const mockUsers: Record<string, FakeDoc> = {};
// Names on the fake Google accounts. Logging in with "Bearer abc" makes you user "abc".
const mockNames: Record<string, string> = {};
// Fake Firebase Auth accounts (email -> name), whether or not they have a saved profile
const mockAccounts: Record<string, string> = {};

jest.mock('./firebase-config', () => {
  const matches = (data: FakeDoc, { field, op, value }: Filter) => {
    const fieldValue = data[field];
    if (typeof fieldValue !== 'string') return false;
    return op === '>=' ? fieldValue >= value : fieldValue <= value;
  };

  const query = (filters: Filter[], max = Infinity) => ({
    where: (field: string, op: Filter['op'], value: string) =>
      query([...filters, { field, op, value }], max),
    limit: (n: number) => query(filters, n),
    get: async () => ({
      docs: Object.entries(mockUsers)
        .filter(([, data]) => filters.every((filter) => matches(data, filter)))
        .sort(([, a], [, b]) =>
          String(a[filters[0].field]).localeCompare(String(b[filters[0].field]))
        )
        .slice(0, max)
        .map(([id, data]) => ({ id, data: () => data })),
    }),
  });

  return {
    db: {
      collection: () => ({
        doc: (id: string) => ({
          get: async () => ({ exists: !!mockUsers[id], data: () => mockUsers[id] }),
          set: async (data: FakeDoc, options?: { merge?: boolean }) => {
            mockUsers[id] = options?.merge ? { ...mockUsers[id], ...data } : data;
          },
        }),
        where: query([]).where,
      }),
    },
    auth: {
      verifyIdToken: async (token: string) => ({
        uid: token,
        email: `${token}@cornell.edu`,
        name: mockNames[token],
      }),
      getUserByEmail: async (email: string) => {
        if (!(email in mockAccounts)) {
          throw Object.assign(new Error('No user record'), { code: 'auth/user-not-found' });
        }
        return { displayName: mockAccounts[email] };
      },
    },
    FieldValue: {},
    FieldPath: {},
  };
});

const as = (uid: string) => ({ Authorization: `Bearer ${uid}` });
const search = (uid: string, q: string) =>
  request(app).get('/api/users/search').query({ q }).set(as(uid));

// Saves a profile the same way signing in does
const signIn = (uid: string, name: string) => {
  mockNames[uid] = name;
  return request(app).post('/api/users/profile').set(as(uid));
};

beforeEach(() => {
  Object.keys(mockUsers).forEach((id) => delete mockUsers[id]);
  Object.keys(mockNames).forEach((id) => delete mockNames[id]);
  Object.keys(mockAccounts).forEach((email) => delete mockAccounts[email]);
});

describe('normalizeSearch and buildUserProfile', () => {
  it('cleans up searches and skips ones that are too short or have odd characters', () => {
    expect(normalizeSearch(' AB ')).toBe('ab');
    expect(normalizeSearch('AB12@cornell.edu')).toBe('ab12');
    expect(normalizeSearch('alex b')).toBe('alex b');
    ['a', '', '@cornell.edu', 'ab;drop', '<script>', 12, undefined].forEach((input) =>
      expect(normalizeSearch(input)).toBeNull()
    );
  });

  it('builds a profile from a Cornell email and name', () => {
    expect(buildUserProfile('KM2253@Cornell.edu', ' Karan Madia ')).toEqual({
      netId: 'km2253',
      name: 'Karan Madia',
      nameLower: 'karan madia',
      email: 'km2253@cornell.edu',
    });
    expect(buildUserProfile('km2253@cornell.edu', undefined)?.name).toBe('km2253');
    expect(buildUserProfile('km2253@gmail.com', 'Karan')).toBeNull();
  });
});

describe('POST /api/users/profile', () => {
  it("saves the person's profile and keeps their saved apartments", async () => {
    mockUsers.ab123 = { apartments: ['apt1'] };
    const res = await signIn('ab123', 'Alex Bennett');
    expect(res.status).toBe(200);
    expect(mockUsers.ab123).toEqual({
      apartments: ['apt1'],
      netId: 'ab123',
      name: 'Alex Bennett',
      nameLower: 'alex bennett',
      email: 'ab123@cornell.edu',
    });
  });

  it('requires signing in', async () => {
    expect((await request(app).post('/api/users/profile')).status).toBe(401);
  });
});

describe('GET /api/users/search', () => {
  beforeEach(async () => {
    await signIn('ab123', 'Alex Bennett');
    await signIn('abc45', 'Abby Chen');
    await signIn('jl2284', 'Jordan Lee');
    await signIn('km2253', 'Karan Madia');
  });

  it('finds people by the start of their NetID, with names and emails', async () => {
    const res = await search('km2253', 'ab');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { netId: 'ab123', name: 'Alex Bennett', email: 'ab123@cornell.edu' },
      { netId: 'abc45', name: 'Abby Chen', email: 'abc45@cornell.edu' },
    ]);
  });

  it('finds people by the start of their name, ignoring capital letters', async () => {
    const res = await search('km2253', 'JORD');
    expect(res.body).toEqual([
      { netId: 'jl2284', name: 'Jordan Lee', email: 'jl2284@cornell.edu' },
    ]);
  });

  it('accepts a full Cornell email and leaves out the person searching', async () => {
    expect((await search('km2253', 'jl2284@cornell.edu')).body).toHaveLength(1);
    expect((await search('km2253', 'km')).body).toEqual([]);
  });

  it('returns no suggestions for short searches or when nobody matches', async () => {
    expect((await search('km2253', 'a')).body).toEqual([]);
    expect((await search('km2253', 'zz9')).body).toEqual([]);
  });

  it('finds someone by full NetID even if they have no profile yet', async () => {
    mockAccounts['xy999@cornell.edu'] = 'Xavier Young';
    expect((await search('km2253', 'XY999')).body).toEqual([
      { netId: 'xy999', name: 'Xavier Young', email: 'xy999@cornell.edu' },
    ]);
    expect((await search('km2253', 'zz999')).body).toEqual([]);
  });

  it('returns at most 5 suggestions', async () => {
    await Promise.all([1, 2, 3, 4, 5, 6].map((i) => signIn(`zz${i}`, `Student ${i}`)));
    expect((await search('km2253', 'zz')).body).toHaveLength(5);
  });

  it('requires signing in', async () => {
    expect((await request(app).get('/api/users/search').query({ q: 'ab' })).status).toBe(401);
  });
});
