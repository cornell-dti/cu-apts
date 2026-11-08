import { ApartmentWithId, Review } from '../../common/types/db-types';

type CandidateApartment = Pick<ApartmentWithId, 'id' | 'roomTypes' | 'distanceToCampus'>;
type CandidateReview = Pick<Review, 'aptId' | 'status' | 'overallRating'>;

export type RecommendationCandidate = {
  apartmentId: string;
  roomOptions: {
    roomTypeId: string;
    price: number | null;
    bedrooms: number | null;
  }[];
  walkingMinutesToHoPlaza: number | null;
  rating: { average: number | null; reviewCount: number };
};

export const buildRecommendationCandidate = (
  apartment: CandidateApartment,
  reviews: readonly CandidateReview[]
): RecommendationCandidate => {
  const roomOptions = (apartment.roomTypes || []).map((room) => ({
    roomTypeId: room.id,
    price: Number.isFinite(room.price) && room.price > 0 ? room.price : null,
    bedrooms: Number.isInteger(room.beds) && room.beds >= 0 ? room.beds : null,
  }));
  const walkingMinutes = apartment.distanceToCampus;
  const ratings = reviews
    .filter(
      (review) =>
        review.aptId === apartment.id &&
        review.status === 'APPROVED' &&
        Number.isFinite(review.overallRating) &&
        review.overallRating >= 1 &&
        review.overallRating <= 5
    )
    .map((review) => review.overallRating);

  return {
    apartmentId: apartment.id,
    roomOptions,
    walkingMinutesToHoPlaza:
      Number.isFinite(walkingMinutes) && walkingMinutes >= 0 ? walkingMinutes : null,
    rating: {
      average:
        ratings.length > 0
          ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
          : null,
      reviewCount: ratings.length,
    },
  };
};
