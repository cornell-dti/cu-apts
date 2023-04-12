import { Review } from '@common/types/db-types';
import { db } from '../src/firebase-config';
import reviewData from '../src/data/new_reviews.json';

const reviewCollection = db.collection('reviews');

const makeReview = async (review: Review) => {
  try {
    const doc = reviewCollection.doc();
    doc.set({ ...review, date: new Date(review.date) });
  } catch (err) {
    console.log(err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatReview = (data: any): Review => ({
  landlordId: data.landlordId.toString(),
  aptId: data.aptId === null ? null : data.aptId.toString(),
  reviewText: data.reviewText,
  overallRating: data.overallRating,
  detailedRatings: {
    location: data['detailedRatings.location'],
    safety: data['detailedRatings.safety'],
    value: data['detailedRatings.value'],
    maintenance: data['detailedRatings.maintenance'],
    communication: data['detailedRatings.communication'],
    conditions: data['detailedRatings.condition'],
  },
  date: data.date,
  photos: data.photos ? data.photos : [],
});

const getExistingReviews = async () => {
  const snapshot = await reviewCollection.get();
  const text = snapshot.docs.map((doc) => doc.data().reviewText);

  const existingReviewText = new Set(text);

  reviewData.map((review) => {
    if (!existingReviewText.has(review.reviewText)) {
      makeReview(formatReview(review));
      return true;
    }
    return false;
  });
};

getExistingReviews();
