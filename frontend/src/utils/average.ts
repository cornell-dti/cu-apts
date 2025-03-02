import { ReviewWithId } from '../../../common/types/db-types';

/**
 * getAverageRating – Calculates the average overall rating from an array of reviews.
 *
 * @remarks
 * This function sums the `overallRating` values of all reviews where the rating is greater than 0
 * and divides the sum by the total number of reviews in the array. If all reviews have a rating of 0,
 * the function returns 0.
 *
 * @param {ReviewWithId[]} reviewData – Array of ReviewWithId objects (reviews)
 *
 * @returns {number} – The average overall rating of the provided reviews.
 */

const getAverageRating = (reviewData: ReviewWithId[]) =>
  reviewData.reduce(
    (currSum, { overallRating }) => (overallRating > 0 ? currSum + overallRating : currSum),
    0
  ) / reviewData.length;

export { getAverageRating };
