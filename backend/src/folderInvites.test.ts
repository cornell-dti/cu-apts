/**
 * folderInvites.test.ts
 *
 * Tests for inviting people to shared folders:
 * - the NetID and email helpers in folderInvites.ts
 * - POST /api/folders/:folderId/invites (who can invite, NetID checks, duplicates, rate limit)
 *
 * Firebase and nodemailer are replaced with fakes, so these tests never touch real data, never
 * send real email, and don't need the Firestore emulator.
 *
 * Run from the backend folder with: npx jest src/folderInvites.test.ts --forceExit
 */
import request from 'supertest';
import app from './app';
import {
  buildInviteEmail,
  INVITES_PER_HOUR,
  inviteRateLimiter,
  normalizeNetId,
} from './folderInvites';

type FakeDoc = Record<string, unknown>;

// Fake database the tests read from and write to, one object per collection
const mockDb: Record<string, Record<string, FakeDoc>> = {};
// Fake Firebase Auth accounts (email -> user ID). People without a CU Apts account aren't listed.
const mockAccounts: Record<string, string> = {};
// Fake sendMail, so tests can check what would have been emailed
const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: () => ({ sendMail: mockSendMail }),
}));

// Use the fake database instead of Firebase. Logging in with "Bearer abc" makes you user "abc"
// with the email abc@cornell.edu.
jest.mock('./firebase-config', () => {
  type ArrayOp = { op: 'arrayUnion'; values: unknown[] };

  const getCollection = (name: string) => {
    if (!mockDb[name]) mockDb[name] = {};
    return mockDb[name];
  };

  return {
    db: {
      collection: (name: string) => ({
        doc: (id: string) => ({
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
              const op = value as ArrayOp;
              if (op && op.op === 'arrayUnion') {
                const list = (current[field] as unknown[]) ?? [];
                current[field] = [...list, ...op.values.filter((v) => !list.includes(v))];
              } else {
                current[field] = value;
              }
            });
            getCollection(name)[id] = current;
          },
          delete: async () => {
            delete getCollection(name)[id];
          },
        }),
      }),
    },
    auth: {
      verifyIdToken: async (token: string) => ({
        uid: token,
        email: `${token}@cornell.edu`,
        name: `User ${token}`,
      }),
      getUserByEmail: async (email: string) => {
        if (!mockAccounts[email]) {
          throw Object.assign(new Error('No user record'), { code: 'auth/user-not-found' });
        }
        return { uid: mockAccounts[email] };
      },
    },
    FieldValue: {
      arrayUnion: (...values: unknown[]) => ({ op: 'arrayUnion', values }),
      arrayRemove: (...values: unknown[]) => ({ op: 'arrayRemove', values }),
    },
    FieldPath: {},
  };
});

// "ab123" owns the folder "f1" and already added "cd456". "ef789" has an account but no access.
// "xy999" and the "zz" NetIDs have never signed in to CU Apts.
const resetFakes = () => {
  Object.keys(mockDb).forEach((name) => delete mockDb[name]);
  mockDb.folders = {
    f1: { name: 'Collegetown 2027', userId: 'ab123', members: ['cd456'], apartments: [] },
  };
  Object.keys(mockAccounts).forEach((email) => delete mockAccounts[email]);
  ['ab123', 'cd456', 'ef789'].forEach((uid) => {
    mockAccounts[`${uid}@cornell.edu`] = uid;
  });
  mockSendMail.mockReset();
  mockSendMail.mockResolvedValue({});
  inviteRateLimiter.resetKey('ab123');
};

const as = (uid: string) => ({ Authorization: `Bearer ${uid}` });
const sendInvite = (uid: string, netId: unknown, folderId = 'f1') =>
  request(app).post(`/api/folders/${folderId}/invites`).set(as(uid)).send({ netId });
const savedInvites = () => Object.keys(mockDb.folderInvites ?? {});

beforeAll(() => {
  process.env.CUAPTS_EMAIL = 'cuapts@example.com';
  process.env.CUAPTS_EMAIL_APP_PASSWORD = 'test-password';
});

beforeEach(resetFakes);

describe('normalizeNetId and buildInviteEmail', () => {
  it('accepts NetIDs and cleans up spaces and capital letters', () => {
    expect(normalizeNetId('km2253')).toBe('km2253');
    expect(normalizeNetId('  ABC123 ')).toBe('abc123');
  });

  it('rejects anything that is not a NetID', () => {
    ['', 'k2253', 'abcd123', 'km', '2253', 'km2253@cornell.edu', 'km 2253', 42, undefined].forEach(
      (input) => expect(normalizeNetId(input)).toBeNull()
    );
  });

  it('escapes user-typed names in the HTML and links to the invite', () => {
    const { html, text } = buildInviteEmail('<b>Karan</b>', 'Apts & "Co"', 'f1_cd456');
    expect(html).toContain('&lt;b&gt;Karan&lt;/b&gt;');
    expect(html).toContain('Apts &amp; &quot;Co&quot;');
    expect(html).not.toContain('<b>Karan</b>');
    expect(text).toContain('https://www.cuapts.org/folder-invite/f1_cd456');
  });
});

describe('POST /api/folders/:folderId/invites', () => {
  it('lets the owner invite a NetID: saves a pending invite and emails it', async () => {
    const res = await sendInvite('ab123', ' XY999 ');
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'f1_xy999', inviteeNetId: 'xy999', status: 'PENDING' });
    expect(mockDb.folderInvites.f1_xy999).toMatchObject({
      folderId: 'f1',
      folderName: 'Collegetown 2027',
      invitedBy: 'ab123',
      invitedByName: 'User ab123',
      inviteeEmail: 'xy999@cornell.edu',
      status: 'PENDING',
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.to).toBe('xy999@cornell.edu');
    expect(mail.html).toContain('Collegetown 2027');
    expect(mail.text).toContain('/folder-invite/f1_xy999');
  });

  it('returns 400 for a missing or invalid NetID and sends nothing', async () => {
    expect((await sendInvite('ab123', 'not a netid')).status).toBe(400);
    expect((await sendInvite('ab123', undefined)).status).toBe(400);
    expect(savedInvites()).toEqual([]);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('only lets the owner invite people (members and other users get 403)', async () => {
    expect((await sendInvite('cd456', 'xy999')).status).toBe(403);
    expect((await sendInvite('ef789', 'xy999')).status).toBe(403);
    expect(savedInvites()).toEqual([]);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('returns 404 when the folder does not exist', async () => {
    expect((await sendInvite('ab123', 'xy999', 'missing')).status).toBe(404);
  });

  it('returns 409 when the person already has access (a member or the owner)', async () => {
    const res = await sendInvite('ab123', 'cd456');
    expect(res.status).toBe(409);
    expect(res.text).toBe('cd456 already has access to this folder');
    expect((await sendInvite('ab123', 'ab123')).status).toBe(409);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('returns 409 while an invite is pending, but allows a new invite after a decline', async () => {
    expect((await sendInvite('ab123', 'ef789')).status).toBe(201);
    expect((await sendInvite('ab123', 'ef789')).status).toBe(409);
    expect(mockSendMail).toHaveBeenCalledTimes(1);

    mockDb.folderInvites.f1_ef789.status = 'DECLINED';
    expect((await sendInvite('ab123', 'ef789')).status).toBe(201);
    expect(mockDb.folderInvites.f1_ef789.status).toBe('PENDING');
  });

  it('removes the invite and returns 500 if the email fails, so the owner can retry', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP is down'));
    expect((await sendInvite('ab123', 'xy999')).status).toBe(500);
    expect(savedInvites()).toEqual([]);
    expect((await sendInvite('ab123', 'xy999')).status).toBe(201);
  });

  it(`limits each owner to ${INVITES_PER_HOUR} invites per hour; failed requests don't count`, async () => {
    expect((await sendInvite('ab123', 'bad netid')).status).toBe(400);
    for (let i = 0; i < INVITES_PER_HOUR; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      expect((await sendInvite('ab123', `zz${i}`)).status).toBe(201);
    }

    const blocked = await sendInvite('ab123', 'zz99');
    expect(blocked.status).toBe(429);
    expect(mockDb.folderInvites.f1_zz99).toBeUndefined();
    expect(mockSendMail).toHaveBeenCalledTimes(INVITES_PER_HOUR);
  });
});
