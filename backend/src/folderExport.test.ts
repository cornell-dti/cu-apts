/**
 * folderExport.test.ts
 *
 * Tests for exporting a saved apartment folder as a CSV file.
 *
 * Run with: npx jest src/folderExport.test.ts --forceExit
 */
import request from 'supertest';
import { ApartmentWithId } from '@common/types/db-types';
import app from './app';
import { buildFolderCSV, escapeCSVField } from './folderExport';

// Fake database the tests read from, so they never touch the real Firebase
const mockFolders: Record<string, unknown> = {};
const mockBuildings: Record<string, unknown> = {};

// Use the fake database instead of Firebase. Logging in with "Bearer abc" makes you user "abc".
jest.mock('./firebase-config', () => ({
  db: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => {
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

  it('leaves cells empty when room types are missing', () => {
    const noRoomTypes = { ...apartment, roomTypes: [] };
    expect(buildFolderCSV([noRoomTypes])).toBe(
      `${HEADER}\nEddygate,110 Dryden Rd,Collegetown,,,https://www.cuapts.org/apartment/1`
    );
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

  it('lets the owner download their folder as a CSV', async () => {
    const res = await request(app)
      .get('/api/folders/myFolder/export')
      .set('Authorization', 'Bearer owner');
    expect(res.status).toBe(200);
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
    expect(res.text).toBe(buildFolderCSV([apartment]));
  });
});
