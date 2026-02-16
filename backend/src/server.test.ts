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
    const response = await request(app).get('/api/faqs');
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

describe('Tags', () => {
  beforeEach(async () => {
    await clearFirestoreData({
      projectId: 'cuapts-68201',
    });

    await db.collection('buildings').doc('apt1').set({
      name: 'Apt 1',
      address: '123 Test St',
      landlordId: null,
      numBaths: 1,
      numBeds: 1,
      photos: [],
      area: 'COLLEGETOWN',
      latitude: 42.0,
      longitude: -76.0,
      price: 1000,
      distanceToCampus: 10,
    });
  });

  it('POST /api/tags creates a new tag (returns {id,name})', async () => {
    const response = await request(app).post('/api/tags').send({ name: 'Pet Friendly' });
    expect(response.status).toEqual(200);
    const body = JSON.parse(response.text);
    expect(typeof body.id).toEqual('string');
    expect(body.name).toEqual('Pet Friendly');
  });

  it('POST /api/tags with same name returns existing tag id (no duplicates)', async () => {
    const r1 = await request(app).post('/api/tags').send({ name: 'Pet Friendly' });
    const t1 = JSON.parse(r1.text);
    const r2 = await request(app).post('/api/tags').send({ name: '  pet friendly  ' });
    const t2 = JSON.parse(r2.text);
    expect(t2.id).toEqual(t1.id);

    const tagsSnap = await db.collection('tags').get();
    expect(tagsSnap.docs.length).toEqual(1);
  });

  it('POST /api/apts/:id/tags/:tagId attaches tag idempotently', async () => {
    const tagResp = await request(app).post('/api/tags').send({ name: 'Laundry' });
    const tag = JSON.parse(tagResp.text);

    const r1 = await request(app).post(`/api/apts/apt1/tags/${tag.id}`).send();
    expect(r1.status).toEqual(200);
    const tags1 = JSON.parse(r1.text);
    expect(tags1).toEqual([tag.id]);

    const r2 = await request(app).post(`/api/apts/apt1/tags/${tag.id}`).send();
    expect(r2.status).toEqual(200);
    const tags2 = JSON.parse(r2.text);
    expect(tags2).toEqual([tag.id]);

    const apt = await db.collection('buildings').doc('apt1').get();
    expect(apt.data()?.tags).toEqual([tag.id]);
  });

  it('DELETE /api/apts/:id/tags/:tagId detaches tag idempotently', async () => {
    const tagResp = await request(app).post('/api/tags').send({ name: 'Gym' });
    const tag = JSON.parse(tagResp.text);

    await request(app).post(`/api/apts/apt1/tags/${tag.id}`).send();

    const d1 = await request(app).delete(`/api/apts/apt1/tags/${tag.id}`).send();
    expect(d1.status).toEqual(200);
    expect(JSON.parse(d1.text)).toEqual([]);

    const d2 = await request(app).delete(`/api/apts/apt1/tags/${tag.id}`).send();
    expect(d2.status).toEqual(200);
    expect(JSON.parse(d2.text)).toEqual([]);
  });

  it('GET /api/apts/:id/tags returns correct tag names', async () => {
    const t1Resp = await request(app).post('/api/tags').send({ name: 'Pet Friendly' });
    const t2Resp = await request(app).post('/api/tags').send({ name: 'Laundry In-Unit' });
    const t1 = JSON.parse(t1Resp.text);
    const t2 = JSON.parse(t2Resp.text);

    await request(app).post(`/api/apts/apt1/tags/${t1.id}`).send();
    await request(app).post(`/api/apts/apt1/tags/${t2.id}`).send();

    const resp = await request(app).get('/api/apts/apt1/tags');
    expect(resp.status).toEqual(200);
    const tags = JSON.parse(resp.text);
    expect(tags).toEqual(
      expect.arrayContaining([
        { id: t1.id, name: 'Pet Friendly' },
        { id: t2.id, name: 'Laundry In-Unit' },
      ])
    );
  });
});
