import { CardData } from '../App';
import { ApartmentWithId } from '../../../common/types/db-types';
export type AptSortFields = keyof CardData | keyof ApartmentWithId | 'originalOrder';

/**
 * sortApartments – Sorts an array of apartment data based on a specified property in ascending or descending order.
 *
 * @remarks
 * Creates a shallow copy of the input array and sorts it based on either CardData or ApartmentWithId properties.
 * If the property values are equal, sorts by apartment ID as a tiebreaker.
 *
 * @param {CardData[]} arr - Array of apartment card data to sort
 * @param {AptSortFields} property - Property to sort apartments by
 * @param {boolean} orderLowToHigh - If true, sorts ascending; if false, sorts descending
 * @return {CardData[]} - New sorted array of apartment data
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
