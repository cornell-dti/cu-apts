// eslint-disable-next-line
import {
  initializeTestApp,
  initializeAdminApp,
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

describe('shared folder permissions', () => {
  const projectId = 'cuapts-68201';
  // A browser signed in as this person (no uid means signed out)
  const browserAs = (uid?: string, email = `${uid}@cornell.edu`) =>
    initializeTestApp({ projectId, auth: uid ? { uid, email } : undefined }).firestore();
  const folderAs = (uid?: string, email?: string) =>
    browserAs(uid, email).collection('folders').doc('shared');

  beforeEach(async () => {
    await clearFirestoreData({ projectId });
    // The backend (admin) saves folders, so the rules don't apply here
    await initializeAdminApp({ projectId })
      .firestore()
      .collection('folders')
      .doc('shared')
      .set({ name: 'Collegetown', userId: 'owner', members: ['member'], apartments: [] });
  });

  it('lets the owner and members read the folder, so they can listen for changes', async () => {
    await assertSucceeds(folderAs('owner').get());
    await assertSucceeds(folderAs('member').get());
  });

  it('blocks everyone else, including people who are signed out', async () => {
    await assertFails(folderAs('stranger').get());
    await assertFails(folderAs().get());
  });

  it('only allows Cornell accounts', async () => {
    await assertFails(folderAs('member', 'member@gmail.com').get());
  });

  it('does not allow listing folders or writing from the browser', async () => {
    await assertFails(browserAs('owner').collection('folders').get());
    await assertFails(folderAs('owner').update({ name: 'Renamed' }));
    await assertFails(browserAs('owner').collection('folders').doc('new').set({ userId: 'owner' }));
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
