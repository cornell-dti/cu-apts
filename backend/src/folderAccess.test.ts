/**
 * folderAccess.test.ts
 *
 * Tests for shared folder permissions:
 * - the isFolderOwner and canAccessFolder helpers in folderAccess.ts
 * - the /api/folders endpoints in app.ts for owners, members, and other users
 *
 * Firebase is replaced with a fake in-memory database, so these tests never touch real data and
 * don't need the Firestore emulator.
 *
 * Run from the backend folder with: npx jest src/folderAccess.test.ts --forceExit
 */
import request from 'supertest';
import app from './app';
import { canAccessFolder, isFolderOwner } from './folderAccess';

type FakeDoc = Record<string, unknown>;

// Fake database the tests read from and write to, one object per collection
const mockDb: Record<string, Record<string, FakeDoc>> = {};

// Use the fake database instead of Firebase. Logging in with "Bearer abc" makes you user "abc".
// It supports the Firestore calls the folder endpoints use: get, set, update, delete, where
// ('==' and 'array-contains'), and FieldValue.arrayUnion / arrayRemove.
jest.mock('./firebase-config', () => {
  type Filter = [string, string, unknown];
  type ArrayOp = { op: 'arrayUnion' | 'arrayRemove'; values: unknown[] };

  const isArrayOp = (value: unknown): value is ArrayOp =>
    typeof value === 'object' && value !== null && 'op' in value;

  const getCollection = (name: string) => {
    if (!mockDb[name]) mockDb[name] = {};
    return mockDb[name];
  };

  const matches = (data: FakeDoc, [field, op, value]: Filter) => {
    if (op === '==') return data[field] === value;
    if (op === 'array-contains') return ((data[field] as unknown[]) ?? []).includes(value);
    return false;
  };

  const makeQuery = (name: string, filters: Filter[]) => ({
    where: (field: string, op: string, value: unknown) =>
      makeQuery(name, [...filters, [field, op, value]]),
    get: async () => ({
      docs: Object.entries(getCollection(name))
        .filter(([, data]) => filters.every((filter) => matches(data, filter)))
        .map(([id, data]) => ({ id, data: () => data })),
    }),
  });

  return {
    db: {
      collection: (name: string) => ({
        doc: (id = 'new-folder') => ({
          id,
          get: async () => {
            const data = getCollection(name)[id];
            return { id, exists: data !== undefined, data: () => data };
          },
          set: async (data: FakeDoc) => {
            getCollection(name)[id] = data;
          },
          update: async (updates: FakeDoc) => {
            const current = { ...getCollection(name)[id] };
            Object.entries(updates).forEach(([field, value]) => {
              if (!isArrayOp(value)) {
                current[field] = value;
                return;
              }
              const list = (current[field] as unknown[]) ?? [];
              current[field] =
                value.op === 'arrayUnion'
                  ? [...list, ...value.values.filter((v) => !list.includes(v))]
                  : list.filter((v) => !value.values.includes(v));
            });
            getCollection(name)[id] = current;
          },
          delete: async () => {
            delete getCollection(name)[id];
          },
        }),
        where: (field: string, op: string, value: unknown) => makeQuery(name, [[field, op, value]]),
      }),
    },
    auth: {
      verifyIdToken: async (token: string) => ({ uid: token, email: `${token}@cornell.edu` }),
    },
    FieldValue: {
      arrayUnion: (...values: unknown[]) => ({ op: 'arrayUnion', values }),
      arrayRemove: (...values: unknown[]) => ({ op: 'arrayRemove', values }),
    },
    FieldPath: {},
  };
});

// "owner" created the folder "shared" and added "member". "stranger" has no access.
const resetFakeDatabase = () => {
  Object.keys(mockDb).forEach((name) => delete mockDb[name]);
  mockDb.folders = {
    shared: { name: 'Junior Year', userId: 'owner', members: ['member'], apartments: ['1'] },
    // A folder created before shared folders, so it has no members field
    oldFolder: { name: 'Old Folder', userId: 'owner', apartments: [] },
  };
  mockDb.buildings = {
    1: { name: 'Eddygate', address: '110 Dryden Rd', landlordId: null },
  };
};

const as = (uid: string) => ({ Authorization: `Bearer ${uid}` });

describe('isFolderOwner and canAccessFolder', () => {
  const folder = { userId: 'owner', members: ['member'] };

  it('treats the owner as the owner and lets them access the folder', () => {
    expect(isFolderOwner(folder, 'owner')).toBe(true);
    expect(canAccessFolder(folder, 'owner')).toBe(true);
  });

  it('lets members access the folder, but they are not the owner', () => {
    expect(isFolderOwner(folder, 'member')).toBe(false);
    expect(canAccessFolder(folder, 'member')).toBe(true);
  });

  it('gives other users no access', () => {
    expect(isFolderOwner(folder, 'stranger')).toBe(false);
    expect(canAccessFolder(folder, 'stranger')).toBe(false);
  });

  it('handles old folders with no members field and folders that do not exist', () => {
    expect(canAccessFolder({ userId: 'owner' }, 'owner')).toBe(true);
    expect(canAccessFolder({ userId: 'owner' }, 'member')).toBe(false);
    expect(canAccessFolder(undefined, 'owner')).toBe(false);
  });
});

describe('/api/folders permissions', () => {
  beforeEach(resetFakeDatabase);

  it('starts new folders with no members', async () => {
    const res = await request(app)
      .post('/api/folders')
      .set(as('owner'))
      .send({ folderName: 'New' });
    expect(res.status).toBe(201);
    expect(mockDb.folders['new-folder'].members).toEqual([]);
  });

  it('lists owned folders and folders shared with the user', async () => {
    const ownerRes = await request(app).get('/api/folders').set(as('owner'));
    expect(ownerRes.body.map((f: { id: string }) => f.id)).toEqual(['shared', 'oldFolder']);

    const memberRes = await request(app).get('/api/folders').set(as('member'));
    expect(memberRes.body.map((f: { id: string }) => f.id)).toEqual(['shared']);

    const strangerRes = await request(app).get('/api/folders').set(as('stranger'));
    expect(strangerRes.body).toEqual([]);
  });

  it('lets members view a folder and its apartments, but not other users', async () => {
    expect((await request(app).get('/api/folders/shared').set(as('member'))).status).toBe(200);
    const apartmentsRes = await request(app)
      .get('/api/folders/shared/apartments')
      .set(as('member'));
    expect(apartmentsRes.status).toBe(200);
    expect(apartmentsRes.body).toHaveLength(1);

    expect((await request(app).get('/api/folders/shared').set(as('stranger'))).status).toBe(403);
    expect(
      (await request(app).get('/api/folders/shared/apartments').set(as('stranger'))).status
    ).toBe(403);
  });

  it('still lets owners use folders created before shared folders', async () => {
    const res = await request(app).get('/api/folders/oldFolder').set(as('owner'));
    expect(res.status).toBe(200);
  });

  it('lets members add and remove apartments', async () => {
    const addRes = await request(app)
      .post('/api/folders/shared/apartments')
      .set(as('member'))
      .send({ aptId: '2' });
    expect(addRes.status).toBe(200);
    expect(mockDb.folders.shared.apartments).toEqual(['1', '2']);

    const removeRes = await request(app)
      .delete('/api/folders/shared/apartments/1')
      .set(as('member'));
    expect(removeRes.status).toBe(200);
    expect(mockDb.folders.shared.apartments).toEqual(['2']);
  });

  it('blocks other users from adding or removing apartments', async () => {
    const addRes = await request(app)
      .post('/api/folders/shared/apartments')
      .set(as('stranger'))
      .send({ aptId: '2' });
    const removeRes = await request(app)
      .delete('/api/folders/shared/apartments/1')
      .set(as('stranger'));
    expect(addRes.status).toBe(403);
    expect(removeRes.status).toBe(403);
    expect(mockDb.folders.shared.apartments).toEqual(['1']);
  });

  it('only lets the owner rename or delete the folder', async () => {
    const memberRename = await request(app)
      .put('/api/folders/shared')
      .set(as('member'))
      .send({ newName: 'Mine now' });
    const memberDelete = await request(app).delete('/api/folders/shared').set(as('member'));
    expect(memberRename.status).toBe(403);
    expect(memberDelete.status).toBe(403);
    expect(mockDb.folders.shared.name).toBe('Junior Year');

    const ownerRename = await request(app)
      .put('/api/folders/shared')
      .set(as('owner'))
      .send({ newName: 'Senior Year' });
    expect(ownerRename.status).toBe(200);
    expect(mockDb.folders.shared.name).toBe('Senior Year');

    const ownerDelete = await request(app).delete('/api/folders/shared').set(as('owner'));
    expect(ownerDelete.status).toBe(200);
    expect(mockDb.folders.shared).toBeUndefined();
  });
});

describe('DELETE /api/folders/:folderId/members/:memberId', () => {
  beforeEach(resetFakeDatabase);

  it('lets the owner remove a member, who then loses access', async () => {
    const res = await request(app).delete('/api/folders/shared/members/member').set(as('owner'));
    expect(res.status).toBe(200);
    expect(mockDb.folders.shared.members).toEqual([]);

    const afterRes = await request(app).get('/api/folders/shared').set(as('member'));
    expect(afterRes.status).toBe(403);
  });

  it('blocks members from removing other people', async () => {
    const res = await request(app).delete('/api/folders/shared/members/member').set(as('member'));
    expect(res.status).toBe(403);
    expect(mockDb.folders.shared.members).toEqual(['member']);
  });

  it('returns 404 when the user is not a member or the folder does not exist', async () => {
    const notMember = await request(app)
      .delete('/api/folders/shared/members/stranger')
      .set(as('owner'));
    const noFolder = await request(app)
      .delete('/api/folders/missing/members/member')
      .set(as('owner'));
    expect(notMember.status).toBe(404);
    expect(noFolder.status).toBe(404);
  });
});
