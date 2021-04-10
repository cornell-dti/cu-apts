import express, { Express } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import { db } from './firebase';
import { Section } from './firebase/types';
import { Review, Landlord, Apartment } from '../../common/types/db-types';

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
  const reviews: Review[] = reviewDocs.map((doc) => {
    let data = doc.data();
    data = { ...data, date: data.date.toDate() };
    return data as Review;
  });
  res.status(200).send(JSON.stringify(reviews));
});

app.post('/landlords', async (req, res) => {
  const doc = landlordCollection.doc();
  const landlord: Landlord = req.body as Landlord;
  doc.set(landlord);
  res.status(201).send(doc.id);
});

app.get('/reviews/', async (req, res) => {
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
});

export default app;
