import { Review } from '@common/types/db-types';
import { db } from '../src/firebase-config';
import reviewData from '../src/data/reviews.json';

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
  aptId: data.aptId.toString(),
  reviewText: data.reviewText,
  overallRating: data.overallRating,
  bedrooms: data.bedrooms,
  price: data.price,
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

reviewData.map((review) => makeReview(formatReview(review)));
