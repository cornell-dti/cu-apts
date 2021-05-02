import express, { Express } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import { db, FieldValue } from './firebase-config';
import { Section } from './firebase-config/types';
import {
  Review,
  Landlord,
  ReviewWithId,
  ReviewInternal,
  LandlordWithId,
  LandlordWithLabel,
  ApartmentWithLabel,
  ApartmentWithId,
} from '../../common/types/db-types';
import authenticate from './auth';

const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const aptCollection = db.collection('buildings');
const likesCollection = db.collection('likes');

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(morgan('combined'));

app.get('/', async (_, res) => {
  const snapshot = await db.collection('faqs').get();

  const faqs: Section[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const section: Section = {
      headerName: data.headerName,
      faqs: data.faqs,
    };
    faqs.push(section);
  });

  res.status(200).send(JSON.stringify(faqs));
});

app.post('/new-review', authenticate, async (req, res) => {
  try {
    const doc = reviewCollection.doc();
    const review = req.body as Review;
    doc.set({ ...review, date: new Date(review.date), likes: 0 });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

app.get('/reviews/:idType/:id', async (req, res) => {
  const { idType, id } = req.params;
  const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
});

app.get('/apts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await aptCollection.doc(id).get();
    const aptDoc = { id, ...snapshot.data() } as ApartmentWithId;
    res.status(200).send(JSON.stringify(aptDoc));
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/landlords', async (req, res) => {
  try {
    const doc = landlordCollection.doc();
    const landlord: Landlord = req.body as Landlord;
    doc.set(landlord);
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

const isLandlord = (obj: LandlordWithId | ApartmentWithId): boolean => 'contact' in obj;

app.get('/reviews', async (req, res) => {
  try {
    const query = req.query.q as string;
    const landlordDocs = (await landlordCollection.get()).docs;
    const landlords: LandlordWithId[] = landlordDocs.map(
      (landlord) => ({ id: landlord.id, ...landlord.data() } as LandlordWithId)
    );
    const aptDocs = (await aptCollection.get()).docs;
    const apts: ApartmentWithId[] = aptDocs.map(
      (apt) => ({ id: apt.id, ...apt.data() } as ApartmentWithId)
    );
    const aptsLandlords: (LandlordWithId | ApartmentWithId)[] = [...landlords, ...apts];

    const options = {
      keys: ['name', 'address'],
    };
    const fuse = new Fuse(aptsLandlords, options);
    const results = fuse.search(query);
    const resultItems = results.map((result) => result.item);

    const resultsWithType: (LandlordWithLabel | ApartmentWithLabel)[] = resultItems.map((result) =>
      isLandlord(result)
        ? ({ label: 'LANDLORD', ...result } as LandlordWithLabel)
        : ({ label: 'APARTMENT', ...result } as ApartmentWithLabel)
    );
    res.status(200).send(JSON.stringify(resultsWithType));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

app.post('/add-like', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('not authenticated');
    const { uid } = req.user;
    const { reviewId } = req.body;
    if (!reviewId) throw new Error('must specify review id');
    const likesRef = likesCollection.doc(uid);
    const reviewRef = reviewCollection.doc(reviewId);
    await db.runTransaction(async (t) => {
      const likesDoc = await t.get(likesRef);
      const result = likesDoc.get(reviewId);
      if (!result) {
        t.set(likesRef, { [reviewId]: true }, { merge: true });
        t.update(reviewRef, { likes: FieldValue.increment(1) });
      }
    });
    res.status(200).send(JSON.stringify({ result: 'Success' }));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

app.post('/remove-like', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('not authenticated');
    const { uid } = req.user;
    const { reviewId } = req.body;
    if (!reviewId) throw new Error('must specify review id');
    const likesRef = likesCollection.doc(uid);
    const reviewRef = reviewCollection.doc(reviewId);
    await db.runTransaction(async (t) => {
      const likesDoc = await t.get(likesRef);
      const result = likesDoc.get(reviewId);
      if (result) {
        likesRef.set({ [reviewId]: FieldValue.delete() }, { merge: true });
        reviewRef.update({ likes: FieldValue.increment(-1) });
      }
    });
    res.status(200).send(JSON.stringify({ result: 'Success' }));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

export default app;
