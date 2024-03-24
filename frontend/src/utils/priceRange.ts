const priceOptions = [
  '< $800',
  '$800 - $1K',
  '$1 - $1.2K',
  '$1.2 - $1.4K',
  '$1.4 - $1.6K',
  '$1.6K+',
];

/**
 * Returns the price range option given the (1-based) index.
 * The price range options are as following:
 * 1: < $800
 * 2: $800 - $1K
 * 3: $1 - $1.2K
 * 4: $1.2 - $1.4K
 * 5: $1.4 - $1.6K
 * 6: $1.6K+
 * If an out-of-range index is given, the function will return undefined.
 *
 * @param {number} priceNum – The 1-based index of the desired price range.
 * @returns {string} The string of the corresponding price range.
 */
export default function getPriceRange(priceNum: number): string {
  return priceOptions[priceNum - 1];
}
