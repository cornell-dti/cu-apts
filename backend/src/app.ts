import express, { Express } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import { db } from './firebase-config';
import { Section } from './firebase-config/types';
import { Review, Landlord, Building } from '../../common/types/db-types';
import authenticate from './auth';

const app: Express = express();
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const aptCollection = db.collection('buildings');

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
    doc.set({ ...review, date: new Date(review.date) });
    res.status(201).send(doc.id);
  } catch (err) {
    res.status(401).send('Error');
  }
});

app.get('/reviews/:idType/:id', async (req, res) => {
  const { idType, id } = req.params;
  const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    let data = doc.data();
    data = { ...data, date: data.date.toDate() };
    return data as Review;
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
    res.status(400).send(err);
  }
});

app.get('/reviews', async (req, res) => {
  try {
    const query = req.query.q as string;
    const landlordDocs = (await landlordCollection.get()).docs;
    const landlords: Landlord[] = landlordDocs.map((landlord) => landlord.data() as Landlord);
    const aptDocs = (await aptCollection.get()).docs;
    const apts: Building[] = aptDocs.map((apt) => apt.data() as Building);
    const aptsLandlords: (Landlord | Building)[] = [...landlords, ...apts];

    const options = {
      keys: ['name', 'address'],
    };
    const fuse = new Fuse(aptsLandlords, options);
    const results = fuse.search(query);
    res.status(200).send(JSON.stringify(results.map((result) => result.item)));
  } catch (err) {
    res.status(400).send(err);
  }
});

export default app;
