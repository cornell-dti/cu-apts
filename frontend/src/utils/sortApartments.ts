import { CardData } from '../App';
import { ApartmentWithId } from '../../../common/types/db-types';
export type AptSortFields = keyof CardData | keyof ApartmentWithId | 'originalOrder';

/**
 * Sort apartments based on a specific property.
 * @param arr CardData[] – array of CardData objects.
 * @param property Fields – the property to sort the reviews with
 * @param orderLowToHigh boolean – if true, sort from low to high, otherwise sort from high to low
 * @returns CardData[] – a sorted shallow copy of the array of CardData objects
 */

const sortApartments = (arr: CardData[], property: AptSortFields, orderLowToHigh: boolean) => {
  // clone array to ensure we can keep the original indexes.
  let clonedArr: CardData[] = arr.slice();
  if (property === 'originalOrder') {
    return orderLowToHigh ? clonedArr.reverse() : clonedArr;
  }
  return clonedArr.sort((r1, r2) => {
    let first, second;

    //if property is a key of ApartmentWithId, then sort by that property using r1?.buildingData[property]
    if (property in r1.buildingData) {
      const prop = property as keyof ApartmentWithId;
      first = r1.buildingData?.[prop] ?? 0;
      second = r2.buildingData?.[prop] ?? 0;
      // @ts-ignore: Object possibly null or undefined
    } else {
      const prop = property as keyof CardData;
      first = r1?.[prop] ?? 0;
      second = r2?.[prop] ?? 0;
      // @ts-ignore: Object possibly null or undefined
    }
    //if first === second, then compare IDs
    if (first === second) {
      const firstID = r1?.buildingData.id ?? '';
      const secondID = r2?.buildingData.id ?? '';
      //always order bigger ids first
      return firstID < secondID ? 1 : -1;
    } else {
      //if we are trying to order it from high to low
      if (typeof orderLowToHigh == 'undefined' || !orderLowToHigh) {
        return first < second ? 1 : -1;
      }
      //otherwise we order it from low to high
      return first < second ? -1 : 1;
    }
  });
};

export { sortApartments };
