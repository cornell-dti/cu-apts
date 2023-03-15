import express, { Express, RequestHandler } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import {
  Review,
  Landlord,
  ReviewWithId,
  ReviewInternal,
  Apartment,
  LandlordWithId,
  LandlordWithLabel,
  ApartmentWithLabel,
  ApartmentWithId,
} from '@common/types/db-types';
import { db, FieldValue } from './firebase-config';
import { Section } from './firebase-config/types';
import authenticate from './auth';

const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const buildingsCollection = db.collection('buildings');
const likesCollection = db.collection('likes');

const app: Express = express();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(morgan('combined'));

app.get('/', async (_, res) => {
  const snapshot = await db.collection('faqs').get();

  const faqs: Section[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    const section: Section = {
      headerName: data.headerName,
      faqs: data.faqs,
    };
    return section;
  });

  res.status(200).send(JSON.stringify(faqs));
});

app.post('/new-review', authenticate, async (req, res) => {
  try {
    const doc = reviewCollection.doc();
    const review = req.body as Review;
    if (review.overallRating === 0 || review.reviewText === '') {
      res.status(401).send('Error: missing fields');
    }
    doc.set({ ...review, date: new Date(review.date), likes: 0, status: 'PENDING' });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

app.get('/review/:idType/:id/:status', async (req, res) => {
  const { idType, id, status } = req.params;
  const reviewDocs = (
    await reviewCollection.where(`${idType}`, '==', id).where('status', '==', status).get()
  ).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
});

app.get('/apts/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    const idsList = ids.split(',');
    const aptsArr = await Promise.all(
      idsList.map(async (id) => {
        const snapshot = await buildingsCollection.doc(id).get();
        if (!snapshot.exists) {
          throw new Error('Invalid id');
        }
        return { id, ...snapshot.data() } as ApartmentWithId;
      })
    );
    res.status(200).send(JSON.stringify(aptsArr));
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/landlord/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = landlordCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new Error('Invalid id');
    }
    const data = doc.data() as Landlord;
    res.status(201).send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/buildings/:landlordId', async (req, res) => {
  try {
    const { landlordId } = req.params;
    const buildingRefs = await buildingsCollection.where('landlordId', '==', landlordId).get();
    const buildings = buildingRefs.docs.map((doc) => doc.data() as Apartment);
    res.status(201).send(buildings);
  } catch (err) {
    res.status(400).send(err);
  }
});

const pageData = async (buildings: ApartmentWithId[]) =>
  Promise.all(
    buildings.map(async (buildingData) => {
      const { id, landlordId } = buildingData;
      if (landlordId === null) {
        throw new Error('Invalid landlordId');
      }

      const reviewList = await reviewCollection.where(`aptId`, '==', id).get();
      const landlordDoc = await landlordCollection.doc(landlordId).get();

      const numReviews = reviewList.docs.length;
      const company = landlordDoc.data()?.name;
      return {
        buildingData,
        numReviews,
        company,
      };
    })
  );

app.get('/buildings/all/:landlordId', async (req, res) => {
  const { landlordId } = req.params;
  const buildingDocs = (await buildingsCollection.where('landlordId', '==', landlordId).get()).docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );
  res.status(200).send(JSON.stringify(await pageData(buildings)));
});

app.post('/new-landlord', async (req, res) => {
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
app.post('/set-data', async (req, res) => {
  try {
    const landlordDocs = (await landlordCollection.get()).docs;
    const landlords: LandlordWithId[] = landlordDocs.map(
      (landlord) => ({ id: landlord.id, ...landlord.data() } as LandlordWithId)
    );
    const aptDocs = (await buildingsCollection.get()).docs;
    const apts: ApartmentWithId[] = aptDocs.map(
      (apt) => ({ id: apt.id, ...apt.data() } as ApartmentWithId)
    );
    app.set('landlords', landlords);
    app.set('apts', apts);

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const landlords = req.app.get('landlords');
    const apts = req.app.get('apts');
    const aptsLandlords: (LandlordWithId | ApartmentWithId)[] = [...landlords, ...apts];

    const options = {
      keys: ['name', 'address'],
    };
    const fuse = new Fuse(aptsLandlords, options);
    const results = fuse.search(query).slice(0, 5);
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

app.get('/search-results', async (req, res) => {
  try {
    const query = req.query.q as string;
    const apts = req.app.get('apts');
    const aptsWithType: ApartmentWithId[] = apts;

    const options = {
      keys: ['name', 'address'],
    };

    const fuse = new Fuse(aptsWithType, options);
    const results = fuse.search(query);
    const resultItems = results.map((result) => result.item);

    res.status(200).send(JSON.stringify(await pageData(resultItems)));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

app.get('/page-data/:page/:size', async (req, res) => {
  const { size } = req.params;
  const collection = buildingsCollection.limit(Number(size));
  const buildingDocs = (await collection.get()).docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  const returnData = JSON.stringify({
    buildingData: await pageData(buildings),
    isEnded: buildings.length < Number(size),
  });
  res.status(200).send(returnData);
});

app.get('/location/:loc/:size', async (req, res) => {
  const { loc, size } = req.params;
  const buildingDocs = (
    await buildingsCollection.where(`area`, '==', loc.toUpperCase()).limit(Number(size)).get()
  ).docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  const returnData = JSON.stringify({
    buildingData: await pageData(buildings),
    isEnded: buildings.length < Number(size),
  });
  res.status(200).send(returnData);
});

const likeHandler =
  (dislike = false): RequestHandler =>
  async (req, res) => {
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
        if (dislike ? result : !result) {
          const likeEntry = dislike ? FieldValue.delete() : true;
          const likeChange = dislike ? -1 : 1;
          t.set(likesRef, { [reviewId]: likeEntry }, { merge: true });
          t.update(reviewRef, { likes: FieldValue.increment(likeChange) });
        }
      });
      res.status(200).send(JSON.stringify({ result: 'Success' }));
    } catch (err) {
      console.error(err);
      res.status(400).send('Error');
    }
  };

app.post('/add-like', authenticate, likeHandler(false));

app.post('/remove-like', authenticate, likeHandler(true));

app.put('/update-review-status/:reviewDocId/:newStatus', async (req, res) => {
  const { reviewDocId, newStatus } = req.params;
  const statusList = ['PENDING', 'APPROVED', 'DECLINED'];
  try {
    if (!statusList.includes(newStatus)) {
      res.status(400).send('Invalid status type');
      return;
    }
    await reviewCollection.doc(reviewDocId).update({ status: newStatus });
    res.status(200).send('Success');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error');
  }
});

export default app;
