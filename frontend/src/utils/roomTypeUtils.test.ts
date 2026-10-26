import { RoomType } from '../../../common/types/db-types';
import {
  formatBaths,
  formatBathsRange,
  formatBeds,
  formatBedsRange,
  formatPrice,
  formatPriceRange,
  formatRoomTypesDisplay,
  getMaxPrice,
  getMinPrice,
  getRoomTypeRange,
} from './roomTypeUtils';

const roomType = (id: string, beds: number, baths: number, price: number): RoomType => ({
  id,
  beds,
  baths,
  price,
});

describe('room type value formatting', () => {
  it.each([
    [800, '$800'],
    [1000, '$1K'],
    [1500, '$1.5K'],
  ])('formats a $%i price as %s', (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });

  it.each([
    [0, 'Studio'],
    [1, '1 bed'],
    [3, '3 beds'],
  ])('formats %i bedrooms as %s', (beds, expected) => {
    expect(formatBeds(beds)).toBe(expected);
  });

  it.each([
    [1, '1 bath'],
    [1.5, '1.5 baths'],
    [2, '2 baths'],
  ])('formats %i bathrooms as %s', (baths, expected) => {
    expect(formatBaths(baths)).toBe(expected);
  });
});

describe('room type range calculation', () => {
  const roomTypes = [
    roomType('three-bed', 3, 2, 3000),
    roomType('studio', 0, 1, 1500),
    roomType('two-bed', 2, 1.5, 2200),
  ];

  it('returns null for an empty room type list', () => {
    expect(getRoomTypeRange([])).toBeNull();
  });

  it('finds each minimum and maximum regardless of input order', () => {
    expect(getRoomTypeRange(roomTypes)).toEqual({
      minBeds: 0,
      maxBeds: 3,
      minBaths: 1,
      maxBaths: 2,
      minPrice: 1500,
      maxPrice: 3000,
    });
  });

  it('returns minimum and maximum prices, or null for no room types', () => {
    expect(getMinPrice(roomTypes)).toBe(1500);
    expect(getMaxPrice(roomTypes)).toBe(3000);
    expect(getMinPrice([])).toBeNull();
    expect(getMaxPrice([])).toBeNull();
  });
});

describe('room type range formatting', () => {
  it('collapses equal price, bedroom, and bathroom ranges', () => {
    expect(formatPriceRange(2000, 2000)).toBe('$2K');
    expect(formatBedsRange(2, 2)).toBe('2 beds');
    expect(formatBathsRange(1, 1)).toBe('1 bath');
  });

  it('formats differing price, bedroom, and bathroom ranges', () => {
    expect(formatPriceRange(1500, 3000)).toBe('$1.5K - $3K');
    expect(formatBedsRange(1, 3)).toBe('1-3 beds');
    expect(formatBathsRange(1, 2)).toBe('1-2 baths');
  });

  it('labels a bedroom range beginning at zero as a studio range', () => {
    expect(formatBedsRange(0, 2)).toBe('Studio-2 beds');
  });
});

describe('room type display formatting', () => {
  it('shows a placeholder when an apartment has no room types', () => {
    expect(formatRoomTypesDisplay([])).toBe('Coming soon');
  });

  it('formats a single room type without redundant ranges', () => {
    expect(formatRoomTypesDisplay([roomType('single', 2, 1, 2000)])).toBe('$2K | 2 beds | 1 bath');
  });

  it('summarizes multiple room types using their full ranges', () => {
    const roomTypes = [roomType('large', 3, 2, 3000), roomType('studio', 0, 1, 1500)];

    expect(formatRoomTypesDisplay(roomTypes)).toBe('$1.5K - $3K | Studio-3 beds | 1-2 baths');
  });
});
