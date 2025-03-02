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
  CantFindApartmentForm,
  CantFindApartmentFormWithId,
  QuestionForm,
  QuestionFormWithId,
  LocationTravelTimes,
} from '@common/types/db-types';
// Import Firebase configuration and types
import { auth } from 'firebase-admin';
import { Timestamp } from '@firebase/firestore-types';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { db, FieldValue, FieldPath } from './firebase-config';
import { Faq } from './firebase-config/types';
import authenticate from './auth';
import { admins } from '../../frontend/src/constants/HomeConsts';

// Imports for email sending

// Email environment variables
const cuaptsEmail = process.env.CUAPTS_EMAIL;
const cuaptsEmailPassword = process.env.CUAPTS_EMAIL_APP_PASSWORD;

// Collections in the Firestore database
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const buildingsCollection = db.collection('buildings');
const likesCollection = db.collection('likes');
const usersCollection = db.collection('users');
const pendingBuildingsCollection = db.collection('pendingBuildings');
const contactQuestionsCollection = db.collection('contactQuestions');

const travelTimesCollection = db.collection('travelTimes');

// Middleware setup
const app: Express = express();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(morgan('combined'));

// API endpoint to get FAQs
app.get('/api/faqs', async (_, res) => {
  const snapshot = await db.collection('faqs').get();

  const faqs: Faq[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    const faq: Faq = {
      question: data.question,
      answer: data.answer,
    };
    return faq;
  });

  res.status(200).send(JSON.stringify(faqs));
});

// API endpoint to post a new review
app.post('/api/new-review', authenticate, async (req, res) => {
  try {
    const doc = reviewCollection.doc();
    const review = req.body as Review;
    if (review.overallRating === 0 || review.reviewText === '') {
      res.status(401).send('Error: missing fields');
    }
    doc.set({ ...review, date: new Date(review.date), likes: 0, status: 'PENDING', reports: [] });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

// API endpoint to edit review by id
app.post('/api/edit-review/:reviewId', authenticate, async (req, res) => {
  if (!req.user) {
    throw new Error('not authenticated');
  }
  const { reviewId } = req.params;
  try {
    const reviewDoc = reviewCollection.doc(reviewId); // specific doc for the id
    const reviewData = (await reviewDoc.get()).data();
    if (!reviewData?.userId || reviewData.userId !== req.user.uid) {
      res.status(401).send('Error: user is not the review owner. not authorized');
      return;
    }
    // Don't allow edits if review is reported
    if (reviewData.status === 'REPORTED') {
      res.status(403).send('Error: cannot edit a reported review');
      return;
    }
    const updatedReview = req.body as Review;
    if (updatedReview.overallRating === 0 || updatedReview.reviewText === '') {
      res.status(401).send('Error: missing fields');
      return;
    }
    reviewDoc
      .update({
        ...updatedReview,
        date: new Date(updatedReview.date),
        status: 'PENDING',
        reports: reviewData.reports || [],
      })
      .then(() => {
        res.status(201).send(reviewId);
      });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// API endpoint to get a specific review by its specific review ID
app.get('/api/review-by-id/:reviewId', async (req, res) => {
  const { reviewId } = req.params; // Extract the review ID from the request parameters
  try {
    const reviewDoc = await reviewCollection.doc(reviewId).get(); // Get the review document from Firestore
    if (!reviewDoc.exists) {
      res.status(404).send('Review not found'); // If the document does not exist, return a 404 error
      return;
    }
    const data = reviewDoc.data();
    const review = { ...data, date: data?.date.toDate() } as ReviewInternal; // Convert the Firestore Timestamp to a Date object
    const reviewWithId = { ...review, id: reviewDoc.id } as ReviewWithId; // Add the document ID to the review data
    res.status(200).send(JSON.stringify(reviewWithId)); // Return the review data as a JSON response
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving review'); // Handle any errors that occur during the process
  }
});

// API endpoint to get reviews by ID, type and status
app.get('/api/review/:idType/:id/:status', async (req, res) => {
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

app.get('/api/review/:status', async (req, res) => {
  const { status } = req.params;
  const reviewDocs = (await reviewCollection.where('status', '==', status).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
});

/**
 * review/like/:userId – Fetches reviews liked by a user.
 *
 * @remarks
 * This endpoint retrieves reviews that a user has marked as helpful (liked). It can also filter by review status by passing in a query parameter. If no parameter is provided, no additional filter is applied.
 *
 * @route GET /api/review/like/:userId
 *
 * @status
 * - 200: Successfully retrieved the liked reviews.
 * - 401: Error due to unauthorized access or authentication issues.
 */
app.get('/api/review/like/:userId', authenticate, async (req, res) => {
  if (!req.user) {
    throw new Error('not authenticated');
  }
  const realUserId = req.user.uid;
  const { userId } = req.params;
  const statusType = req.query.status;
  if (userId !== realUserId) {
    res.status(401).send("Error: user is not authorized to access another user's likes");
    return;
  }
  const likesDoc = await likesCollection.doc(realUserId).get();

  if (likesDoc.exists) {
    const data = likesDoc.data();
    if (data) {
      const reviewIds = Object.keys(data);
      const matchingReviews: ReviewWithId[] = [];
      if (reviewIds.length > 0) {
        let query = reviewCollection.where(FieldPath.documentId(), 'in', reviewIds);
        if (statusType) {
          // filter by status if provided
          query = query.where('status', '==', statusType);
        }
        const querySnapshot = await query.get();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const reviewData = { ...data, date: data.date.toDate() };
          matchingReviews.push({ ...reviewData, id: doc.id } as ReviewWithId);
        });
      }
      res.status(200).send(JSON.stringify(matchingReviews));
      return;
    }
  }

  res.status(200).send(JSON.stringify([]));
});

/**
 * Takes in the location type in the URL and returns the number of reviews made forr that location
 */
app.get('/api/review/:location/count', async (req, res) => {
  const { location } = req.params;
  const buildingsByLocation = (await buildingsCollection.where('area', '==', location).get()).docs;
  // get IDs for buildings and filter reviews by this
  const buildingIds = buildingsByLocation.map((doc) => doc.id);
  const reviewDocs = (await reviewCollection.where('status', '==', 'APPROVED').get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  // add the counts together after data is fetched
  const approvedReviewCount = reviews.filter((review) =>
    buildingIds.includes(review.aptId ? review.aptId : '0')
  ).length;
  res.status(200).send(JSON.stringify({ count: approvedReviewCount }));
});

// API endpoint to get apartments by a list of IDs
app.get('/api/apts/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    const idsList = ids.split(',');
    // Fetching each apartment from the database and returning an array of apartment objects
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

// API endpoint to get a specific landlord by ID
app.get('/api/landlord/:id', async (req, res) => {
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

// API endpoint to get all buildings associated with a particular landlord
app.get('/api/buildings/:landlordId', async (req, res) => {
  try {
    const { landlordId } = req.params;
    const buildingRefs = await buildingsCollection.where('landlordId', '==', landlordId).get();
    const buildings = buildingRefs.docs.map((doc) => doc.data() as Apartment);
    res.status(201).send(buildings);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Function to process data for a list of buildings
const pageData = async (buildings: ApartmentWithId[]) =>
  Promise.all(
    buildings.map(async (buildingData) => {
      const { id } = buildingData;
      let { landlordId } = buildingData;
      if (landlordId == null || landlordId === '') {
        landlordId = '-1';
      }

      const reviewList = await reviewCollection
        .where(`aptId`, '==', id)
        .where('status', '==', 'APPROVED')
        .get();

      const landlordDoc = await landlordCollection.doc(landlordId).get();

      const numReviews = reviewList.docs.length;
      const company = landlordDoc.data()?.name;
      // calculate average rating using overall rating of the reviews
      const avgRating =
        reviewList.docs.reduce((acc, curr) => acc + curr.data().overallRating, 0) /
        Math.max(numReviews, 1);
      // calculate average price using price category of the reviews, excluding reviews with price 0
      const reviewsWithPrice = reviewList.docs.filter((review) => review.data().price > 0);
      const avgPrice =
        reviewsWithPrice.reduce((acc, curr) => acc + curr.data().price, 0) /
        Math.max(reviewsWithPrice.length, 1);
      return {
        buildingData,
        numReviews,
        company,
        avgRating,
        avgPrice,
      };
    })
  );

// API endpoint to get all buildings for a specific landlord
app.get('/api/buildings/all/:landlordId', async (req, res) => {
  const { landlordId } = req.params; // Extract the landlord ID from URL parameters
  // Fetching all buildings from Firestore where the landlordId matches the given ID
  const buildingDocs = (await buildingsCollection.where('landlordId', '==', landlordId).get()).docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId) // Mapping each document to an ApartmentWithId object
  );
  res.status(200).send(JSON.stringify(await pageData(buildings))); // Sending the transformed data back to the client
});

// API endpoint to add a new landlord
app.post('/api/new-landlord', async (req, res) => {
  try {
    const doc = landlordCollection.doc(); // Creating a new document in the landlord collection
    const landlord: Landlord = req.body as Landlord; // Parsing the request body as a Landlord object
    doc.set(landlord); // Setting the document in Firestore
    res.status(201).send(doc.id); // Sending back the ID of the newly created document
  } catch (err) {
    console.error(err);
    res.status(400).send('Error'); // Handling errors
  }
});

// Utility function to check if an object is a Landlord
const isLandlord = (obj: LandlordWithId | ApartmentWithId): boolean => 'contact' in obj;

// API endpoint to set application data (landlords and apartments)
app.post('/api/set-data', async (req, res) => {
  try {
    // Fetching all landlords and apartments from Firestore
    const landlordDocs = (await landlordCollection.get()).docs;
    const landlords: LandlordWithId[] = landlordDocs.map(
      (landlord) => ({ id: landlord.id, ...landlord.data() } as LandlordWithId)
    );
    const aptDocs = (await buildingsCollection.get()).docs;
    const apts: ApartmentWithId[] = aptDocs.map(
      (apt) => ({ id: apt.id, ...apt.data() } as ApartmentWithId)
    );
    // Setting this data in the Express application's state
    app.set('landlords', landlords);
    app.set('apts', apts);

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(400).send('Error'); // Handling errors
  }
});

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

/**
 * Get Pending Buildings - Retrieves all pending building reports with a specified status.
 *
 * @remarks
 * This endpoint fetches pending building reports that users have submitted when they couldn't find their apartment.
 * The reports are filtered by their current status (e.g. 'PENDING', 'COMPLETED', 'DELETED').
 *
 * @route GET /api/pending-buildings/:status
 *
 * @status
 * - 200: Successfully retrieved the pending building reports for the given status.
 */
app.get('/api/pending-buildings/:status', async (req, res) => {
  const { status } = req.params;
  const apartmentDocs = (await pendingBuildingsCollection.where('status', '==', status).get()).docs;
  const apartments: CantFindApartmentForm[] = apartmentDocs.map((doc) => {
    const data = doc.data();
    const apartment = { ...data, date: data.date.toDate() } as CantFindApartmentForm;
    return { ...apartment, id: doc.id } as CantFindApartmentFormWithId;
  });
  res.status(200).send(JSON.stringify(apartments));
});

/**
 * Get Contact Questions - Retrieves all contact questions with a specified status.
 *
 * @remarks
 * This endpoint fetches contact questions that users have submitted through the contact form.
 * The questions are filtered by their current status (e.g. 'PENDING', 'COMPLETED', 'DELETED').
 *
 * @route GET /api/contact-questions/:status
 *
 * @status
 * - 200: Successfully retrieved the contact questions for the given status.
 */
app.get('/api/contact-questions/:status', async (req, res) => {
  const { status } = req.params;
  const questionDocs = (await contactQuestionsCollection.where('status', '==', status).get()).docs;
  const questions: QuestionForm[] = questionDocs.map((doc) => {
    const data = doc.data();
    const question = { ...data, date: data.date.toDate() } as QuestionForm;
    return { ...question, id: doc.id } as QuestionFormWithId;
  });
  res.status(200).send(JSON.stringify(questions));
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

// Endpoint to delete a review by its document ID
app.put('/api/delete-review/:reviewId', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');
  const { reviewId } = req.params; // Extract the review document ID from the request parameters
  const { uid, email } = req.user;
  // Check if the user is an admin or the creator of the review
  const reviewDoc = reviewCollection.doc(reviewId);
  const reviewData = (await reviewDoc.get()).data();
  if (!reviewData) {
    res.status(404).send('Review not found');
    return;
  }
  if (reviewData?.userId !== uid && !(email && admins.includes(email))) {
    res.status(403).send('Unauthorized');
    return;
  }
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

// Function to check if a user has an apartment saved or not
const checkSavedApartment = (): RequestHandler => async (req, res) => {
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
      if (userApartments.includes(apartmentId)) {
        res.status(200).send(JSON.stringify({ result: true }));
      } else {
        res.status(200).send(JSON.stringify({ result: false }));
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
};

// Function to check if a user has an landlord saved or not
const checkSavedLandlord = (): RequestHandler => async (req, res) => {
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
      if (userLandlords.includes(landlordId)) {
        res.status(200).send(JSON.stringify({ result: true }));
      } else {
        res.status(200).send(JSON.stringify({ result: false }));
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
};

// Endpoint for checking if an apartment is saved by a user
app.post('/api/check-saved-apartment', authenticate, checkSavedApartment());
// This endpoint uses authentication middleware to ensure that the user is logged in.
// The checkSavedApartment() function is then called to check if a specific apartment is saved by the user.

// Endpoint for checking if a landlord is saved by a user
app.post('/api/check-saved-landlord', authenticate, checkSavedLandlord());
// Similar to the above endpoint, this one checks if a specific landlord is saved by the user.
// It also uses authentication to ensure that the request is made by a logged-in user.

// Endpoint for adding a saved apartment for a user
app.post('/api/add-saved-apartment', authenticate, saveApartmentHandler(true));
// This endpoint allows authenticated users to add an apartment to their list of saved apartments.
// The saveApartmentHandler function is used with a parameter of 'true' to signify adding a save.

// Endpoint for removing a saved apartment for a user
app.post('/api/remove-saved-apartment', authenticate, saveApartmentHandler(false));
// This endpoint allows authenticated users to remove an apartment from their list of saved apartments.
// The saveApartmentHandler function is used with a parameter of 'false' to signify removing a save.

// Endpoint to get a list of saved apartments for a user
app.get('/api/saved-apartments', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');
  const { uid } = req.user; // Extracting user ID from the request
  const userRef = usersCollection.doc(uid);
  const userDoc = await userRef.get(); // Fetching user document from Firestore
  const userApartmentsAsStrings: string[] = userDoc.data()?.apartments || [];
  // Fetching each saved apartment document
  const userApartments = await Promise.all(
    userApartmentsAsStrings.map((bid) => buildingsCollection.doc(bid).get())
  );

  // Mapping the documents to ApartmentWithId objects
  const buildings: ApartmentWithId[] = userApartments.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  const data = JSON.stringify(await pageData(buildings)); // Preparing the data for response
  res.status(200).send(data); // Sending the data back to the client
});

// Endpoints for adding and removing saved landlords for a user
app.post('/api/add-saved-landlord', authenticate, saveLandlordHandler(true));
app.post('/api/remove-saved-landlord', authenticate, saveLandlordHandler(false));
// These endpoints allow for adding and removing landlords to/from a user's saved list.
// Both endpoints use the saveLandlordHandler function with appropriate boolean parameters.

/**
 * update-review-status
 *
 * Endpoint to update the status of a review.
 * Sends an email to the user if the review is approved.
 *
 * Permissions:
 * - An admin can update a review from any status to any status
 * - A regular user can only update their own reviews to deleted
 * - A regular user can report any review except:
 *   - Their own reviews
 *   - Pending reviews
 * - A regular user cannot update other users' reviews
 *
 * @param reviewDocId - The document ID of the review to update
 * @param newStatus - The new status to set for the review
 *                  - must be one of 'PENDING', 'APPROVED', 'DECLINED', 'DELETED', or 'REPORTED'
 * @returns status 200 if successfully updates status,
 *                 400 if the new status is invalid,
 *                 401 if authentication fails,
 *                 403 if user is unauthorized,
 *                 500 if an error occurs
 */
app.put('/api/update-review-status/:reviewDocId/:newStatus', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');
  const { reviewDocId, newStatus } = req.params; // Extracting parameters from the URL
  const { uid, email } = req.user;
  const isAdmin = email && admins.includes(email);
  const statusList = ['PENDING', 'APPROVED', 'DECLINED', 'DELETED', 'REPORTED'];

  try {
    // Validating if the new status is within the allowed list
    if (!statusList.includes(newStatus)) {
      res.status(400).send('Invalid status type');
      return;
    }

    const reviewDoc = reviewCollection.doc(reviewDocId);
    const reviewData = (await reviewDoc.get()).data();
    const currentStatus = reviewData?.status || '';
    const reviewOwnerId = reviewData?.userId || '';

    // Check if user is authorized to change this review's status:
    // Admin: Can change the status of a review to any status
    // Non-review owner: Can report a review
    // Review owner: Can update or delete their own review if the review is not already REPORTED.
    if (
      !isAdmin &&
      (uid !== reviewOwnerId || newStatus !== 'DELETED') &&
      newStatus !== 'REPORTED'
    ) {
      res.status(403).send('Unauthorized');
      return;
    }

    if (newStatus === 'REPORTED') {
      // Check if user is trying to report their own review
      if (uid === reviewOwnerId) {
        res.status(403).send('Cannot report your own review');
        return;
      }

      if (currentStatus === 'PENDING') {
        res.status(403).send('Cannot report a pending review');
        return;
      }

      // Updating the review's status in Firestore and adding a report
      const existingReports = reviewData?.reports || [];
      const newReport = {
        date: new Date(),
        userId: uid,
        reason: 'No reason provided',
      };
      await reviewDoc.update({ status: newStatus, reports: [...existingReports, newReport] });
    } else {
      // Updating the review's status in Firestore
      await reviewDoc.update({ status: newStatus });
    }
    res.status(200).send('Success'); // Sending a success response

    /* If firebase successfully updates status to approved (not from an ignored report), 
    then send an email to the review's creator to inform them that their review has been approved */
    if (newStatus === 'APPROVED' && !['REPORTED', 'APPROVED'].includes(currentStatus)) {
      // get user id
      const reviewData = (await reviewCollection.doc(reviewDocId).get()).data();
      const userId = reviewData?.userId;
      // get user information from user id
      const userRecord = await auth().getUser(userId);
      // get user information and apartment and review information
      const userEmail = userRecord?.email;
      const userDisplayName = userRecord?.displayName || '';
      const aptId = reviewData?.aptId;
      const aptData = aptId ? (await buildingsCollection.doc(aptId).get()).data() : {};
      const aptName: string = aptData?.name;
      const reviewText: string = reviewData?.reviewText;
      const reviewDateObj: Timestamp = reviewData?.date;
      const reviewDate: string = reviewDateObj ? reviewDateObj.toDate().toDateString() : '';
      // Create a transporter object with email service provider's SMTP settings
      if (!cuaptsEmail || !cuaptsEmailPassword) {
        throw new Error('Host email or password not found');
      }
      if (!userEmail) {
        throw new Error('User email not found');
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'login',
          user: cuaptsEmail,
          pass: cuaptsEmailPassword, // App password generated from Gmail
        },
      });

      // Define the email options,
      // Note: we can check cuaptsemail sent folder to check if it was sent
      const mailOptions = {
        from: {
          name: 'The CUApts Team',
          address: cuaptsEmail,
        },
        to: userEmail, // The user's email address
        subject: `[CUApts Review Status Update] Your Review Has Been Approved!`,
        html: `<head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
          <style>
            
            /* Reset styles */
            body, body * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: "Work Sans", Arial, sans-serif;
                line-height: 1.6;
            }
            /* Logo styles*/
            .logoWithText {
                display: flex;
                align-items: baseline;
                justify-content: center;
                margin-bottom: 10px;
                color: #333;
                font-weight: 600;
                line-height: 32px;
            }
            .logoWithText svg {
                height: 32px;
                width: 32px;
                fill: none;
            }
            /* Container styles */
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #fff;
            }
            /* Header styles */
            .header {
                text-align: center;
                margin-bottom: 20px;
                padding: 10px 0;
                border-bottom: 1px solid lightgrey;

            }
            .header>h1 {
                color: white;
                background-color: #EB5757;
                border-radius: 5px;
            }
            /* Content styles */
            .content {
                margin-bottom: 20px;
            }
            /* Footer styles */
            .footer {
                text-align: center;
                color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
              <div class="header">
                <div class="logoWithText">
                  <svg width="33" height="59" viewBox="0 0 33 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.1317 57.4054H19.8154C19.4554 57.4054 19.1641 57.0382 19.1641 56.5845V11.9039C19.1641 11.4502 19.4554 11.083 19.8154 11.083H30.1317C30.4917 11.083 30.783 11.4502 30.783 11.9039V56.5869C30.783 57.0382 30.4917 57.4054 30.1317 57.4054Z" fill="#B94630"/>
                    <path d="M24.726 26.8236C25.7548 26.8236 26.5888 25.9897 26.5888 24.9609C26.5888 23.9321 25.7548 23.0981 24.726 23.0981C23.6973 23.0981 22.8633 23.9321 22.8633 24.9609C22.8633 25.9897 23.6973 26.8236 24.726 26.8236Z" fill="white"/>
                    <path d="M21.4312 15.9414C22.235 15.9414 22.8867 15.3516 22.8867 14.6241C22.8867 13.8966 22.235 13.3069 21.4312 13.3069C20.6273 13.3069 19.9756 13.8966 19.9756 14.6241C19.9756 15.3516 20.6273 15.9414 21.4312 15.9414Z" fill="white"/>
                    <path d="M22.8877 14.6245H19.9746V20.8095H22.8877V14.6245Z" fill="white"/>
                    <path d="M24.8999 15.9414C25.7038 15.9414 26.3555 15.3516 26.3555 14.6241C26.3555 13.8966 25.7038 13.3069 24.8999 13.3069C24.096 13.3069 23.4443 13.8966 23.4443 14.6241C23.4443 15.3516 24.096 15.9414 24.8999 15.9414Z" fill="white"/>
                    <path d="M26.3574 14.6245H23.4443V20.8095H26.3574V14.6245Z" fill="white"/>
                    <path d="M28.3716 15.9414C29.1755 15.9414 29.8272 15.3516 29.8272 14.6241C29.8272 13.8966 29.1755 13.3069 28.3716 13.3069C27.5677 13.3069 26.916 13.8966 26.916 14.6241C26.916 15.3516 27.5677 15.9414 28.3716 15.9414Z" fill="white"/>
                    <path d="M29.8281 14.6245H26.915V20.8095H29.8281V14.6245Z" fill="white"/>
                    <path d="M31.5844 10.5876C31.8412 11.0182 31.5332 11.5649 31.0319 11.5684L18.8563 11.6532C18.3389 11.6568 18.0258 11.0829 18.3089 10.6498L24.7023 0.869119C24.9646 0.467801 25.5567 0.480005 25.8022 0.891791L31.5844 10.5876Z" fill="#B94630"/>
                    <rect x="1.2549" y="29.0589" width="23.8431" height="29.0588" rx="2.23529" fill="#B94630" stroke="white" stroke-width="1.4902"/>
                    <rect x="4.98047" y="33.5295" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="10.9414" y="33.5295" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="16.9023" y="33.5295" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="4.98047" y="39.4902" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="10.9414" y="39.4902" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="16.9023" y="39.4902" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="4.98047" y="45.4509" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="10.9414" y="45.4509" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="16.9023" y="45.4509" width="3.72549" height="3.72549" fill="white"/>
                    <rect x="10.9414" y="51.4119" width="3.72549" height="5.96078" fill="white"/>
                  </svg>
                  <h1>CUAPTS</h1>
                </div>      
                <h1>🎉 Review Approved! 🎉</h1>
              </div>
              <div class="content">
                  <p>Hello ${userDisplayName},</p>
                  <p>Thank you for your patience. Your review ${
                    aptName ? `for ${aptName}` : ''
                  } has been approved!</p>
                  <p>Your Review Summary:</p>
                    ${reviewDate ? `<li><b>Date: </b>${reviewDate}</li>` : ''}
                    ${reviewText ? `<li><b>Text: </b>${reviewText}</li>` : ''}
                  <br/>
                  <p><b>We greatly appreciate your review!<b></p>
              </div>
              <div class="footer">
                  <p>This is a notification email from CUApts (https://www.cuapts.org/).</p>
              </div>
          </div>
        </body>`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Error'); // Handling any errors
  }
});

/**
 * Add Pending Building - Submits a request for an apartment that a user cannot find in the system.
 *
 * @remarks
 * This endpoint allows authenticated users to submit details about an apartment that is not currently
 * in the database. The submission is stored with a PENDING status for admin review.
 *
 * @route POST /api/add-pending-building
 *
 * @input {CantFindApartmentForm} req.body - Form data containing apartment details including date, name,
 * address, photos and user id.
 *
 * @status
 * - 201: Successfully created pending building request
 * - 401: Error due to missing required fields or authentication issues
 */
app.post('/api/add-pending-building', authenticate, async (req, res) => {
  try {
    const doc = pendingBuildingsCollection.doc();
    const apartment = req.body as CantFindApartmentForm;
    if (apartment.name === '') {
      res.status(401).send('Error: missing fields');
    }
    doc.set({ ...apartment, date: new Date(apartment.date), status: 'PENDING' });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

/**
 * Update Pending Building Status - Updates the status of a pending building report.
 *
 * @remarks
 * This endpoint allows authenticated users to update the status of a pending building report.
 * The status can be changed to either 'PENDING', 'COMPLETED', or 'DELETED'.
 *
 * @route PUT /api/update-pending-building-status/:buildingId/:newStatus
 *
 * @input {string} req.params.buildingId - The ID of the pending building report
 * @input {string} req.params.newStatus - The new status to set ('PENDING', 'COMPLETED', or 'DELETED')
 *
 * @status
 * - 200: Successfully updated the building status
 * - 400: Invalid status type provided
 * - 404: Building report not found
 * - 500: Server error while updating status
 */
app.put(
  '/api/update-pending-building-status/:buildingId/:newStatus',
  authenticate,
  async (req, res) => {
    try {
      const { buildingId, newStatus } = req.params;

      const validStatuses = ['PENDING', 'COMPLETED', 'DELETED'];
      if (!validStatuses.includes(newStatus)) {
        res.status(400).send('Error: Invalid status type');
        return;
      }

      const doc = pendingBuildingsCollection.doc(buildingId);

      const docSnapshot = await doc.get();
      if (!docSnapshot.exists) {
        res.status(404).send('Error: Building not found');
        return;
      }

      await doc.update({ status: newStatus });
      res.status(200).send('Success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating building status');
    }
  }
);

/**
 * Add Contact Question - Submits a new "Ask Us A Question" form.
 *
 * @remarks
 * This endpoint allows authenticated users to submit questions through the contact form.
 * The question is stored with a PENDING status and includes metadata of the question.
 *
 * @route POST /api/add-contact-question
 *
 * @input {QuestionForm} req.body - The question form data containing name, email, question, and user id.
 *
 * @status
 * - 201: Successfully created the question and returns the document ID
 * - 401: Error due to missing required fields or authentication issues
 */
app.post('/api/add-contact-question', authenticate, async (req, res) => {
  try {
    const doc = contactQuestionsCollection.doc();
    const question = req.body as QuestionForm;
    if (question.name === '') {
      res.status(401).send('Error: missing fields');
    }
    doc.set({ ...question, date: new Date(question.date), status: 'PENDING' });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

/**
 * Update Contact Question Status - Updates the status of a contact question.
 *
 * @remarks
 * This endpoint allows authenticated users to update the status of a contact question.
 * The status can be changed to either 'PENDING', 'COMPLETED', or 'DELETED'.
 *
 * @route PUT /api/update-contact-question-status/:questionId/:newStatus
 *
 * @input {string} req.params.questionId - The ID of the contact question
 * @input {string} req.params.newStatus - The new status to set ('PENDING', 'COMPLETED', or 'DELETED')
 *
 * @status
 * - 200: Successfully updated the question status
 * - 400: Invalid status type provided
 * - 404: Question not found
 * - 500: Server error while updating status
 */
app.put(
  '/api/update-contact-question-status/:questionId/:newStatus',
  authenticate,
  async (req, res) => {
    try {
      const { questionId, newStatus } = req.params;

      const validStatuses = ['PENDING', 'COMPLETED', 'DELETED'];
      if (!validStatuses.includes(newStatus)) {
        res.status(400).send('Error: Invalid status type');
        return;
      }

      const doc = contactQuestionsCollection.doc(questionId);
      const docSnapshot = await doc.get();
      if (!docSnapshot.exists) {
        res.status(404).send('Error: Question not found');
        return;
      }

      await doc.update({ status: newStatus });
      res.status(200).send('Success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating question status');
    }
  }
);

const { REACT_APP_MAPS_API_KEY } = process.env;
const LANDMARKS = {
  eng_quad: '42.4445,-76.4836', // Duffield Hall
  ag_quad: '42.4489,-76.4780', // Mann Library
  ho_plaza: '42.4468,-76.4851', // Ho Plaza
};

interface TravelTimeInput {
  origin: string; // Can be either address or "latitude,longitude"
}

/**
 * getTravelTimes – Calculates travel times between an origin and multiple destinations using Google Distance Matrix API.
 *
 * @remarks
 * Makes an HTTP request to the Google Distance Matrix API and processes the response to extract duration values.
 * Times are converted from seconds to minutes before being returned.
 *
 * @param {string} origin - Starting location as either an address or coordinates in "lat,lng" format
 * @param {string[]} destinations - Array of destination addresses to calculate times to
 * @param {'walking' | 'driving'} mode - Mode of transportation to use for calculations
 * @return {Promise<number[]>} - Array of travel times in minutes to each destination
 */
async function getTravelTimes(
  origin: string,
  destinations: string[],
  mode: 'walking' | 'driving'
): Promise<number[]> {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${destinations
      .map((dest) => encodeURIComponent(dest))
      .join('|')}&mode=${mode}&key=${REACT_APP_MAPS_API_KEY}`
  );

  return response.data.rows[0].elements.map(
    (element: { duration: { value: number } }) => element.duration.value / 60
  );
}

/**
 * Travel Times Calculator - Calculates walking and driving times from a given origin to Cornell landmarks.
 *
 * @remarks
 * Uses Google Maps Distance Matrix API to calculate travel times to three landmarks: Engineering Quad,
 * Agriculture Quad, and Ho Plaza. Returns both walking and driving durations in minutes.
 * Origin can be either an address or coordinates in "latitude,longitude" format.
 *
 * @route POST /api/travel-times
 *
 * @input {string} req.body.origin - Starting point, either as address or "latitude,longitude"
 *
 * @status
 * - 200: Successfully retrieved travel times
 * - 400: Missing or invalid origin
 * - 500: Server error or Google Maps API failure
 */
app.post('/api/calculate-travel-times', async (req, res) => {
  try {
    const { origin } = req.body as TravelTimeInput;
    console.log('Origin:', origin);

    if (!origin) {
      return res.status(400).json({ error: 'Origin is required' });
    }

    const destinations = Object.values(LANDMARKS);
    console.log('Destinations array:', destinations);

    // Get walking and driving times using the helper function
    const [walkingTimes, drivingTimes] = await Promise.all([
      getTravelTimes(origin, destinations, 'walking'),
      getTravelTimes(origin, destinations, 'driving'),
    ]);

    console.log('Raw walking times:', walkingTimes);
    console.log('Raw driving times:', drivingTimes);

    const travelTimes: LocationTravelTimes = {
      engQuadWalking: walkingTimes[0],
      engQuadDriving: drivingTimes[0],
      agQuadWalking: walkingTimes[1],
      agQuadDriving: drivingTimes[1],
      hoPlazaWalking: walkingTimes[2],
      hoPlazaDriving: drivingTimes[2],
    };

    console.log('Final travel times:', travelTimes);
    return res.status(200).json(travelTimes);
  } catch (error) {
    console.error('Error calculating travel times:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Test Travel Times Endpoint - Creates a travel times document for a specific building.
 *
 * @remarks
 * Retrieves building coordinates from the buildings collection, calculates travel times to Cornell landmarks,
 * and stores the results in the travelTimes collection. This endpoint is used for testing and populating
 * travel time data for existing buildings.
 *
 * @param {string} buildingId - The ID of the building to calculate and store travel times for
 *
 * @return {Object} - Object containing success message, building ID, and calculated travel times
 */
app.post('/api/test-travel-times/:buildingId', async (req, res) => {
  try {
    const { buildingId } = req.params;

    const { protocol } = req;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Get building data
    const buildingDoc = await buildingsCollection.doc(buildingId).get();
    if (!buildingDoc.exists) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const buildingData = buildingDoc.data();
    if (!buildingData?.latitude || !buildingData?.longitude) {
      return res.status(400).json({ error: 'Building missing coordinate data' });
    }

    // Calculate travel times using the main endpoint
    const response = await axios.post(`${baseUrl}/api/calculate-travel-times`, {
      origin: `${buildingData.latitude},${buildingData.longitude}`,
    });

    // Store in Firebase
    await travelTimesCollection.doc(buildingId).set(response.data);

    return res.status(200).json({
      message: 'Travel times calculated and stored successfully',
      buildingId,
      travelTimes: response.data,
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
/**
 * Batch Travel Times Endpoint - Calculates and stores travel times for a batch of buildings.
 *
 * @remarks
 * Processes a batch of buildings from the buildings collection, calculating travel times to Cornell landmarks
 * for each one and storing the results in the travelTimes collection. This endpoint handles buildings in batches
 * with rate limiting between requests. Supports pagination through the startAfter parameter.
 *
 * @param {number} batchSize - Number of buildings to process in this batch (defaults to 50)
 * @param {string} [startAfter] - Optional ID of last processed building for pagination
 * @return {Object} - Summary object containing:
 *   - Message indicating batch completion
 *   - Total number of buildings processed in this batch
 *   - Count of successful calculations
 *   - Arrays of successful building IDs and failed buildings with error details
 */

// Helper function for rate limiting API requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

app.post('/api/batch-create-travel-times/:batchSize/:startAfter?', async (req, res) => {
  try {
    const batchSize = parseInt(req.params.batchSize, 10) || 50;
    const { startAfter } = req.params;

    const { protocol } = req;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    let query = buildingsCollection.limit(batchSize);
    if (startAfter) {
      const lastDoc = await buildingsCollection.doc(startAfter).get();
      query = query.startAfter(lastDoc);
    }

    const buildingDocs = (await query.get()).docs;
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    const processPromises = buildingDocs.map(async (doc) => {
      try {
        await delay(100); // 100ms delay between requests
        const buildingData = doc.data();
        if (!buildingData?.latitude || !buildingData?.longitude) {
          results.failed.push({
            id: doc.id,
            error: 'Missing coordinates',
          });
          return;
        }

        const response = await axios.post(`${baseUrl}/api/calculate-travel-times`, {
          origin: `${buildingData.latitude},${buildingData.longitude}`,
        });

        await travelTimesCollection.doc(doc.id).set(response.data);
        results.success.push(doc.id);
      } catch (error) {
        console.error('Error in batch processing:', error);
        results.failed.push({
          id: doc.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    await Promise.all(processPromises);

    res.status(200).json({
      message: 'Batch processing completed',
      totalProcessed: buildingDocs.length,
      successCount: results.success.length,
      failureCount: results.failed.length,
      hasMore: buildingDocs.length === batchSize,
      lastProcessedId: buildingDocs[buildingDocs.length - 1]?.id,
      results,
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Travel Times By Building ID - Retrieves pre-calculated travel times from the travel times collection.
 *
 * @remarks
 * Looks up the travel times document for the given building ID and returns the stored walking and driving
 * times to Cornell landmarks: Engineering Quad, Agriculture Quad, and Ho Plaza.
 *
 * @route GET /api/travel-times-by-id/:buildingId
 *
 * @input {string} req.params.buildingId - ID of the building to get travel times for
 *
 * @status
 * - 200: Successfully retrieved travel times
 * - 404: Building travel times not found
 * - 500: Server error
 */
app.get('/api/travel-times-by-id/:buildingId', async (req, res) => {
  try {
    const { buildingId } = req.params;

    const travelTimeDoc = await travelTimesCollection.doc(buildingId).get();

    if (!travelTimeDoc.exists) {
      return res.status(404).json({ error: 'Travel times not found for this building' });
    }

    const travelTimes = travelTimeDoc.data() as LocationTravelTimes;

    return res.status(200).json(travelTimes);
  } catch (error) {
    console.error('Error retrieving travel times:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
