import { Landlord, LandlordWithId } from '@common/types/db-types';
import { db } from '../src/firebase-config';
import landlordData from '../src/data/landlords.json';

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

landlordData.map((landlord) => makeLandlord(formatLandlord(landlord)));
