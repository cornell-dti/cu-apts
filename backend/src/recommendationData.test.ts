import { ApartmentWithId, Review } from '../../common/types/db-types';
import { buildRecommendationCandidate } from './recommendationData';

type CandidateApartment = Pick<ApartmentWithId, 'id' | 'roomTypes' | 'distanceToCampus'>;
type CandidateReview = Pick<Review, 'aptId' | 'status' | 'overallRating'>;

const apartment: CandidateApartment = {
  id: 'apartment-1',
  roomTypes: [
    { id: 'one-bed', beds: 1, baths: 1, price: 900 },
    { id: 'three-bed', beds: 3, baths: 2, price: 1800 },
  ],
  distanceToCampus: 12.5,
};

const review = (overrides: Partial<CandidateReview> = {}): CandidateReview => ({
  aptId: apartment.id,
  status: 'APPROVED',
  overallRating: 4,
  ...overrides,
});

describe('buildRecommendationCandidate', () => {
  it('keeps each price paired with the bedrooms for the same room type', () => {
    const candidate = buildRecommendationCandidate(apartment, []);
    expect(candidate.apartmentId).toBe(apartment.id);
    expect(candidate.roomOptions).toEqual([
      { roomTypeId: 'one-bed', price: 900, bedrooms: 1 },
      { roomTypeId: 'three-bed', price: 1800, bedrooms: 3 },
    ]);
    expect(candidate.walkingMinutesToHoPlaza).toBe(12.5);
  });

  it('represents absent room data without inventing a free studio', () => {
    const candidate = buildRecommendationCandidate({ ...apartment, roomTypes: [] }, []);
    expect(candidate.roomOptions).toEqual([]);
  });

  it('tolerates a legacy apartment with no roomTypes field', () => {
    const legacy = { id: apartment.id, distanceToCampus: 8 } as CandidateApartment;
    expect(buildRecommendationCandidate(legacy, []).roomOptions).toEqual([]);
  });

  it('preserves a studio, a decimal price, and a zero-minute walk', () => {
    const candidate = buildRecommendationCandidate(
      {
        ...apartment,
        roomTypes: [{ id: 'studio', beds: 0, baths: 1, price: 950.5 }],
        distanceToCampus: 0,
      },
      []
    );
    expect(candidate.roomOptions).toEqual([{ roomTypeId: 'studio', price: 950.5, bedrooms: 0 }]);
    expect(candidate.walkingMinutesToHoPlaza).toBe(0);
  });

  it.each([0, -1, NaN, Infinity, -Infinity])('marks invalid price %s unknown', (price) => {
    const candidate = buildRecommendationCandidate(
      { ...apartment, roomTypes: [{ id: 'room', beds: 2, baths: 1, price }] },
      []
    );
    expect(candidate.roomOptions).toEqual([{ roomTypeId: 'room', price: null, bedrooms: 2 }]);
  });

  it.each([-1, 1.5, NaN, Infinity])('marks invalid bedroom count %s unknown', (beds) => {
    const candidate = buildRecommendationCandidate(
      { ...apartment, roomTypes: [{ id: 'room', beds, baths: 1, price: 1000 }] },
      []
    );
    expect(candidate.roomOptions).toEqual([{ roomTypeId: 'room', price: 1000, bedrooms: null }]);
  });

  it.each([-1, NaN, Infinity, -Infinity])('marks invalid walk time %s unknown', (distance) => {
    const candidate = buildRecommendationCandidate(
      { ...apartment, distanceToCampus: distance },
      []
    );
    expect(candidate.walkingMinutesToHoPlaza).toBeNull();
  });

  it('does not confuse an unrated apartment with a zero-star apartment', () => {
    expect(buildRecommendationCandidate(apartment, []).rating).toEqual({
      average: null,
      reviewCount: 0,
    });
  });

  it('averages approved ratings for this apartment only', () => {
    const candidate = buildRecommendationCandidate(apartment, [
      review({ overallRating: 3 }),
      review({ overallRating: 5 }),
      review({ aptId: 'other-apartment', overallRating: 1 }),
      review({ aptId: null, overallRating: 1 }),
      review({ status: 'PENDING', overallRating: 1 }),
      review({ status: 'DECLINED', overallRating: 1 }),
      review({ status: 'DELETED', overallRating: 1 }),
      review({ status: 'REPORTED', overallRating: 1 }),
      review({ status: undefined, overallRating: 1 }),
    ]);
    expect(candidate.rating).toEqual({ average: 4, reviewCount: 2 });
  });

  it.each([0, -1, 6, NaN, Infinity])(
    'excludes invalid rating %s from the count and mean',
    (rating) => {
      const candidate = buildRecommendationCandidate(apartment, [
        review({ overallRating: rating }),
        review({ overallRating: 4 }),
      ]);
      expect(candidate.rating).toEqual({ average: 4, reviewCount: 1 });
    }
  );

  it('returns an unknown rating if no usable approved rating remains', () => {
    const candidate = buildRecommendationCandidate(apartment, [
      review({ overallRating: 0 }),
      review({ status: 'PENDING' }),
    ]);
    expect(candidate.rating).toEqual({ average: null, reviewCount: 0 });
  });

  it('does not mutate input records or reuse their room objects', () => {
    const frozenApartment = Object.freeze({
      ...apartment,
      roomTypes: Object.freeze(apartment.roomTypes.map((room) => Object.freeze({ ...room }))),
    });
    const frozenReviews = Object.freeze([Object.freeze(review())]);
    const before = JSON.stringify({ frozenApartment, frozenReviews });
    const candidate = buildRecommendationCandidate(frozenApartment, frozenReviews);
    candidate.roomOptions[0].price = 1;
    expect(JSON.stringify({ frozenApartment, frozenReviews })).toBe(before);
    expect(buildRecommendationCandidate(frozenApartment, frozenReviews).roomOptions[0].price).toBe(
      900
    );
  });
});
