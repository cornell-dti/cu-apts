import { ReviewWithId } from '../../../common/types/db-types';

const getAverageRating = (reviewData: ReviewWithId[]) =>
  reviewData.reduce(
    (currSum, { overallRating }) => (overallRating > 0 ? currSum + overallRating : currSum),
    0
  ) / reviewData.length;

export { getAverageRating };
