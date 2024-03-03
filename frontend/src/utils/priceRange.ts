const priceOptions = [
  '< $800',
  '$800 - $1K',
  '$1K - $1.2K',
  '$1.2 - $1.4K',
  '$1.4 - $1.6K',
  '$1.6K+',
];

export default function getPriceRange(priceNum: number): string {
  return priceOptions[priceNum - 1];
}
