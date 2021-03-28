import express, { Express } from 'express';
import cors from 'cors';
import { db } from './firebase';
import { Section } from './firebase/types';
import { Review } from '../../common/types/db-types';

const app: Express = express();
const reviews = db.collection('reviews');

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
  const doc = reviews.doc();
  const review: Review = req.body;
  doc.set(review);
  res.status(201).send(doc.id);
});

export default app;
