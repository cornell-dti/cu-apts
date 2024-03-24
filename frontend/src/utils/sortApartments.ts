import { CardData } from '../App';
import axios from 'axios';
import { getAverageRating } from './average';

export type AptSortField = 'overallRating' | 'numReviews';
export type CardDataWithRating = CardData & {
  avgRating: number;
};

const sortApartments = async (arr: CardData[], property: AptSortField) => {
  const withRatings: CardDataWithRating[] = await Promise.all(
    arr.map(async (elem) => {
      return {
        avgRating: getAverageRating(
          (await axios.get(`/api/review/aptId/${elem.buildingData.id}/APPROVED`)).data
        ),
        ...elem,
      };
    })
  );

  withRatings.sort((apt1, apt2) => {
    switch (property) {
      case 'numReviews':
        // sorts by decreasing number of reviews
        return apt2.numReviews - apt1.numReviews;
      case 'overallRating':
        // sorts by decreasing average rating
        return apt2.avgRating - apt1.avgRating;
    }
    return -1;
  });

  return withRatings.map(
    (elem) =>
      ({
        buildingData: elem.buildingData,
        numReviews: elem.numReviews,
        company: elem.company,
      } as CardData)
  );
};

export { sortApartments };
