/**
 * folderExport.test.ts
 *
 * Tests for exporting a saved apartment folder as a CSV file:
 * - the CSV helpers in folderExport.ts (formatting, escaping, missing data)
 * - GET /api/folders/:folderId/export in app.ts (sign-in, ownership, missing data, errors)
 *
 * Firebase is replaced with a fake in-memory database, so these tests never touch real data and
 * don't need the Firestore emulator.
 *
 * Run from the backend folder with: npx jest src/folderExport.test.ts --forceExit
 */
import request from 'supertest';
import { ApartmentWithId } from '@common/types/db-types';
import app from './app';
import { buildFolderCSV, escapeCSVField, formatPriceRange } from './folderExport';

// Fake database the tests read from, so they never touch the real Firebase
const mockFolders: Record<string, unknown> = {};
const mockBuildings: Record<string, unknown> = {};

// Use the fake database instead of Firebase. Logging in with "Bearer abc" makes you user "abc".
// Reading the document with id "broken" throws, to test what happens when the database fails.
jest.mock('./firebase-config', () => ({
  db: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => {
          if (id === 'broken') throw new Error('Database unavailable');
          const data = name === 'folders' ? mockFolders[id] : mockBuildings[id];
          return { exists: data !== undefined, data: () => data };
        },
      }),
    }),
  },
  auth: {
    verifyIdToken: async (token: string) => ({ uid: token, email: `${token}@cornell.edu` }),
  },
}));

const HEADER = 'Name,Address,Neighborhood,Room Types,Price Range,Link';

const apartment: ApartmentWithId = {
  id: '1',
  name: 'Eddygate',
  address: '110 Dryden Rd',
  area: 'COLLEGETOWN',
  roomTypes: [
    { id: 'a', beds: 2, baths: 1, price: 1200 },
    { id: 'b', beds: 3, baths: 2, price: 1500 },
  ],
  landlordId: null,
  photos: [],
  latitude: 0,
  longitude: 0,
  distanceToCampus: 0,
};

describe('CSV formatting', () => {
  it('builds a header row and one row per apartment', () => {
    expect(buildFolderCSV([apartment])).toBe(
      `${HEADER}\n` +
        'Eddygate,110 Dryden Rd,Collegetown,' +
        '"2 bed, 1 bath - $1200; 3 bed, 2 bath - $1500",$1200 - $1500,' +
        'https://www.cuapts.org/apartment/1'
    );
  });

  it('wraps values that contain commas or quotes', () => {
    expect(escapeCSVField('1 Main St, Apt 2')).toBe('"1 Main St, Apt 2"');
    expect(escapeCSVField('The "Big" House')).toBe('"The ""Big"" House"');
  });

  it('turns missing values into an empty cell', () => {
    expect(escapeCSVField(null)).toBe('');
    expect(escapeCSVField(undefined)).toBe('');
  });

  it('leaves room type cells empty when an apartment has no room types', () => {
    const emptyRow = `${HEADER}\nEddygate,110 Dryden Rd,Collegetown,,,https://www.cuapts.org/apartment/1`;
    // No room types entered yet
    expect(buildFolderCSV([{ ...apartment, roomTypes: [] }])).toBe(emptyRow);
    // Not migrated from the old schema, so roomTypes doesn't exist at all
    const oldSchema = { ...apartment, roomTypes: undefined } as unknown as ApartmentWithId;
    expect(buildFolderCSV([oldSchema])).toBe(emptyRow);
  });

  it('shows one price instead of a range when every room type costs the same', () => {
    expect(formatPriceRange([{ id: 'a', beds: 1, baths: 1, price: 900 }])).toBe('$900');
  });

  it('returns only the header row for an empty folder', () => {
    expect(buildFolderCSV([])).toBe(HEADER);
  });
});

describe('GET /api/folders/:folderId/export', () => {
  beforeEach(() => {
    mockBuildings['1'] = apartment;
    mockFolders.myFolder = { userId: 'owner', apartments: ['1'] };
  });

  it('returns 401 when the user is not signed in', async () => {
    const res = await request(app).get('/api/folders/myFolder/export');
    expect(res.status).toBe(401);
  });

  it('lets the owner download their folder as a CSV file', async () => {
    const res = await request(app)
      .get('/api/folders/myFolder/export')
      .set('Authorization', 'Bearer owner');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.text).toBe(buildFolderCSV([apartment]));
  });

  it("blocks users from exporting someone else's folder", async () => {
    const res = await request(app)
      .get('/api/folders/myFolder/export')
      .set('Authorization', 'Bearer someoneElse');
    expect(res.status).toBe(403);
  });

  it('returns 404 when the folder does not exist', async () => {
    const res = await request(app)
      .get('/api/folders/missing/export')
      .set('Authorization', 'Bearer owner');
    expect(res.status).toBe(404);
  });

  it('skips apartments that no longer exist', async () => {
    mockFolders.myFolder = { userId: 'owner', apartments: ['deleted', '1'] };
    const res = await request(app)
      .get('/api/folders/myFolder/export')
      .set('Authorization', 'Bearer owner');
    expect(res.status).toBe(200);
    expect(res.text).toBe(buildFolderCSV([apartment]));
  });

  it('returns 500 when the database read fails', async () => {
    // Hide the expected error log so the test output stays readable
    const hideErrors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await request(app)
      .get('/api/folders/broken/export')
      .set('Authorization', 'Bearer owner');
    expect(res.status).toBe(500);
    hideErrors.mockRestore();
  });
});
