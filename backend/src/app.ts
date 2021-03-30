import express, { Express } from 'express';
import cors from 'cors';
import { db } from './firebase';
import { Section } from './firebase/types';
import { Review } from '../../common/types/db-types';

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

app.post('/new-review', async (req, res) => {
  const doc = reviewCollection.doc();
  const review: Review = req.body as Review;
  doc.set(review);
  res.status(201).send(doc.id);
});

const getReviewsByType = async (id: string, idType: string) => {
  const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => doc.data() as Review);
  return reviews;
};

app.get('/reviews/:idType/:id', async (req, res) => {
  const { idType, id } = req.params;
  const reviews: Review[] = await getReviewsByType(id, idType);
  res.status(200).send(JSON.stringify(reviews));
});

export default app;
