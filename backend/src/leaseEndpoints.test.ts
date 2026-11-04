/**
 * leaseEndpoints.test.ts
 *
 * Tests the optional leaseSigned / leaseStart fields on the review endpoints in app.ts:
 * - POST /api/new-review: invalid dates are rejected before any write; absent dates are not stored
 * - POST /api/edit-review/:reviewId: null/"" deletes the stored field, omitted keys are left out
 *   of the update, and a date that conflicts with a stored one is rejected
 *
 * Firebase is replaced with a fake, so these tests never touch real data and don't need the
 * Firestore emulator.
 *
 * Run from the backend folder with: npx jest src/leaseEndpoints.test.ts --forceExit
 */
import request from 'supertest';
import app from './app';

// Stand-in for FieldValue.delete(), so tests can check which fields were marked for deletion
const mockDeleteSentinel = { __fieldValue: 'delete' };

// Fake review documents. mockSet is the write for a new review, mockUpdate the write for an edit.
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockGet = jest.fn();

// Logging in with "Bearer abc" makes you user "abc" with the email abc@cornell.edu.
jest.mock('./firebase-config', () => ({
  db: {
    collection: () => ({
      // doc() with no id is a new review; doc(id) is an existing one
      doc: (id?: string) =>
        id === undefined
          ? { id: 'newReviewId', set: (...args: unknown[]) => mockSet(...args) }
          : {
              id,
              get: (...args: unknown[]) => mockGet(...args),
              update: (...args: unknown[]) => mockUpdate(...args),
            },
    }),
  },
  auth: {
    verifyIdToken: async (token: string) => ({ uid: token, email: `${token}@cornell.edu` }),
  },
  FieldValue: { delete: () => mockDeleteSentinel },
  FieldPath: {},
}));

const baseReview = { overallRating: 4, reviewText: 'Good place', date: '2025-06-01' };

const storedReview = {
  userId: 'owner',
  status: 'APPROVED',
  reports: [],
  ...baseReview,
  leaseSigned: '2025-01',
  leaseStart: '2025-09',
};

const newReview = (body: Record<string, unknown>) =>
  request(app)
    .post('/api/new-review')
    .set('Authorization', 'Bearer owner')
    .send({ ...baseReview, ...body });

const editReview = (body: Record<string, unknown>) =>
  request(app)
    .post('/api/edit-review/rev1')
    .set('Authorization', 'Bearer owner')
    .send({ ...baseReview, ...body });

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: () => storedReview });
  mockSet.mockResolvedValue(undefined);
  mockUpdate.mockResolvedValue(undefined);
});

describe('POST /api/new-review lease dates', () => {
  it('returns 400 and does not write when a date is invalid', async () => {
    const res = await newReview({ leaseSigned: '2025-13', leaseStart: '2025-09' });
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/leaseSigned/);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('returns 400 and does not write when signed is after start', async () => {
    const res = await newReview({ leaseSigned: '2025-10', leaseStart: '2025-09' });
    expect(res.status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('writes valid dates', async () => {
    const res = await newReview({ leaseSigned: '2025-01', leaseStart: '2025-09' });
    expect(res.status).toBe(201);
    expect(res.text).toBe('newReviewId');
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet.mock.calls[0][0]).toMatchObject({
      leaseSigned: '2025-01',
      leaseStart: '2025-09',
    });
  });

  it.each([
    ['null', null],
    ['an empty string', ''],
  ])('does not store dates sent as %s', async (_label, empty) => {
    const res = await newReview({ leaseSigned: empty, leaseStart: empty });
    expect(res.status).toBe(201);
    expect(mockSet).toHaveBeenCalledTimes(1);
    const written = mockSet.mock.calls[0][0];
    expect(written).not.toHaveProperty('leaseSigned');
    expect(written).not.toHaveProperty('leaseStart');
  });
});

describe('POST /api/edit-review/:reviewId lease dates', () => {
  it.each([
    ['null', null],
    ['an empty string', ''],
  ])('deletes the stored fields when sent as %s', async (_label, empty) => {
    const res = await editReview({ leaseSigned: empty, leaseStart: empty });
    expect(res.status).toBe(201);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updated = mockUpdate.mock.calls[0][0];
    expect(updated.leaseSigned).toBe(mockDeleteSentinel);
    expect(updated.leaseStart).toBe(mockDeleteSentinel);
  });

  it('leaves omitted keys out of the update', async () => {
    const res = await editReview({});
    expect(res.status).toBe(201);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updated = mockUpdate.mock.calls[0][0];
    expect(updated).not.toHaveProperty('leaseSigned');
    expect(updated).not.toHaveProperty('leaseStart');
  });

  it('updates only the key that was sent', async () => {
    const res = await editReview({ leaseStart: '2025-10' });
    expect(res.status).toBe(201);
    const updated = mockUpdate.mock.calls[0][0];
    expect(updated.leaseStart).toBe('2025-10');
    expect(updated).not.toHaveProperty('leaseSigned');
  });

  it('returns 400 and does not write when a new date conflicts with the stored leaseSigned', async () => {
    // Stored leaseSigned is 2025-01; a leaseStart of 2024-12 would put the start before signing
    const res = await editReview({ leaseStart: '2024-12' });
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/leaseSigned must not be after leaseStart/);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 500 when the write fails', async () => {
    mockUpdate.mockRejectedValue(new Error('Database unavailable'));
    // Hide the expected error log so the test output stays readable
    const hideErrors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await editReview({});
    expect(res.status).toBe(500);
    hideErrors.mockRestore();
  });
});
