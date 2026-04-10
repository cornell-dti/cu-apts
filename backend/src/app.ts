import express, { Express, RequestHandler } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
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
  Folder,
  RoomType,
} from '@common/types/db-types';
// Import Firebase configuration and types
import { auth } from 'firebase-admin';
import { Timestamp } from '@firebase/firestore-types';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { runScrapers } from './scrapers';
import { db, FieldValue, FieldPath } from './firebase-config';
import { Faq } from './firebase-config/types';
import authenticate from './auth';
import { admins } from '../../frontend/src/constants/HomeConsts';

// Imports for email sending

// Email environment variables
const cuaptsEmail = process.env.CUAPTS_EMAIL;
const cuaptsEmailPassword = process.env.CUAPTS_EMAIL_APP_PASSWORD;

// Google Maps API key
const { REACT_APP_MAPS_API_KEY } = process.env;

// Collections in the Firestore database
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const buildingsCollection = db.collection('buildings');
const likesCollection = db.collection('likes');
const usersCollection = db.collection('users');
const pendingBuildingsCollection = db.collection('pendingBuildings');
const contactQuestionsCollection = db.collection('contactQuestions');
const folderCollection = db.collection('folders');
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
 * Takes in the location type in the URL and returns the number of reviews made for that location
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

/**
 * Get Multiple Apartments by IDs – Retrieves multiple apartments by their document IDs.
 *
 * @remarks
 * This endpoint accepts a comma-separated list of apartment IDs and returns the corresponding apartment data.
 * Each ID is validated to ensure it exists in the database before returning the data.
 *
 * @route GET /api/apts/:ids
 *
 * @input {string} req.params.ids - Comma-separated list of apartment document IDs
 *
 * @status
 * - 200: Successfully retrieved apartment data for all provided IDs
 * - 400: Error retrieving apartments or invalid ID provided
 */
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

/**
 * Search Apartments and Landlords – Performs a fuzzy search across both apartments and landlords.
 *
 * @remarks
 * This endpoint searches through apartment and landlord names/addresses using fuzzy matching.
 * Returns up to 5 combined results, with each result labeled as either LANDLORD or APARTMENT.
 *
 * @route GET /api/search
 *
 * @input {string} req.query.q - The search query string to match against names and addresses
 *
 * @status
 * - 200: Successfully retrieved and labeled search results
 * - 400: Error occurred while processing the search request
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

/**
 * Search Results - Retrieves enriched apartment data based on a text search query.
 *
 * @remarks
 * This endpoint performs a fuzzy search on apartment names and addresses using the provided query string.
 * The matching results are enriched with additional data like reviews and ratings before being returned.
 *
 * @route GET /api/search-results
 *
 * @input {string} req.query.q - The search query string to match against apartment names and addresses
 *
 * @status
 * - 200: Successfully retrieved and enriched the matching apartment results
 * - 400: Error occurred while processing the search request
 */
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

/**
 * Search With Query And Filters - Searches apartments based on text query and multiple filter criteria.
 *
 * @remarks
 * This endpoint allows searching apartments using a combination of text search and filters.
 * The filters include location, price range, number of bedrooms and bathrooms.
 * Results are filtered progressively based on which parameters are provided.
 *
 * @route GET /api/search-with-query-and-filters
 *
 * @input {object} req.query - The search parameters
 * @input {string} req.query.q - Optional text search query
 * @input {string} req.query.locations - Optional comma-separated list of locations
 * @input {number} req.query.minPrice - Optional minimum price filter
 * @input {number} req.query.maxPrice - Optional maximum price filter
 * @input {number} req.query.bedrooms - Optional number of bedrooms filter
 * @input {number} req.query.bathrooms - Optional number of bathrooms filter
 *
 * @status
 * - 200: Successfully retrieved filtered search results
 * - 400: Error occurred while processing the search request
 */

app.get('/api/search-with-query-and-filters', async (req, res) => {
  try {
    // Extract all query parameters
    const query = req.query.q as string;
    const locations = req.query.locations as string;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : null;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : null;
    const bedrooms = req.query.bedrooms ? parseInt(req.query.bedrooms as string, 10) : null;
    const bathrooms = req.query.bathrooms ? parseInt(req.query.bathrooms as string, 10) : null;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : null;
    const sortBy = req.query.sortBy || 'numReviews';

    // Get all apartments from the application state
    const apts = req.app.get('apts');
    const aptsWithType: ApartmentWithId[] = apts;

    // STEP 1: Apply text search first
    let baseResults: ApartmentWithId[] = [];
    if (query && query.trim() !== '') {
      const options = {
        keys: ['name', 'address'],
      };
      const fuse = new Fuse(aptsWithType, options);
      const searchResults = fuse.search(query);
      baseResults = searchResults.map((result) => result.item);
    } else {
      // If no query, start with all apartments
      baseResults = aptsWithType;
    }

    // STEP 2: Count active filter categories
    const hasLocation = locations && locations.trim() !== '';
    const hasPrice = minPrice !== null || maxPrice !== null;
    const hasBedBath = (bedrooms !== null && bedrooms > 0) || (bathrooms !== null && bathrooms > 0);
    const activeFilterCount = [hasLocation, hasPrice, hasBedBath].filter(Boolean).length;

    // Helper: Filter by location only
    const filterByLocation = (apts: ApartmentWithId[]): ApartmentWithId[] => {
      if (!hasLocation) return [];
      const locationArray = locations.split(',').map((loc) => loc.toUpperCase());
      return apts.filter((apt) => locationArray.includes(apt.area ? apt.area.toUpperCase() : ''));
    };

    // Helper: Filter by price only
    const filterByPrice = (apts: ApartmentWithId[]): ApartmentWithId[] => {
      if (!hasPrice) return [];
      return apts.filter((apt) => {
        if (!apt.roomTypes || apt.roomTypes.length === 0) return false;
        return apt.roomTypes.some((roomType) => {
          if (minPrice !== null && roomType.price < minPrice) return false;
          if (maxPrice !== null && roomType.price > maxPrice) return false;
          return true;
        });
      });
    };

    // Helper: Filter by bed/bath only
    const filterByBedBath = (apts: ApartmentWithId[]): ApartmentWithId[] => {
      if (!hasBedBath) return [];
      return apts.filter((apt) => {
        if (!apt.roomTypes || apt.roomTypes.length === 0) return false;
        return apt.roomTypes.some((roomType) => {
          if (bedrooms !== null && bedrooms > 0 && roomType.beds !== bedrooms) return false;
          if (bathrooms !== null && bathrooms > 0 && roomType.baths !== bathrooms) return false;
          return true;
        });
      });
    };

    // Helper: Filter by ALL criteria (main results)
    const filterByAll = (apts: ApartmentWithId[]): ApartmentWithId[] => {
      let filtered = apts;

      // Apply location filter
      if (hasLocation) {
        filtered = filterByLocation(filtered);
      }

      // Apply price filter
      if (hasPrice) {
        filtered = filterByPrice(filtered);
      }

      // Apply bed/bath filter
      if (hasBedBath) {
        filtered = filterByBedBath(filtered);
      }

      return filtered;
    };

    // STEP 3: Calculate results based on active filter count
    let mainResults: ApartmentWithId[] = [];
    let additionalLocation: ApartmentWithId[] = [];
    let additionalPrice: ApartmentWithId[] = [];
    let additionalBedBath: ApartmentWithId[] = [];

    if (activeFilterCount === 0) {
      // No filters: return all base results as main
      mainResults = baseResults;
    } else if (activeFilterCount === 1) {
      // 1 filter: main results only, no additional sections
      mainResults = filterByAll(baseResults);
    } else {
      // 2+ filters: calculate main + additional sections
      // Main: matches ALL filters
      mainResults = filterByAll(baseResults);
      const mainIds = new Set(mainResults.map((apt) => apt.id));

      // Additional: each individual filter (excluding main results)
      if (hasLocation) {
        additionalLocation = filterByLocation(baseResults).filter((apt) => !mainIds.has(apt.id));
      }
      if (hasPrice) {
        additionalPrice = filterByPrice(baseResults).filter((apt) => !mainIds.has(apt.id));
      }
      if (hasBedBath) {
        additionalBedBath = filterByBedBath(baseResults).filter((apt) => !mainIds.has(apt.id));
      }
    }

    // STEP 4: Enrich all result sections with pageData
    const enrichMain = await pageData(mainResults);
    const enrichLocation = await pageData(additionalLocation);
    const enrichPrice = await pageData(additionalPrice);
    const enrichBedBath = await pageData(additionalBedBath);

    // STEP 5: Apply sorting and size limit to main results
    let finalMain = enrichMain;
    if (size && size > 0 && finalMain.length > size) {
      console.log('endpoint sortBy', sortBy);
      switch (sortBy) {
        case 'numReviews':
          finalMain.sort((a, b) => b.numReviews - a.numReviews);
          break;
        case 'avgRating':
          finalMain.sort((a, b) => b.avgRating - a.avgRating);
          break;
        case 'distanceToCampus':
          finalMain.sort(
            (a, b) => a.buildingData.distanceToCampus - b.buildingData.distanceToCampus
          );
          break;
        default:
          break;
      }
      finalMain = finalMain.slice(0, size);
    }

    // STEP 6: Return structured response
    const response = {
      main: finalMain,
      additionalLocation: enrichLocation,
      additionalPrice: enrichPrice,
      additionalBedBath: enrichBedBath,
    };

    res.status(200).send(JSON.stringify(response));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});
/**
 * Get Paginated Apartment Data – Retrieves paginated and sorted apartment listings.
 *
 * @remarks
 * Handles two different pagination strategies based on page type. For homepage, fetches all apartments and sorts them before paginating. For other pages, paginates directly from the database query. Enriches apartment data with reviews and ratings.
 *
 * @route GET /api/page-data/:page/:size/:sortBy?
 *
 * @input {string} req.params.page - Page type ('home' or other) determining pagination strategy
 * @input {string} req.params.size - Number of results to return per page
 * @input {string} req.params.sortBy - Optional sorting field ('numReviews', 'avgRating', 'distanceToCampus')
 *
 * @status
 * - 200: Successfully retrieved paginated apartment data
 * - 400: Error retrieving or processing apartment data
 */
app.get('/api/page-data/:page/:size/:sortBy?', async (req, res) => {
  const { page, size, sortBy = 'numReviews' } = req.params;
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
    // Get enriched data first
    const enrichedData = await pageData(buildings);

    // Sort based on the specified field
    enrichedData.sort((a, b) => {
      // Handle fields that exist after pageData processing
      switch (sortBy) {
        case 'numReviews':
          return b.numReviews - a.numReviews;
        case 'avgRating':
          return b.avgRating - a.avgRating;
        case 'distanceToCampus':
          // Sort by distance to campus in ascending order (closer to campus comes first)
          return a.buildingData.distanceToCampus - b.buildingData.distanceToCampus;
        default:
          return 0;
      }
    });
    // Take only the requested size
    buildingData = enrichedData.slice(0, Number(size));
  } else {
    buildingData = await pageData(buildings);
  }

  const returnData = JSON.stringify({
    buildingData,
    isEnded: buildings.length < Number(size),
  });

  res.status(200).send(returnData);
});

/**
 * Get Apartments by Location - Retrieves all apartments from a specific location.
 *
 * @remarks
 * This endpoint fetches apartment data filtered by a single location parameter. The location is case-insensitive
 * and will be converted to uppercase before querying. Returns enriched apartment data including reviews and ratings.
 *
 * @route GET /api/location/:loc
 *
 * @input {string} req.params.loc - The location to filter apartments by (e.g. "Collegetown")
 *
 * @status
 * - 200: Successfully retrieved apartments for the specified location
 */
app.get('/api/location/:loc', async (req, res) => {
  const { loc } = req.params;
  const buildingDocs = (await buildingsCollection.where(`area`, '==', loc.toUpperCase()).get())
    .docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  const data = JSON.stringify(await pageData(buildings));
  return res.status(200).send(data);
});

/**
 * Get Apartments by Multiple Locations – Retrieves apartments from multiple specified locations.
 *
 * @remarks
 * This endpoint allows fetching apartments from multiple locations in a single request. Locations are
 * passed as comma-separated values in the query string. The response includes apartment data with
 * reviews and ratings for each location.
 *
 * @route GET /api/locations?locations=[comma-separated locations]
 *
 * @input {string} req.query.locations - Comma-separated list of location names (e.g. "Collegetown,Downtown")
 *
 * @status
 * - 200: Successfully retrieved apartments for the specified locations
 * - 400: No locations specified in query parameter
 */

app.get('/api/locations', async (req, res) => {
  const locations = req.query.locations as string;

  if (!locations) {
    return res.status(400).send({ error: 'No locations specified' });
  }

  const locationArray = locations.split(',');

  // Create a query to fetch buildings from any of the specified locations
  let query = buildingsCollection.where('area', '==', locationArray[0].toUpperCase());

  // If there are multiple locations, we need to use an 'in' query instead
  if (locationArray.length > 1) {
    const upperLocations = locationArray.map((loc) => loc.toUpperCase());
    query = buildingsCollection.where('area', 'in', upperLocations);
  }

  const buildingDocs = (await query.get()).docs;
  const buildings: ApartmentWithId[] = buildingDocs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ApartmentWithId)
  );

  const data = JSON.stringify(await pageData(buildings));
  return res.status(200).send(data);
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
  return res.status(200).send(data);
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
 * Update Apartment Information - Updates the information of an existing apartment.
 *
 * @remarks
 * This endpoint allows admins to update apartment information including name, address,
 * landlord, amenities, photos, and other details. Only admins can access this endpoint.
 *
 * @route PUT /api/admin/update-apartment/:apartmentId
 *
 * @input {string} req.params.apartmentId - The ID of the apartment to update
 * @input {Partial<Apartment>} req.body - The updated apartment information
 *
 * @status
 * - 200: Successfully updated apartment information
 * - 400: Invalid apartment data or missing required fields
 * - 401: Authentication failed
 * - 403: Unauthorized - Admin access required
 * - 404: Apartment not found
 * - 500: Server error while updating apartment
 */
app.put('/api/admin/update-apartment/:apartmentId', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');

  const { email } = req.user;
  const isAdmin = email && admins.includes(email);

  if (!isAdmin) {
    res.status(403).send('Unauthorized: Admin access required');
    return;
  }

  try {
    const { apartmentId } = req.params;
    const updatedApartmentData = req.body as Partial<Apartment>;

    // Check if apartment exists
    const apartmentDoc = buildingsCollection.doc(apartmentId);
    const apartmentSnapshot = await apartmentDoc.get();

    if (!apartmentSnapshot.exists) {
      res.status(404).send('Apartment not found');
      return;
    }

    // Validate required fields if they're being updated
    if (updatedApartmentData.name !== undefined && updatedApartmentData.name === '') {
      res.status(400).send('Error: Apartment name cannot be empty');
      return;
    }

    if (updatedApartmentData.address !== undefined && updatedApartmentData.address === '') {
      res.status(400).send('Error: Apartment address cannot be empty');
      return;
    }

    // Validate and process roomTypes if provided
    if (updatedApartmentData.roomTypes !== undefined) {
      const roomTypes = updatedApartmentData.roomTypes as RoomType[];

      // Generate UUIDs for room types without IDs and validate
      const processedRoomTypes: RoomType[] = [];
      const seen = new Set<string>();

      // Validate each room type
      const validationErrors = roomTypes
        .map((rt: RoomType): string | null => {
          // Validate beds, baths, price
          if (!Number.isInteger(rt.beds) || rt.beds < 1) {
            return 'Error: Beds must be an integer >= 1';
          }
          if (!Number.isInteger(rt.baths) || rt.baths < 1) {
            return 'Error: Baths must be an integer >= 1';
          }
          if (!Number.isInteger(rt.price) || rt.price < 1) {
            return 'Error: Price must be an integer >= 1';
          }

          // Check for duplicates using (beds, baths, price) combination
          const key = `${rt.beds}-${rt.baths}-${rt.price}`;
          if (seen.has(key)) {
            return 'Duplicate room type exists';
          }
          seen.add(key);

          // Generate UUID if not provided
          const id = rt.id && rt.id.trim() !== '' ? rt.id : randomUUID();

          processedRoomTypes.push({
            id,
            beds: rt.beds,
            baths: rt.baths,
            price: rt.price,
          });

          return null;
        })
        .filter((error: string | null): error is string => error !== null);

      if (validationErrors.length > 0) {
        res.status(400).send(validationErrors[0]);
        return;
      }

      // Create updated data with processed room types
      const dataToUpdate = {
        ...updatedApartmentData,
        roomTypes: processedRoomTypes,
      };

      // Update the apartment document
      await apartmentDoc.update(dataToUpdate);
    } else {
      // Update the apartment document without roomTypes changes
      await apartmentDoc.update(updatedApartmentData);
    }

    // Fetch the updated apartment to return with generated UUIDs
    const updatedSnapshot = await apartmentDoc.get();
    const updatedApartment = { id: updatedSnapshot.id, ...updatedSnapshot.data() };

    res.status(200).json({
      message: 'Apartment updated successfully',
      apartment: updatedApartment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating apartment');
  }
});

/**
 * geocodeAddress – Converts an address to latitude and longitude coordinates using Google Geocoding API.
 *
 * @remarks
 * Makes an HTTP request to the Google Geocoding API to convert an address string into
 * precise latitude and longitude coordinates.
 *
 * @param {string} address - The address to geocode
 * @return {Promise<{latitude: number, longitude: number}>} - Object containing latitude and longitude
 */
async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${REACT_APP_MAPS_API_KEY}`
  );

  if (response.data.status !== 'OK' || !response.data.results.length) {
    throw new Error('Geocoding failed: Invalid address or no results found');
  }

  const { location } = response.data.results[0].geometry;
  return {
    latitude: location.lat,
    longitude: location.lng,
  };
}

/**
 * Add New Apartment - Creates a new apartment with duplicate checking and distance calculation.
 *
 * @remarks
 * This endpoint allows admins to create new apartments. It includes a multi-step process:
 * 1. Validates input data and checks for existing apartments at the same coordinates
 * 2. Calculates latitude/longitude and distance to campus using Google Maps API
 * 3. Returns preliminary data for admin confirmation
 * 4. Creates the apartment in the database after confirmation
 *
 * @route POST /api/admin/add-apartment
 *
 * @input {object} req.body - Apartment creation data containing:
 *   - name: string (required)
 *   - address: string (required)
 *   - landlordId: string (required)
 *   - numBaths: number (optional)
 *   - numBeds: number (optional)
 *   - photos: string[] (optional)
 *   - area: 'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER' (required)
 *   - confirm: boolean (optional) - if true, creates the apartment; if false, returns preliminary data
 *
 * @status
 * - 200: Successfully created apartment (when confirm=true)
 * - 201: Preliminary data returned for confirmation (when confirm=false)
 * - 400: Invalid apartment data, missing required fields, or duplicate apartment found
 * - 401: Authentication failed
 * - 403: Unauthorized - Admin access required
 * - 500: Server error while processing request
 */
app.post('/api/admin/add-apartment', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');

  const { email } = req.user;
  const isAdmin = email && admins.includes(email);

  if (!isAdmin) {
    res.status(403).send('Unauthorized: Admin access required');
    return;
  }

  try {
    const {
      name,
      address,
      landlordId,
      roomTypes = [],
      photos = [],
      area,
      confirm = false,
    } = req.body;

    // Validate required fields
    if (!name || !address || !landlordId || !area) {
      res.status(400).send('Error: Missing required fields (name, address, landlordId, area)');
      return;
    }

    // Validate area is one of the allowed values
    const validAreas = ['COLLEGETOWN', 'WEST', 'NORTH', 'DOWNTOWN', 'OTHER'];
    if (!validAreas.includes(area)) {
      res
        .status(400)
        .send('Error: Invalid area. Must be one of: COLLEGETOWN, WEST, NORTH, DOWNTOWN, OTHER');
      return;
    }

    // Validate and process roomTypes if provided
    const processedRoomTypes: RoomType[] = [];
    if (roomTypes && roomTypes.length > 0) {
      const seen = new Set<string>();

      // Validate each room type
      const validationErrors = roomTypes
        .map((rt: RoomType): string | null => {
          // Validate beds, baths, price
          if (!Number.isInteger(rt.beds) || rt.beds < 1) {
            return 'Error: Beds must be an integer >= 1';
          }
          if (!Number.isInteger(rt.baths) || rt.baths < 1) {
            return 'Error: Baths must be an integer >= 1';
          }
          if (!Number.isInteger(rt.price) || rt.price < 1) {
            return 'Error: Price must be an integer >= 1';
          }

          // Check for duplicates using (beds, baths, price) combination
          const key = `${rt.beds}-${rt.baths}-${rt.price}`;
          if (seen.has(key)) {
            return 'Duplicate room type exists';
          }
          seen.add(key);

          // Generate UUID for each room type
          processedRoomTypes.push({
            id: randomUUID(),
            beds: rt.beds,
            baths: rt.baths,
            price: rt.price,
          });

          return null;
        })
        .filter((error: string | null): error is string => error !== null);

      if (validationErrors.length > 0) {
        res.status(400).send(validationErrors[0]);
        return;
      }
    }

    // Check if landlord exists
    const landlordDoc = landlordCollection.doc(landlordId);
    const landlordSnapshot = await landlordDoc.get();
    if (!landlordSnapshot.exists) {
      res.status(400).send('Error: Landlord not found');
      return;
    }

    // Geocode the address to get coordinates
    const coordinates = await geocodeAddress(address);
    const { latitude, longitude } = coordinates;

    // Calculate travel times using the coordinates
    const { protocol } = req;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const travelTimesResponse = await axios.post(`${baseUrl}/api/calculate-travel-times`, {
      origin: `${latitude},${longitude}`,
    });

    const travelTimes = travelTimesResponse.data;
    const distanceToCampus = travelTimes.hoPlazaWalking;

    // Check for existing apartments at the same coordinates (with small tolerance)
    const tolerance = 0.0001; // Approximately 11 meters
    const existingApartments = await buildingsCollection
      .where('latitude', '>=', latitude - tolerance)
      .where('latitude', '<=', latitude + tolerance)
      .where('longitude', '>=', longitude - tolerance)
      .where('longitude', '<=', longitude + tolerance)
      .get();

    if (!existingApartments.empty) {
      res.status(400).send('Error: An apartment already exists at this location');
      return;
    }

    // Prepare apartment data
    const apartmentData: Apartment = {
      name,
      address,
      landlordId,
      roomTypes: processedRoomTypes as readonly RoomType[],
      photos,
      area,
      latitude,
      longitude,
      distanceToCampus,
    };

    if (!confirm) {
      // Return preliminary data for admin confirmation
      res.status(201).json({
        message: 'Preliminary data calculated. Please confirm to create apartment.',
        apartmentData,
        travelTimes,
        coordinates: { latitude, longitude },
      });
      return;
    }

    // Create the apartment in the database
    const apartmentDoc = buildingsCollection.doc();
    await apartmentDoc.set(apartmentData);

    // Update landlord's properties list
    const landlordData = landlordSnapshot.data();
    const updatedProperties = [...(landlordData?.properties || []), apartmentDoc.id];
    await landlordDoc.update({ properties: updatedProperties });

    // Store travel times for the new apartment
    await travelTimesCollection.doc(apartmentDoc.id).set(travelTimes);

    res.status(200).json({
      message: 'Apartment created successfully',
      apartmentId: apartmentDoc.id,
      apartmentData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating apartment');
  }
});

/**
 * Migrate All Apartments Schema - Migrates all apartments from old schema to new room types schema.
 *
 * @remarks
 * This endpoint performs a one-time migration of all apartments in the database:
 * 1. Initializes roomTypes as empty array []
 * 2. Deletes old fields: numBeds, numBaths, price
 * 3. Processes apartments in batches of 100 (3 batches total for ~300 apartments)
 * 4. Returns summary of migration success/failures
 *
 * @route POST /api/admin/migrate-all-apartments-schema
 *
 * @input {object} req.body - Migration options containing:
 *   - dryRun: boolean (optional) - if true, returns count without making changes
 *
 * @status
 * - 200: Migration completed successfully (returns summary)
 * - 401: Authentication failed
 * - 403: Unauthorized - Admin access required
 * - 500: Server error during migration
 */
app.post('/api/admin/migrate-all-apartments-schema', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');

  const { email } = req.user;
  const isAdmin = email && admins.includes(email);

  if (!isAdmin) {
    res.status(403).send('Unauthorized: Admin access required');
    return;
  }

  try {
    const { dryRun = false } = req.body;

    // Fetch all apartments
    const apartmentsSnapshot = await buildingsCollection.get();
    const totalApartments = apartmentsSnapshot.size;

    if (dryRun) {
      // Dry run: just return count and preview
      const sampleApartments = apartmentsSnapshot.docs.slice(0, 3).map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          hasOldSchema: 'numBeds' in data || 'numBaths' in data || 'price' in data,
          currentData: { numBeds: data.numBeds, numBaths: data.numBaths, price: data.price },
        };
      });

      res.status(200).json({
        dryRun: true,
        totalApartments,
        message: `Would migrate ${totalApartments} apartments`,
        sampleApartments,
      });
      return;
    }

    // Actual migration
    const startTime = Date.now();
    const batchSize = 100;
    const batches = Math.ceil(totalApartments / batchSize);

    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    console.log(`Starting migration of ${totalApartments} apartments in ${batches} batches...`);

    // Process in batches
    const batchIndices = Array.from({ length: batches }, (_, i) => i);

    await batchIndices.reduce(async (promise, batchIndex) => {
      await promise;

      const batchStartTime = Date.now();
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, totalApartments);
      const batchDocs = apartmentsSnapshot.docs.slice(start, end);

      console.log(
        `Processing batch ${batchIndex + 1}/${batches} (${batchDocs.length} apartments)...`
      );

      // Process batch
      const batch = db.batch();

      batchDocs.forEach((doc) => {
        try {
          const data = doc.data();

          // Check for corrupted data
          if (!data.name || !data.address) {
            errors.push(`Apartment ${doc.id}: Missing required fields (name or address)`);
            failed += 1;
            return;
          }

          // Create migrated apartment data
          const migratedData: Record<string, unknown> = {
            name: data.name,
            address: data.address,
            landlordId: data.landlordId || null,
            roomTypes: [], // Initialize as empty array
            photos: data.photos || [],
            area: data.area || 'OTHER',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            distanceToCampus: data.distanceToCampus || 0,
          };

          // Use batch.set to replace the document entirely (deletes old fields)
          batch.set(doc.ref, migratedData);
          migrated += 1;
        } catch (err) {
          const errorMsg = `Apartment ${doc.id}: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`;
          errors.push(errorMsg);
          failed += 1;
          console.error(errorMsg);
        }
      });

      // Commit batch
      await batch.commit();

      const batchDuration = Date.now() - batchStartTime;
      console.log(`Batch ${batchIndex + 1}/${batches} completed in ${batchDuration}ms`);
    }, Promise.resolve());

    const totalDuration = Date.now() - startTime;

    const summary = {
      success: true,
      totalApartments,
      migrated,
      failed,
      errors,
      durationMs: totalDuration,
      message: `Migration completed: ${migrated} migrated, ${failed} failed`,
    };

    console.log('Migration summary:', summary);

    res.status(200).json(summary);
  } catch (err) {
    console.error('Migration error:', err);
    res
      .status(500)
      .send(`Error during migration: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
});

// Web scraper and diffing endpoints
/**
 * Normalizes an address string for fuzzy matching:
 * lowercase, strip punctuation, remove "ithaca", zip codes, extra spaces.
 */
function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/[,.]/g, ' ')
    .replace(/\bithaca\b/g, '')
    .replace(/\bny\b/g, '')
    .replace(/\b\d{5}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeCSVField(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Run Web Scraper + Diff - Triggers all registered agency scrapers, compares
 * the results against the current Firestore buildings, and writes a diff CSV.
 *
 * @route POST /api/admin/run-scraper
 *
 * @input {string[]} [req.body.agencies] - Optional list of agency keys to run.
 *   Omit or pass "all" to run all registered scrapers.
 *
 * @status
 * - 200: Scrape + diff complete; returns summary and marks csvReady: true
 * - 401: Authentication failed
 * - 403: Unauthorized - Admin access required
 * - 500: Server error during scraping or diffing
 */
app.post('/api/admin/run-scraper', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');

  const { email } = req.user;
  if (!email || !admins.includes(email)) {
    res.status(403).send('Unauthorized: Admin access required');
    return;
  }

  try {
    const agencies = req.body.agencies ?? 'all';

    console.log('[run-scraper] Starting scrapers...');
    const { results: scraped, errors: scraperErrors } = await runScrapers({ agencies });
    console.log(`[run-scraper] Scraped ${scraped.length} properties.`);

    // Fetch current buildings from db
    const snapshot = await buildingsCollection.get();
    const dbBuildings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{
      id: string;
      name?: string;
      address?: string;
      numBeds?: number;
      numBaths?: number;
      price?: number;
    }>;

    const dbIndex = dbBuildings.map((b) => ({
      ...b,
      normalized: normalizeAddress(b.address ?? ''),
    }));

    type DiffRow = {
      status: 'NEW' | 'CHANGED' | 'UNCHANGED';
      firestoreId: string;
      dbName: string;
      scrapedAddress: string;
      numBedsScraped: string;
      numBedsDb: string;
      numBathsScraped: string;
      numBathsDb: string;
      priceScraped: string;
      priceDb: string;
      sourceUrl: string;
      agency: string;
    };

    const diffRows: DiffRow[] = [];
    let newCount = 0;
    let changedCount = 0;
    let unchangedCount = 0;

    scraped.forEach((prop) => {
      const normScraped = normalizeAddress(prop.address);

      const match = dbIndex.find(
        (b) => b.normalized.includes(normScraped) || normScraped.includes(b.normalized)
      );

      const numBedsScraped = prop.numBeds !== null ? String(prop.numBeds) : '';
      const numBathsScraped = prop.numBaths !== null ? String(prop.numBaths) : '';
      const priceScraped = prop.price !== null ? String(prop.price) : '';

      if (!match) {
        newCount += 1;
        diffRows.push({
          status: 'NEW',
          firestoreId: '',
          dbName: '',
          scrapedAddress: prop.address,
          numBedsScraped,
          numBedsDb: '',
          numBathsScraped,
          numBathsDb: '',
          priceScraped,
          priceDb: '',
          sourceUrl: prop.sourceUrl,
          agency: prop.agency,
        });
      } else {
        const numBedsDb = match.numBeds !== undefined ? String(match.numBeds) : '';
        const numBathsDb = match.numBaths !== undefined ? String(match.numBaths) : '';
        const priceDb = match.price !== undefined ? String(match.price) : '';

        const changed =
          (numBedsScraped !== '' && numBedsScraped !== numBedsDb) ||
          (numBathsScraped !== '' && numBathsScraped !== numBathsDb) ||
          (priceScraped !== '' && priceScraped !== priceDb);

        if (changed) {
          changedCount += 1;
        } else {
          unchangedCount += 1;
        }

        diffRows.push({
          status: changed ? 'CHANGED' : 'UNCHANGED',
          firestoreId: match.id,
          dbName: match.name ?? '',
          scrapedAddress: prop.address,
          numBedsScraped,
          numBedsDb,
          numBathsScraped,
          numBathsDb,
          priceScraped,
          priceDb,
          sourceUrl: prop.sourceUrl,
          agency: prop.agency,
        });
      }
    });

    // Write diff CSV
    const CSV_HEADERS = [
      'status',
      'firestoreId',
      'dbName',
      'scrapedAddress',
      'numBedsScraped',
      'numBedsDb',
      'numBathsScraped',
      'numBathsDb',
      'priceScraped',
      'priceDb',
      'sourceUrl',
      'agency',
    ];

    const csvLines = [
      CSV_HEADERS.join(','),
      ...diffRows.map((row) =>
        [
          row.status,
          row.firestoreId,
          row.dbName,
          row.scrapedAddress,
          row.numBedsScraped,
          row.numBedsDb,
          row.numBathsScraped,
          row.numBathsDb,
          row.priceScraped,
          row.priceDb,
          row.sourceUrl,
          row.agency,
        ]
          .map(escapeCSVField)
          .join(',')
      ),
    ];

    const csvPath = path.join(__dirname, '../scripts/scraper_diff.csv');
    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
    console.log(`[run-scraper] Diff CSV written to ${csvPath}`);

    res.status(200).json({
      total: scraped.length,
      newCount,
      changedCount,
      unchangedCount,
      scraperErrors,
      csvReady: true,
    });
  } catch (err) {
    console.error('[run-scraper] Error:', err);
    res.status(500).send(`Scraper error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
});

/**
 * Download Scraper Diff CSV - Returns the last scraper_diff.csv written by
 * POST /api/admin/run-scraper.
 *
 * @route GET /api/admin/scraper-results.csv
 *
 * @status
 * - 200: CSV file download
 * - 401: Authentication failed
 * - 403: Unauthorized - Admin access required
 * - 404: No scraper results found — run the scraper first
 * - 500: Server error
 */
app.get('/api/admin/scraper-results.csv', authenticate, async (req, res) => {
  if (!req.user) throw new Error('Not authenticated');

  const { email } = req.user;
  if (!email || !admins.includes(email)) {
    res.status(403).send('Unauthorized: Admin access required');
    return;
  }

  const csvPath = path.join(__dirname, '../scripts/scraper_diff.csv');

  if (!fs.existsSync(csvPath)) {
    res.status(404).send('No scraper results found. Run POST /api/admin/run-scraper first.');
    return;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="scraper_diff.csv"');
  fs.createReadStream(csvPath).pipe(res);
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
/**
 * Create Distance to Campus - Updates each building's distanceToCampus field with walking time to Ho Plaza.
 *
 * @remarks
 * Queries the entire travel times collection and updates each building document in the buildings collection
 * with its corresponding walking time to Ho Plaza. Returns an array of tuples containing the building ID
 * and updated walking time.
 *
 * @route POST /api/create-distance-to-campus
 *
 * @returns {Array<[string, number]>} Array of [buildingId, walkingTime] tuples
 *
 * @status
 * - 200: Successfully retrieved and updated walking times
 * - 500: Server error occurred while retrieving times or updating buildings
 */
app.post('/api/create-distance-to-campus', async (req, res) => {
  try {
    const snapshot = await travelTimesCollection.get();

    const walkingTimes = snapshot.docs.map((doc) => {
      const data = doc.data() as LocationTravelTimes;
      return [doc.id, data.hoPlazaWalking] as [string, number];
    });

    // Update each building's distanceToCampus field
    await Promise.all(
      walkingTimes.map(async ([buildingId, walkingTime]) => {
        const buildingRef = buildingsCollection.doc(buildingId);
        await buildingRef.update({
          distanceToCampus: walkingTime,
        });
      })
    );

    return res.status(200).json(walkingTimes);
  } catch (error) {
    console.error('Error retrieving/updating Ho Plaza walking times:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Add Folder - Creates a new folder assigned to a specific user.
 *
 * @route POST /api/folders
 *
 * @input {string} req.body - The name of the new folder to be created
 *
 * @status
 * - 201: Successfully created the folder
 * - 400: Folder name is missing or invalid
 * - 500: Error creating folder
 */
app.post('/api/folders', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderName } = req.body;
    if (!folderName || folderName.trim() === '') {
      return res.status(400).send('Folder name is required');
    }
    const newFolderRef = folderCollection.doc();

    // Create a new folder document
    await newFolderRef.set({
      name: folderName,
      userId: uid,
      createdAt: new Date(),
    });

    return res.status(201).json({ id: newFolderRef.id, name: folderName });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error creating folder');
  }
});

/**
 * Get Folders - Fetches all folders assigned to a specific user.
 *
 * @route GET /api/folders
 *
 * @status
 * - 200: Successfully retrieved folders
 * - 500: Error fetching folders
 */
app.get('/api/folders', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    // Fetch all folders for this user
    const folderSnapshot = await folderCollection.where('userId', '==', uid).get();

    const folders = folderSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(folders);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching folders');
  }
});

/** Get Folder By ID - Fetches a specific folder by ID.
 *
 * @route GET /api/folders/:folderId
 *
 * @input {string} req.params.folderId - The ID of the folder to be fetched
 *
 * @status
 * - 200: Successfully retrieved folder
 * - 403: Unauthorized to access this folder (not the owner)
 * - 404: Folder not found
 * - 500: Error fetching folder
 */
app.get('/api/folders/:folderId', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderId } = req.params;

    const folderRef = folderCollection.doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).send('Folder not found');
    }

    if (folderDoc.data()?.userId !== uid) {
      return res.status(403).send('Unauthorized to access this folder');
    }

    return res.status(200).json({ id: folderDoc.id, ...folderDoc.data() });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching folder');
  }
});

/**
 * Delete Folder - Deletes a folder by ID.
 *
 * @route DELETE /api/folders/:folderId
 *
 * @input {string} req.params.folderId - The ID of the folder to be deleted
 *
 * @status
 * - 200: Successfully deleted folder
 * - 403: Unauthorized to delete this folder (not the owner)
 * - 404: Folder not found
 * - 500: Error deleting folder
 */
app.delete('/api/folders/:folderId', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderId } = req.params;

    const folderRef = folderCollection.doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).send('Folder not found');
    }

    if (folderDoc.data()?.userId !== uid) {
      return res.status(403).send('Unauthorized to delete this folder');
    }

    await folderRef.delete();
    return res.status(200).send('Folder deleted successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error deleting folder');
  }
});

/**
 * Rename Folder - Renames a folder by ID.
 *
 * @route PUT /api/folders/:folderId
 *
 * @input {string} req.params.folderId - The ID of the folder to be renamed
 *
 * @status
 * - 200: Successfully renamed folder
 * - 403: Unauthorized to rename this folder (not the owner)
 * - 404: Folder not found
 * - 500: Error renaming folder
 */
app.put('/api/folders/:folderId', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderId } = req.params;
    const { newName } = req.body;

    const folderRef = folderCollection.doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).send('Folder not found');
    }

    if (folderDoc.data()?.userId !== uid) {
      return res.status(403).send('Unauthorized to rename this folder');
    }

    await folderRef.update({ name: newName });
    return res.status(200).send('Folder renamed successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error renaming folder');
  }
});

/**
 * Add Apartment - Adds an apartment to a folder.
 *
 * @route POST /api/folders/:folderId/apartments
 *
 * @input {string} req.body - The id of the apartment to be added
 * @input {string} req.params.folderId - The ID of the folder to add the apartment to
 *
 * @status
 * - 200: Successfully added apartment to folder
 * - 403: Unauthorized to modify this folder (not the owner)
 * - 404: Folder not found
 * - 400: Apartment already in folder
 * - 500: Error adding apartment to folder
 */
app.post('/api/folders/:folderId/apartments', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderId } = req.params;
    const { aptId } = req.body;

    const folderRef = folderCollection.doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).send('Folder not found');
    }

    if (folderDoc.data()?.userId !== uid) {
      return res.status(403).send('Unauthorized to modify this folder');
    }

    const apartments = folderDoc.data()?.apartments || [];
    if (apartments.includes(aptId)) {
      return res.status(400).send('Apartment already in folder');
    }

    apartments.push(aptId);
    await folderRef.update({ apartments });
    return res.status(200).send('Apartment added to folder successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error adding apartment to folder');
  }
});

/**
 * Remove Apartment - Removes an apartment from a folder.
 *
 * @route DELETE /api/folders/:folderId/apartments/:apartmentId
 *
 * @input {string} req.body - The id of the apartment to be removed
 * @input {string} req.params.folderId - The ID of the folder to remove the apartment from
 *
 * @status
 * - 200: Successfully removed apartment from folder
 * - 403: Unauthorized to modify this folder (not the owner)
 * - 404: Folder not found
 * - 500: Error removing apartment from folder
 */
app.delete('/api/folders/:folderId/apartments/:apartmentId', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderId, apartmentId } = req.params;

    const folderRef = folderCollection.doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).send('Folder not found');
    }

    if (folderDoc.data()?.userId !== uid) {
      return res.status(403).send('Unauthorized to modify this folder');
    }

    let apartments = folderDoc.data()?.apartments || [];
    apartments = apartments.filter((id: string) => id !== apartmentId);
    await folderRef.update({ apartments });
    return res.status(200).send('Apartment removed from folder successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error removing apartment from folder');
  }
});

/**
 * Get Apartments in Folder - Retrieves all apartments in a specific folder.
 *
 * @route GET /api/folders/:folderId/apartments
 *
 * @input {string} req.params - The folderId of the folder to get apartments from
 *
 * @status
 * - 200: Successfully retrieved apartments from folder
 * - 403: Unauthorized to access this folder (not the owner)
 * - 404: Folder not found
 * - 500: Error fetching apartments from folder
 */
app.get('/api/folders/:folderId/apartments', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    const { uid } = req.user;
    const { folderId } = req.params;

    const folderRef = folderCollection.doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).send('Folder not found');
    }

    if (folderDoc.data()?.userId !== uid) {
      return res.status(403).send('Unauthorized to access this folder');
    }

    const apartments = folderDoc.data()?.apartments || [];
    const aptsArr = await Promise.all(
      apartments.map(async (id: string) => {
        const snapshot = await buildingsCollection.doc(id).get();
        if (!snapshot.exists) {
          console.warn(`Apartment ${id} not found`);
          return null;
        }
        return { id, ...snapshot.data() };
      })
    );

    // Filter out any null values from non-existent apartments
    const validApartments = aptsArr.filter((apt) => apt !== null);
    const enrichedResults = await pageData(validApartments);
    return res.status(200).json(enrichedResults);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching apartments from folder');
  }
});

export default app;
