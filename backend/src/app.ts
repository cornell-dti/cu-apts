import express, { Express } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import rateLimit from 'express-rate-limit';
import { db, increment } from './firebase-config';
import { Section } from './firebase-config/types';
import { Review, Landlord, Apartment, ReviewWithId } from '../../common/types/db-types';
import authenticate from './auth';

const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const aptCollection = db.collection('buildings');

const app: Express = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
});

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.get('/', async (req, res) => {
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
    const review = { ...data, date: data.date.toDate() } as Review;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
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

app.get('/reviews', async (req, res) => {
  try {
    const query = req.query.q as string;
    const landlordDocs = (await landlordCollection.get()).docs;
    const landlords: Landlord[] = landlordDocs.map((landlord) => landlord.data() as Landlord);
    const aptDocs = (await aptCollection.get()).docs;
    const apts: Apartment[] = aptDocs.map((apt) => apt.data() as Apartment);
    const aptsLandlords: (Landlord | Apartment)[] = [...landlords, ...apts];

    const options = {
      keys: ['name', 'address'],
    };
    const fuse = new Fuse(aptsLandlords, options);
    const results = fuse.search(query);
    res.status(200).send(JSON.stringify(results));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

app.post('/like-review', limiter, async (req, res) => {
  try {
    const { reviewId } = req.body;
    const reviewRef = reviewCollection.doc(reviewId);
    reviewRef.update({ likes: increment(1) });
    res.status(200).send(JSON.stringify({ result: 'Success' }));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

export default app;
