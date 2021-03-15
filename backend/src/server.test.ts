import {
  initializeTestApp,
  clearFirestoreData,
  assertSucceeds,
  assertFails,
} from '@firebase/testing';
import request from 'supertest';
import app from './app';
import { db } from './firebase';

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
