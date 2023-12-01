/**
 * This file contains the backend logic for handling API requests related to reviews, landlords, apartments,
 * and user interactions. It utilizes Express.js for routing and Firebase for data storage.
 * Ensure you have the necessary dependencies installed: express, cors, fuse.js, morgan, and @common/types/db-types.
 * This file exports an Express app instance with defined routes for various functionalities.
 * Make sure to set up Firebase configuration in 'firebase-config.ts'.
 */

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
import { db, FieldValue, FieldPath } from './firebase-config';
import { Faq } from './firebase-config/types';
import authenticate from './auth';

// Define Firebase collections
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const buildingsCollection = db.collection('buildings');
const likesCollection = db.collection('likes');
const usersCollection = db.collection('users');

// Create an Express app instance
const app: Express = express();

// Middleware setup
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(morgan('combined'));

/**
 * Endpoint to retrieve FAQs from the database.
 * @route GET /api/faqs
 */
app.get('/api/faqs', async (_, res) => {
  // Fetch FAQs from the 'faqs' collection
  const snapshot = await db.collection('faqs').get();
  const faqs: Faq[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return { question: data.question, answer: data.answer };
  });
  res.status(200).send(JSON.stringify(faqs));
});

/**
 * Endpoint to submit a new review.
 * @route POST /api/new-review
 * @middleware authenticate - Ensures user authentication before submitting a review.
 */
app.post('/api/new-review', authenticate, async (req, res) => {
  try {
    const doc = reviewCollection.doc();
    const review = req.body as Review;

    // Check for missing fields in the review
    if (review.overallRating === 0 || review.reviewText === '') {
      res.status(401).send('Error: missing fields');
    }

    // Set review details in the database
    doc.set({ ...review, date: new Date(review.date), likes: 0, status: 'PENDING' });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

/**
 * Endpoint to retrieve reviews based on ID type and status.
 * @route GET /api/review/:idType/:id/:status
 */
app.get('/api/review/:idType/:id/:status', async (req, res) => {
  const { idType, id, status } = req.params;
  // Fetch reviews based on ID type, ID, and status
  const reviewDocs = await reviewCollection
    .where(`${idType}`, '==', id)
    .where('status', '==', status)
    .get();
  const reviews: ReviewWithId[] = reviewDocs.docs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
});

/**
 * Endpoint to retrieve reviews based on status.
 * @route GET /api/review/:status
 */
app.get('/api/review/:status', async (req, res) => {
  const { status } = req.params;
  // Fetch reviews based on status
  const reviewDocs = await reviewCollection.where('status', '==', status).get();
  const reviews: ReviewWithId[] = reviewDocs.docs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
});

/**
 * Endpoint to retrieve reviews marked as helpful by the user.
 * @route GET /api/review/like/:uid
 * @middleware authenticate - Ensures user authentication before fetching liked reviews.
 */
app.get('/api/review/like/:uid', authenticate, async (req, res) => {
  if (!req.user) throw new Error('not authenticated');
  const { uid } = req.user;
  const likesDoc = await likesCollection.doc(uid).get();

  if (likesDoc.exists) {
    const data = likesDoc.data();
    if (data) {
      const reviewIds = Object.keys(data);
      const matchingReviews: ReviewWithId[] = [];
      // Fetch liked reviews from the database
      const querySnapshot = await reviewCollection
        .where(FieldPath.documentId(), 'in', reviewIds)
        .where('status', '==', 'APPROVED')
        .get();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const reviewData = { ...data, date: data.date.toDate() };
        matchingReviews.push({ ...reviewData, id: doc.id } as ReviewWithId);
      });
      res.status(200).send(JSON.stringify(matchingReviews));
      return;
    }
  }

  res.status(200).send(JSON.stringify([]));
});

/**
 * Endpoint to retrieve the count of approved reviews for a specific location.
 * @route GET /api/review/:location/count
 */
app.get('/api/review/:location/count', async (req, res) => {
  const { location } = req.params;
  // Fetch buildings in the specified location
  const buildingsByLocation = await buildingsCollection.where('area', '==', location).get();
  const buildingIds = buildingsByLocation.docs.map((doc) => doc.id);

  // Fetch all approved reviews
  const reviewDocs = await reviewCollection.where('status', '==', 'APPROVED').get();
  const reviews: ReviewWithId[] = reviewDocs.docs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });

  // Count the number of approved reviews for the specified location
  const approvedReviewCount = reviews.filter((review) =>
    buildingIds.includes(review.aptId ? review.aptId : '0')
  ).length;

  res.status(200).send(JSON.stringify({ count: approvedReviewCount }));
});

/**
 * Endpoint to retrieve apartment details based on IDs.
 * @route GET /api/apts/:ids
 */
app.get('/api/apts/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    const idsList = ids.split(',');
    // Fetch apartment details based on IDs
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

/**
 * Endpoint to retrieve details of a specific landlord.
 * @route GET /api/landlord/:id
 */
app.get('/api/landlord/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = landlordCollection.doc(id);
    // Fetch details of the specified landlord
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

/**
 * Endpoint to retrieve buildings associated with a specific landlord.
 * @route GET /api/buildings/:landlordId
 */
app.get('/api/buildings/:landlordId', async (req, res) => {
  try {
    const { landlordId } = req.params;
    // Fetch buildings associated with the specified landlord
    const buildingRefs = await buildingsCollection.where('landlordId', '==', landlordId).get();
    const buildings = buildingRefs.docs.map((doc) => doc.data() as Apartment);
    res.status(201).send(buildings);
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * Helper function to fetch additional data for each building.
 * @param buildings - Array of buildings.
 * @returns Promise - Array of building data with additional details.
 */
const pageData = async (buildings: ApartmentWithId[]) =>
  Promise.all(
    buildings.map(async (buildingData) => {
      const { id, landlordId } = buildingData;
      if (landlordId === null) {
        throw new Error('Invalid landlordId');
      }

      // Fetch approved reviews for the building
      const reviewList = await reviewCollection
        .where(`aptId`, '==', id)
        .where('status', '==', 'APPROVED')
        .get();
      // Fetch details of the building's landlord
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

/**
 * Endpoint to retrieve details of all buildings associated with a specific landlord.
 * @route GET /api/buildings/all/:landlordId
 */
app.get('/api/buildings/all/:landlordId', async (req, res) => {
  const { landlordId } = req.params;
  const buildingDocs = await buildingsCollection.where('landlordId', '==', landlordId).get();
  const buildings: ApartmentWithId[] = buildingDocs.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );
  res.status(200).send(JSON.stringify(await pageData(buildings)));
});

/**
 * Endpoint to submit a new landlord.
 * @route POST /api/new-landlord
 */
app.post('/api/new-landlord', async (req, res) => {
  try {
    const doc = landlordCollection.doc();
    const landlord: Landlord = req.body as Landlord;
    // Set landlord details in the database
    doc.set(landlord);
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

/**
 * Helper function to check if an object is a landlord.
 * @param obj - Object to be checked.
 * @returns boolean - True if the object is a landlord, false otherwise.
 */
const isLandlord = (obj: LandlordWithId | ApartmentWithId): boolean => 'contact' in obj;

/**
 * Endpoint to set data for the app, including landlords and apartments.
 * @route POST /api/set-data
 */
app.post('/api/set-data', async (req, res) => {
  try {
    const landlordDocs = await landlordCollection.get();
    const landlords: LandlordWithId[] = landlordDocs.docs.map(
      (landlord) => ({ id: landlord.id, ...landlord.data() } as LandlordWithId)
    );
    const aptDocs = await buildingsCollection.get();
    const apts: ApartmentWithId[] = aptDocs.docs.map(
      (apt) => ({ id: apt.id, ...apt.data() } as ApartmentWithId)
    );
    // Set landlords and apartments in app settings
    app.set('landlords', landlords);
    app.set('apts', apts);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

/**
 * Endpoint to search for landlords and apartments based on a query.
 * @route GET /api/search
 */
app.get('/api/search', async (req, res) => {
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

    // Assign labels to search results based on type (Landlord or Apartment)
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

app.get('/api/search-results', async (req, res) => {
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

/*
 * assumption, what you return for a given page may be different
 * currently, we are assuming 'home' as a potential input and a default case for everything else for the page
 * for the home case, we are returning the top (size) apartments, top being having the most reviews
 */
app.get('/api/page-data/:page/:size', async (req, res) => {
  const { page, size } = req.params;
  let buildingDocs;
  let buildingData;

  if (page !== 'home') {
    // we only limit on size off the bat if we are not the homepage
    buildingDocs = (await buildingsCollection.limit(Number(size)).get()).docs;
  } else {
    buildingDocs = (await buildingsCollection.get()).docs;
  }

  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  if (page === 'home') {
    const buildingReviewCounts = (await pageData(buildings)).map((elem) => [elem.numReviews, elem]);
    buildingReviewCounts.sort().reverse();
    buildingData = buildingReviewCounts.splice(0, Number(size)).map((elem) => elem[1]);
  } else {
    buildingData = await pageData(buildings);
  }

  const returnData = JSON.stringify({
    buildingData,
    isEnded: buildings.length < Number(size),
  });

  res.status(200).send(returnData);
});

app.get('/api/location/:loc', async (req, res) => {
  const { loc } = req.params;
  const buildingDocs = (await buildingsCollection.where(`area`, '==', loc.toUpperCase()).get())
    .docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  const data = JSON.stringify(await pageData(buildings));
  res.status(200).send(data);
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

app.post('/api/add-like', authenticate, likeHandler(false));

app.post('/api/remove-like', authenticate, likeHandler(true));

// Endpoint to update a review by its document ID
app.put('/api/:reviewId/edit', async (req, res) => {
  try {
    const { reviewId } = req.params; // Extract the review document ID from the request parameters
    const review = req.body as Review; // Get the review data from the request body and cast it to the "Review" type

    // Check if the required fields (overallRating and reviewText) are missing or invalid
    if (review.overallRating === 0 || review.reviewText === '') {
      res.status(401).send('Error: missing fields');
    }

    const newReview = { ...review, date: new Date(review.date), status: 'PENDING' };
    // Update the review document in the database with the provided data
    await reviewCollection.doc(reviewId).update(newReview);

    // Send a success response with the updated review document ID
    res.status(200).send(newReview);
  } catch (err) {
    // Handle any errors that may occur during the update process
    console.error(err);
    res.status(400).send('Error');
  }
});

// Endpoint to delete a review by its document ID
app.put('/api/delete-review/:reviewId', async (req, res) => {
  const { reviewId } = req.params; // Extract the review document ID from the request parameters
  try {
    // Update the status of the review document to 'DELETED'
    await reviewCollection.doc(reviewId).update({ status: 'DELETED' });
    // Send a success response
    res.status(200).send('Success');
  } catch (err) {
    // Handle any errors that may occur during the deletion process
    console.log(err);
    res.status(500).send('Error');
  }
});

/**
 * Handles saving or removing saved apartments for a user in the database.
 *
 * @param add - If true, the apartment is added to the user's saved list. If false, it is removed.
 */
const saveApartmentHandler =
  (add = true): RequestHandler =>
  async (req, res) => {
    try {
      if (!req.user) throw new Error('Not authenticated');
      const { uid } = req.user;
      const { apartmentId } = req.body;
      if (!apartmentId) throw new Error('Must specify apartment');
      const userRef = usersCollection.doc(uid);
      if (!userRef) {
        throw new Error('User data not found');
      }
      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) {
          t.set(userRef, { apartments: [] });
        }
        const userApartments = userDoc.data()?.apartments || [];

        if (add) {
          if (!userApartments.includes(apartmentId)) {
            userApartments.push(apartmentId);
          }
        } else {
          const index = userApartments.indexOf(apartmentId);
          if (index !== -1) {
            userApartments.splice(index, 1);
          }
        }

        t.update(userRef, { apartments: userApartments });
      });

      res.status(200).send(JSON.stringify({ result: 'Success' }));
    } catch (err) {
      console.error(err);
      res.status(400).send('Error');
    }
  };

/**
 * Handles saving or removing saved landlords for a user in the database.
 *
 * @param add - If true, the landlord is added to the user's saved list. If false, it is removed.
 */
const saveLandlordHandler =
  (add = true): RequestHandler =>
  async (req, res) => {
    try {
      if (!req.user) throw new Error('Not authenticated');
      const { uid } = req.user;
      const { landlordId } = req.body;
      if (!landlordId) throw new Error('Must specify landlord');
      const userRef = usersCollection.doc(uid);
      if (!userRef) {
        throw new Error('User data not found');
      }
      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) {
          t.set(userRef, { landlords: [] });
        }
        const userLandlords = userDoc.data()?.landlords || [];

        if (add) {
          if (!userLandlords.includes(landlordId)) {
            userLandlords.push(landlordId);
          }
        } else {
          const index = userLandlords.indexOf(landlordId);
          if (index !== -1) {
            userLandlords.splice(index, 1);
          }
        }

        t.update(userRef, { landlords: userLandlords });
      });

      res.status(200).send(JSON.stringify({ result: 'Success' }));
    } catch (err) {
      console.error(err);
      res.status(400).send('Error');
    }
  };

app.post('/api/add-saved-apartment', authenticate, saveApartmentHandler(true));

app.post('/api/remove-saved-apartment', authenticate, saveApartmentHandler(false));

app.post('/api/add-saved-landlord', authenticate, saveLandlordHandler(true));

app.post('/api/remove-saved-landlord', authenticate, saveLandlordHandler(false));

app.put('/api/update-review-status/:reviewDocId/:newStatus', async (req, res) => {
  const { reviewDocId, newStatus } = req.params;
  const statusList = ['PENDING', 'APPROVED', 'DECLINED', 'DELETED'];
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
