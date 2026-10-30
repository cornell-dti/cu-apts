import { AiSearchResponse } from '../../../common/types/ai-search-types';

// Listings are real apartments from backend/src/data/buildings.json (ids are the seed ids, not
// Firestore ids), and featured reviews are real text from reviews.json.
// The seed data has no coordinates, photos, prices, or bedroom counts, so latitude/longitude and
// the price/bed values on 237, 238 and 244 are ILLUSTRATIVE placeholders only.
export const MOCK_AI_SEARCH_RESPONSE: AiSearchResponse = {
  query: 'walkable apartment near campus with good maintenance',
  blocks: [
    {
      type: 'text',
      content:
        'Here are some well-reviewed apartments close to campus. Collegetown is the most walkable option.',
    },
    {
      type: 'property_cards',
      heading: 'Best for walkability',
      intro: 'These are all within a short walk of campus.',
      // '999' is not in `listings` and '237' is repeated, to exercise the skip paths.
      listingIds: ['237', '238', '94', '999', '237', '96', '245'],
    },
    {
      type: 'comparison_table',
      heading: 'How they compare',
      rows: [
        { listingId: '238', keyFeature: 'Higher rent, but reviewers say it is worth it' },
        { listingId: '244', keyFeature: 'Fast maintenance and friendly staff' },
        { listingId: '96', keyFeature: 'Downtown location with no reviews yet' },
      ],
    },
    {
      type: 'neighborhoods',
      heading: 'Neighborhoods to consider',
      neighborhoods: ['COLLEGETOWN', 'DOWNTOWN', 'NORTH'],
    },
  ],
  listings: {
    '237': {
      id: '237',
      name: '301 College Ave',
      address: '301 College Ave',
      photoUrl: null,
      minBeds: 2,
      maxBeds: 6,
      minPrice: 1100,
      maxPrice: 1600,
      avgRating: 5,
      numReviews: 1,
      latitude: 42.4427,
      longitude: -76.4855,
      featuredReview:
        "I've really enjoyed this apartment. I lived in an apartment of 6 and it was still quite spacious for us.",
    },
    '238': {
      id: '238',
      name: '312 College Ave',
      address: '312 College Ave',
      photoUrl: null,
      minBeds: 1,
      maxBeds: 4,
      minPrice: 1300,
      maxPrice: 1900,
      avgRating: 5,
      numReviews: 1,
      latitude: 42.4429,
      longitude: -76.4851,
      featuredReview:
        "I've enjoyed my time living at 312 College Ave. The rent is high but you do get what you pay for.",
    },
    // Seed reviews report no price or bedrooms, so these are null.
    '94': {
      id: '94',
      name: 'Aces Apartments',
      address: '418 Eddy St',
      photoUrl: null,
      minBeds: null,
      maxBeds: null,
      minPrice: null,
      maxPrice: null,
      avgRating: 3,
      numReviews: 1,
      latitude: 42.4421,
      longitude: -76.4829,
      featuredReview:
        'Generally very old, but the maintenance service is relatively quick and communicates well.',
    },
    '244': {
      id: '244',
      name: 'The Student Agencies Building',
      address: '409 College Ave',
      photoUrl: null,
      minBeds: 1,
      maxBeds: 3,
      minPrice: 1400,
      maxPrice: 2100,
      avgRating: 4,
      numReviews: 1,
      latitude: 42.4431,
      longitude: -76.4846,
      featuredReview:
        'Maintenance is really fast and the staff are really nice. The only problem is the price of rent.',
    },
    // Studio with a single price: exercises "Studio" and the min-equals-max price format.
    '245': {
      id: '245',
      name: 'Collegetown Studios',
      address: '120 Dryden Rd',
      photoUrl: null,
      minBeds: 0,
      maxBeds: 0,
      minPrice: 1250,
      maxPrice: 1250,
      avgRating: 4.6,
      numReviews: 5,
      latitude: 42.4423,
      longitude: -76.4862,
      featuredReview: null,
    },
    // No approved reviews yet: no rating and no featured review.
    '96': {
      id: '96',
      name: 'Commons West Apartments',
      address: '101 E State St',
      photoUrl: null,
      minBeds: null,
      maxBeds: null,
      minPrice: null,
      maxPrice: null,
      avgRating: null,
      numReviews: 0,
      latitude: 42.4399,
      longitude: -76.4969,
      featuredReview: null,
    },
  },
};
