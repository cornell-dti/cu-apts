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
// Import Firebase configuration and types
import { db, FieldValue, FieldPath } from './firebase-config';
import { Faq } from './firebase-config/types';
import authenticate from './auth';

// Collections in the Firestore database
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const buildingsCollection = db.collection('buildings');
const likesCollection = db.collection('likes');
const usersCollection = db.collection('users');

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
    doc.set({ ...review, date: new Date(review.date), likes: 0, status: 'PENDING' });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
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
 * Return list of reviews that user marked as helpful (like)
 */
// TODO: uid param is unused here but when remove it encounter 304 status and req.user is null
app.get('/api/review/like/:uid', authenticate, async (req, res) => {
  if (!req.user) throw new Error('not authenticated');
  const { uid } = req.user;
  const likesDoc = await likesCollection.doc(uid).get();

  if (likesDoc.exists) {
    const data = likesDoc.data();
    if (data) {
      const reviewIds = Object.keys(data);
      const matchingReviews: ReviewWithId[] = [];
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

// Endpoint to update the status of a review
app.put('/api/update-review-status/:reviewDocId/:newStatus', async (req, res) => {
  const { reviewDocId, newStatus } = req.params; // Extracting parameters from the URL
  const statusList = ['PENDING', 'APPROVED', 'DECLINED', 'DELETED'];
  try {
    // Validating if the new status is within the allowed list
    if (!statusList.includes(newStatus)) {
      res.status(400).send('Invalid status type');
      return;
    }
    // Updating the review's status in Firestore
    await reviewCollection.doc(reviewDocId).update({ status: newStatus });
    res.status(200).send('Success'); // Sending a success response
  } catch (err) {
    console.log(err);
    res.status(500).send('Error'); // Handling any errors
  }
});

export default app;
