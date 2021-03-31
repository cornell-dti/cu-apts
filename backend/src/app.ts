import express, { Express } from 'express';
import cors from 'cors';
import { db } from './firebase';
import { Section } from './firebase/types';
import { Review } from '../../common/types/db-types';
import authenticate from './auth';

const app: Express = express();
const reviewCollection = db.collection('reviews');

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
    const review: Review = req.body as Review;
    doc.set(review);
    res.status(201).send(doc.id);
  } catch (_) {
    res.status(400).send('Error');
  }
});

app.get('/auth-test', authenticate, async (req, res) => {
  res.send(req.user);
});

export default app;
