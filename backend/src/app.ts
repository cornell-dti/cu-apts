import express, { Express } from 'express';
import cors from 'cors';
import { db } from './firebase';
import { Section } from './firebase/types';
import { Review, Landlord, Apartment } from '../../common/types/db-types';
import generateKeywords from './utils/generateKeywords';

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

app.post('/new-review', async (req, res) => {
  const doc = reviewCollection.doc();
  const review: Review = req.body as Review;
  doc.set(review);
  res.status(201).send(doc.id);
});

app.get('/reviews/:idType/:id', async (req, res) => {
  const { idType, id } = req.params;
  const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => doc.data() as Review);
  res.status(200).send(JSON.stringify(reviews));
});

app.post('/landlords', async (req, res) => {
  const doc = landlordCollection.doc();
  const landlord: Landlord = req.body as Landlord;
  const searchableKeywords: string[] = generateKeywords(landlord.name);
  const data = { ...landlord, searchableKeywords };
  doc.set(data);
  res.status(201).send(doc.id);
});

app.get('/reviews/:query', async (req, res) => {
  const { query } = req.params;
  const landlordDocs = (
    await landlordCollection
      .where('searchableKeywords', 'array-contains', query.trim().toLowerCase())
      .get()
  ).docs;
  const landlords: Landlord[] = landlordDocs.map((landlord) => landlord.data() as Landlord);
  const aptDocs = (
    await aptCollection
      .where('searchableKeywords', 'array-contains', query.trim().toLowerCase())
      .get()
  ).docs;
  const apts: Apartment[] = aptDocs.map((apt) => apt.data() as Apartment);
  const result: (Landlord | Apartment)[] = [...landlords, ...apts];
  res.status(200).send(JSON.stringify(result));
});

export default app;
