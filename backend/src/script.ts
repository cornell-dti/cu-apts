import { db } from './firebase-config';
import reviewData from './landlord_reviews.json';
import { Review } from '../../common/types/db-types';

const reviewCollection = db.collection('reviews');

const makeReview = async (review: Review) => {
  try {
    const doc = reviewCollection.doc();
    doc.set({ ...review, date: new Date(review.date) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatReview = (data: any): Review => ({
  landlordId: data.landlordId.toString(),
  aptId: data.aptId.toString(),
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
});

reviewData.map((review) => makeReview(formatReview(review)));
