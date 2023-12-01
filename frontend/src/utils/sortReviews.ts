import { ReviewWithId } from '../../../common/types/db-types';
type Fields = keyof ReviewWithId;

/**
 * Sort reviews based on a specific property.
 * @param arr ReviewWithId[] – array of ReviewWithId objects.
 * @param property Fields – the property to sort the reviews with
 */

const sortReviews = (arr: ReviewWithId[], property: Fields) => {
  let unsorted = arr;
  return unsorted.sort((r1, r2) => {
    const first = r1?.[property] ?? 0;
    const second = r2?.[property] ?? 0;
    // @ts-ignore: Object possibly null or undefined

    //if first === second, then compare IDs
    if (first === second) {
      const firstID = r1?.id ?? '';
      const secondID = r2?.id ?? '';
      return firstID < secondID ? 1 : -1;
    } else {
      return first < second ? 1 : -1;
    }
  });
};

export { sortReviews };
