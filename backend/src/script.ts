import { db } from './firebase-config';
import reviewData from './data/landlord_reviews.json';
import landlordData from './data/landlords.json';
import { Landlord, LandlordWithId, Review } from '../../common/types/db-types';

const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');

type LandlordData = {
  id: number;
  name: string;
  contact: string | null;
  avgRating: string;
  photos: string;
  reviews: string;
  properties: string;
  address: string | null;
};

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
  address,
}: LandlordData): LandlordWithId => ({
  id: id.toString(),
  name,
  contact,
  avgRating: Number.parseFloat(avgRating || '0'),
  photos: photos.split(',').filter((e) => e),
  reviews: reviews.split(',').filter((e) => e),
  properties: properties.split(',').filter((e) => e),
  address,
});

const makeLandlord = async (landlordWithId: LandlordWithId) => {
  try {
    const { id, ...rest } = landlordWithId;
    const doc = landlordCollection.doc(id);
    const landlord = rest as Landlord;
    doc.set({ landlord });
  } catch (err) {
    console.log(err);
  }
};

reviewData.map((review) => makeReview(formatReview(review)));

landlordData.map((landlord) => makeLandlord(formatLandlord(landlord)));
