import express, { Express } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import { db } from './firebase-config';
import { Section } from './firebase-config/types';
import { Review, Landlord, Building, LandlordWithId } from '../../common/types/db-types';
import authenticate from './auth';

const app: Express = express();
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const buildingCollection = db.collection('buildings');

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
    res.status(400).send('Error');
  }
});

app.get('/reviews/:idType/:id', async (req, res) => {
  const { idType, id } = req.params;
  const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    const { date, ...data } = doc.data();
    return { date: date.toDate(), ...data } as Review;
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
    const buildingDocs = (await buildingCollection.get()).docs;
    const buildings: Building[] = buildingDocs.map((building) => building.data() as Building);
    const buildingsLandlords: (Landlord | Building)[] = [...landlords, ...buildings];

    const options = {
      keys: ['name', 'address'],
    };
    const fuse = new Fuse(buildingsLandlords, options);
    const results = fuse.search(query);
    res.status(200).send(JSON.stringify(results.map((result) => result.item)));
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/homepageData', async (req, res) => {
  const buildingDocs = (await buildingCollection.limit(3).get()).docs;
  const buildings: Building[] = buildingDocs.map((doc) => doc.data() as Building);
  // eslint-disable-next-line consistent-return
  const landlords: (LandlordWithId | undefined)[] = await Promise.all(
    // eslint-disable-next-line consistent-return
    buildings.map(async ({ landlordId }) => {
      if (landlordId) {
        // eslint-disable-next-line no-return-await
        const doc = await landlordCollection.doc(landlordId).get();
        const data = doc.data() as Landlord;
        return {
          id: landlordId,
          ...data,
        } as LandlordWithId;
      }
    })
  );

  const data = { buildings, landlords };
  res.status(200).send(JSON.stringify(data));
});

export default app;
