import { db } from './firebase-config';
import reviewData from './data/landlord_reviews.json';
import landlordData from './data/landlords.json';
import { Landlord, LandlordWithId, Review } from '../../common/types/db-types';

const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');

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
  photos: data.photos,
});

const formatLandlord = ({
  id,
  name,
  contact,
  avgRating,
  photos,
  reviews,
  properties,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any): LandlordWithId => ({
  id: id.toString(),
  name,
  contact,
  avgRating: avgRating.length > 0 ? Number.parseFloat(avgRating) : 0,
  photos: photos.length > 0 ? photos : [],
  reviews: reviews.length > 0 ? reviews : [],
  properties: properties.length > 0 ? properties : [],
});

const makeLandlord = async (landlordWithId: LandlordWithId) => {
  try {
    const doc = landlordCollection.doc(landlordWithId.id);
    const landlord = landlordWithId as Landlord;

    console.log(`landlord = ${JSON.stringify({ ...landlord })}`);
    doc.set({ ...landlord });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

reviewData.map((review) => makeReview(formatReview(review)));

landlordData.map((landlord) => makeLandlord(formatLandlord(landlord)));
