// eslint-disable-next-line
import {
  initializeTestApp,
  clearFirestoreData,
  assertSucceeds,
  assertFails,
} from '@firebase/testing';
import request from 'supertest';
import app from './app';
import { db } from './firebase-config';

describe('firestore permissions', () => {
  beforeEach(() => {
    clearFirestoreData({
      projectId: 'cuapts-68201',
    });
  });

  it('Sample test', () => {
    expect(1).toBe(1);
  });

  it('Can read items in the faq collection', async () => {
    const firestore = initializeTestApp({ projectId: 'cuapts-68201' }).firestore();
    const testDoc = firestore.collection('faqs').doc('testDoc');
    await assertSucceeds(testDoc.get());
    return Promise.resolve();
  });

  it("Can't write to items in the faq collection", async () => {
    const firestore = initializeTestApp({ projectId: 'cuapts-68201' }).firestore();
    const testDoc = firestore.collection('faqs').doc('testDoc2');
    await assertFails(testDoc.set({ foo: 'bar' }));
    return Promise.resolve();
  });
});

describe('Faqs', () => {
  // the get request should get faqs
  it('get faqs', async () => {
    const response = await request(app).get('/');
    expect(response.status).toEqual(200);
  });

  // faqs should exist in the firestore collection
  it('faqs should exist', async () => {
    const faqs = db.collection('faqs').get();
    const result = await faqs;

    expect(result).toBeTruthy();
    return Promise.resolve();
  });
});

describe('apartment search room filters', () => {
  const search = '/api/search-with-query-and-filters';
  const room = (id: string, price: number, beds: number) => ({ id, price, beds, baths: 1 });
  const apartment = (roomTypes: ReturnType<typeof room>[]) => ({
    id: 'room-filter-test',
    landlordId: null,
    roomTypes,
  });
  let previousApartments: unknown;

  beforeEach(() => {
    previousApartments = app.get('apts');
    app.set('apts', [apartment([room('one-bed', 1000, 1), room('two-bed', 1500, 2)])]);
  });

  afterEach(() => {
    app.set('apts', previousApartments);
  });

  it('keeps split room matches out of the exact results', async () => {
    const response = await request(app).get(search).query({ maxPrice: 1200, bedrooms: 2 });
    expect(response.status).toBe(200);
    const { main, additionalPrice, additionalBedBath } = JSON.parse(response.text);
    expect(main).toEqual([]);
    expect(additionalPrice).toHaveLength(1);
    expect(additionalBedBath).toHaveLength(1);
  });

  it('includes a room that meets all filters at the price limit', async () => {
    app.set('apts', [apartment([room('two-bed', 1200, 2)])]);
    const response = await request(app)
      .get(search)
      .query({ minPrice: 1200, maxPrice: 1200, bedrooms: 2, bathrooms: 1 });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).main).toHaveLength(1);
  });

  it.each([{ maxPrice: 1200 }, { bedrooms: 2 }])(
    'preserves a single room filter: %p',
    async (filters) => {
      const response = await request(app).get(search).query(filters);
      expect(response.status).toBe(200);
      expect(JSON.parse(response.text).main).toHaveLength(1);
    }
  );

  it('does not treat a missing-price sentinel as within budget', async () => {
    app.set('apts', [apartment([room('unknown-price', 0, 2)])]);
    const response = await request(app).get(search).query({ maxPrice: 1200 });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).main).toEqual([]);
  });

  it('includes listings without rooms if no room filter is active', async () => {
    app.set('apts', [apartment([])]);
    const response = await request(app).get(search);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).main).toHaveLength(1);
  });
});
