import firebaseTest from '@firebase/testing';
import request from 'supertest';
import app from './app';
import { db } from './firebase';

describe('firestore permissions', () => {
  beforeEach(() => {
    firebaseTest.clearFirestoreData({
      projectId: "cuapts-68201"
    });
  })

  it("Sample test", () => {
    expect(1).toBe(1);
  })

  it("Can read items in the faq collection", async() => {
    const firestore = firebaseTest.initializeTestApp({projectId: "cuapts-68201"}).firestore()
    const testDoc = firestore.collection("faqs").doc("testDoc")
    await firebaseTest.assertSucceeds(testDoc.get());
  })

  it("Can't write to items in the faq collection", async() => {
    const firestore = firebaseTest.initializeTestApp({projectId: "cuapts-68201"}).firestore()
    const testDoc = firestore.collection("faqs").doc("testDoc2")
    await firebaseTest.assertFails(testDoc.set({foo: "bar"}));
  })

})

describe("Faqs", ()=> {
  // the get request should get faqs 
  it("get faqs", async () => {

      const response = await request(app).get('/');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ count: 2 });
  });

  // faqs should exist in the firestore collection
  it('faqs should exist', async() => {
    const faqs = db.collection('faqs').get();
    const result = await faqs

    expect(result).toBeTruthy();
    return Promise.resolve();
});
})