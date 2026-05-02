import axios from 'axios';
import { ScrapedProperty } from '../types';

const API_URL =
  'https://www.travishyde.com/rts/collections/public/46d82ae2/runtime/collection/appfolio-listings/query-data?pageSize=200&pageNumber=0&query=%28%29&language=ENGLISH';
const BASE_URL = 'https://www.travishyde.com';
const AGENCY = 'travishyde';

const HEADERS = { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' };

/** Returns the first regex match for a keyword in a comma-separated amenities string. */
function extractAmenitySnippet(haystack: string, pattern: RegExp): string | null {
  const match = haystack.match(pattern);
  return match ? match[0].trim() : null;
}

/** True if any keyword appears (case-insensitive) in the string. */
function contains(haystack: string, ...keywords: string[]): boolean {
  const lower = haystack.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function mapListing(item: any): ScrapedProperty | null {
  const data = item?.data;
  if (!data?.full_address) return null;

  const address: string = data.full_address;
  const numBeds: number | null = data.bedrooms != null ? Number(data.bedrooms) : null;
  const numBaths: number | null = data.bathrooms != null ? parseFloat(data.bathrooms) : null;
  const price: number | null =
    data.market_rent != null ? Math.round(parseFloat(data.market_rent)) : null;
  const priceRaw: string | null = price != null ? `$${price}/month` : null;

  const availableDate: string | null = data.available_date || null;

  const amenitiesStr: string = data.amenities || '';
  const utilitiesStr: string = data.utilities || '';
  const combined = `${amenitiesStr} ${utilitiesStr}`;

  const laundry: string | null = contains(amenitiesStr, 'laundry')
    ? extractAmenitySnippet(amenitiesStr, /[^,]*laundry[^,]*/i) ?? 'Available'
    : null;

  const internet: string | null = contains(combined, 'internet', 'wifi', 'fiber')
    ? 'Available'
    : null;

  const snowRemoval: string | null = contains(amenitiesStr, 'snow removal') ? 'Included' : null;

  const porch: boolean | null = contains(amenitiesStr, 'balcony', 'porch') ? true : null;

  const parking: string | null = contains(amenitiesStr, 'parking') ? 'Available' : null;

  const trash: string | null = contains(combined, 'trash', 'recycling') ? 'Included' : null;

  const listableUid: string = data.listable_uid || item.page_item_url || '';
  const sourceUrl = listableUid
    ? `${BASE_URL}/listings/detail/${listableUid}`
    : `${BASE_URL}/availability`;

  return {
    address,
    sourceUrl,
    agency: AGENCY,
    numBeds,
    numBaths,
    price,
    priceRaw,
    utilities: utilitiesStr || null,
    parking,
    laundry,
    porch,
    internet,
    trash,
    snowRemoval,
    availableDate,
    description: null,
  };
}

async function scrapeTravisHyde(): Promise<ScrapedProperty[]> {
  console.log('[travishyde] Fetching listings from collection API…');

  const { data: responseData } = await axios.get<any>(API_URL, {
    headers: HEADERS,
    timeout: 20_000,
  });

  const items: any[] = responseData?.values || [];
  console.log(`[travishyde] API returned ${items.length} items`);

  const results: ScrapedProperty[] = items
    .map(mapListing)
    .filter((p): p is ScrapedProperty => p !== null);

  console.log(`[travishyde] Done. Scraped ${results.length} properties.`);
  return results;
}

export default scrapeTravisHyde;
