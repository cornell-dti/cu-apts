import axios from 'axios';
import { ScrapedProperty } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio: any = require('cheerio');

const BASE_URL = 'https://www.elitecollegerentals.com';
const PROPERTIES_URL = `${BASE_URL}/housing-options`;
const AGENCY = 'elitecollegerentals';

const HEADERS = { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' };

/**
 * Splits a bullet like "Bedrooms: 7" into { key: "bedrooms", value: "7" }.
 * Returns null if no colon is found.
 */
function parseBullet(text: string): { key: string; value: string } | null {
  const idx = text.indexOf(':');
  if (idx === -1) return null;
  return {
    key: text.slice(0, idx).trim().toLowerCase(),
    value: text.slice(idx + 1).trim(),
  };
}

/** "7" → 7, "two" → 2.  Returns null when unparseable. */
function parseNumber(raw: string): number | null {
  const n = parseFloat(raw);
  if (!Number.isNaN(n)) return n;
  const words: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
  };
  return words[raw.toLowerCase()] ?? null;
}

/**
 * All Elite College Rentals properties listed on a single /housing-options
 * page.
 * Scrape for all properties associated with a "Bedrooms" bullet (some parking-only lots are listed as well)
 */
async function scrapeEliteCollegeRentals(): Promise<ScrapedProperty[]> {
  console.log('[elitecollegerentals] Fetching listings page…');

  const { data: html } = await axios.get<string>(PROPERTIES_URL, {
    headers: HEADERS,
    timeout: 15_000,
  });

  const $ = cheerio.load(html);
  const results: ScrapedProperty[] = [];

  // Collect every <ul> that has at least one "Bedrooms:" item
  $('ul').each((_: any, ulEl: any) => {
    const items = $(ulEl).find('li');

    let numBeds: number | null = null;
    let numBaths: number | null = null;
    let laundry: string | null = null;
    let parking: string | null = null;
    let porch: boolean | null = null;

    let hasBedroomBullet = false;

    items.each((_i: any, liEl: any) => {
      const text: string = $(liEl).text().trim();
      const parsed = parseBullet(text);
      if (!parsed) return;
      const { key, value } = parsed;

      if (key === 'bedrooms') {
        hasBedroomBullet = true;
        numBeds = parseNumber(value);
      } else if (key === 'bathrooms') {
        numBaths = parseNumber(value);
      } else if (key === 'laundry room access' || key === 'laundry') {
        laundry = value;
      } else if (key === 'parking spots') {
        parking = `${value} spots included`;
      } else if (key === 'private patio' || key === 'private balcony' || key === 'porch') {
        porch = /yes/i.test(value);
      }
    });

    // Skip non-property sections (e.g. parking-only rows)
    if (!hasBedroomBullet) return;

    // Walk backwards from the <ul> to find the nearest preceding <h3> title
    let title = '';
    let description: string | null = null;
    let cursor = $(ulEl).prev();

    while (cursor.length > 0) {
      const tag: string = cursor.prop('tagName')?.toLowerCase() || '';
      if (tag === 'h3' || tag === 'h2') {
        title = cursor.text().trim();
        break;
      }
      if ((tag === 'p' || tag === 'div') && !description) {
        const t = cursor.text().trim();
        if (t) description = t;
      }
      cursor = cursor.prev();
    }

    if (!title) {
      $('h3, h2').each((_j: any, hEl: any) => {
        if ($(hEl).nextAll('ul').first().is(ulEl)) {
          title = $(hEl).text().trim();
        }
      });
    }

    if (!title) return; // if can't identify the property skip

    results.push({
      address: title,
      sourceUrl: PROPERTIES_URL,
      agency: AGENCY,
      numBeds,
      numBaths,
      price: null,
      priceRaw: null,
      utilities: null,
      parking,
      laundry,
      porch,
      internet: null,
      trash: null,
      snowRemoval: null,
      availableDate: null,
      description,
    });
  });

  console.log(`[elitecollegerentals] Done. Scraped ${results.length} properties.`);
  return results;
}

export default scrapeEliteCollegeRentals;
