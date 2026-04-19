import axios from 'axios';
import { ScrapedProperty } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio: any = require('cheerio');

const BASE_URL = 'https://www.lambrourealestate.com';
const AGENCY = 'lambrourealestate';
const REQUEST_DELAY_MS = 500;

const HEADERS = { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' };

/**
 * Root-level paths that are navigation/section pages, not property detail pages.
 * Used to filter out non-property links when parsing collection listing pages.
 */
const NAV_PATHS = new Set([
  '/',
  '/houses',
  '/apartments',
  '/downtown',
  '/parking',
  '/info',
  '/testimonials',
  '/contact-us',
  '/our-team',
  '/about',
]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Strips HTML tags and normalises whitespace.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts bedroom count from Squarespace category array.
 * Categories look like ["3 Bedrooms"] or ["3 Bedrooms", "4 Bedrooms"].
 * When a building has multiple unit sizes return the smallest count (in future implementation should assign to different units within the property).
 */
function bedsFromCategories(categories: string[]): number | null {
  const counts = categories
    .map((c) => {
      const m = c.match(/^(\d+)\s+Bedrooms?$/i);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n): n is number => n !== null);
  return counts.length > 0 ? Math.min(...counts) : null;
}

// Extract bathroom count
function bathsFromText(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s+(?:Baths?|Bathrooms?)/i);
  return m ? parseFloat(m[1]) : null;
}

// Extract bedroom count from a house title like "103 Eddy Street (5 Bed)"
function bedsFromTitle(title: string): number | null {
  const combined = title.match(/\((\d+)\+(\d+)\s+Bed\)/i);
  if (combined) return parseInt(combined[1], 10) + parseInt(combined[2], 10);
  const simple = title.match(/\((\d+)\s+Bed\)/i);
  return simple ? parseInt(simple[1], 10) : null;
}

// Strip the "(X Bed)" suffix from a house title to yield the street address.
function addressFromTitle(title: string): string {
  return title.replace(/\s*\(\d+(?:\+\d+)?\s+Bed\)/i, '').trim();
}

// Parse availability text
function parseAvailableDate(text: string): string | null {
  const yearRange = text.match(/available\s+for\s+(\d{4})\s*[-–]\s*\d{4}\s+school\s+year/i);
  if (yearRange) return `${yearRange[1]}-08-01`;

  const specific = text.match(/available\s+(\w+ \d{1,2},?\s*\d{4})/i);
  if (specific) {
    const d = new Date(specific[1]);
    if (!Number.isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Fetches a Squarespace collection listing page (e.g. /houses or /downtown)
 * and returns all property detail URLs found in anchor tags.
 *
 * Navigation links and apartment URLs are excluded; only root-level paths
 * that look like property slugs (e.g. /103-eddy-street) are returned.
 */
async function scrapeCollectionUrls(collectionPath: string): Promise<string[]> {
  const { data: html } = await axios.get<string>(`${BASE_URL}${collectionPath}`, {
    headers: HEADERS,
    timeout: 15_000,
  });

  const $ = cheerio.load(html);
  const urls: string[] = [];

  $('a[href]').each((_: any, el: any) => {
    const href: string = ($(el).attr('href') || '').split('?')[0].split('#')[0];

    if (
      href.startsWith('/') &&
      !href.startsWith('/apartments/') &&
      !NAV_PATHS.has(href) &&
      href.length > 1 // exclude bare "/"
    ) {
      const full = BASE_URL + href;
      if (!urls.includes(full)) urls.push(full);
    }
  });

  return urls;
}

/**
 * Fetches a house or downtown property detail page via the Squarespace JSON API.
 */
async function scrapeHouseDetail(url: string): Promise<ScrapedProperty> {
  const { data } = await axios.get<any>(`${url}?format=json`, {
    headers: HEADERS,
    timeout: 15_000,
    maxRedirects: 5,
  });

  const col = data.collection || {};
  const title: string = col.title || '';
  const descField: string = col.description || '';

  const address = addressFromTitle(title) || title;
  const numBeds = bedsFromTitle(title);
  const numBaths = bathsFromText(descField);

  // Strip metadata prefix to get plain description
  const descClean =
    descField
      .replace(/^\d+\s+Bedrooms?\s*[•·]\s*\d+(?:\.\d+)?\s+(?:Baths?|Bathrooms?)[,/]\s*/i, '')
      .trim() || null;

  // Scan mainContent HTML for availability text
  let availableDate: string | null = null;
  if (data.mainContent) {
    const $ = cheerio.load(data.mainContent as string);
    $('*').each((_: any, el: any) => {
      if (availableDate) return;
      const text: string = $(el).text().trim();
      if (/available/i.test(text)) {
        const parsed = parseAvailableDate(text);
        if (parsed) availableDate = parsed;
      }
    });
  }

  return {
    address,
    sourceUrl: url,
    agency: AGENCY,
    numBeds,
    numBaths,
    price: null,
    priceRaw: null,
    utilities: null,
    parking: null,
    laundry: null,
    porch: null,
    internet: null,
    trash: null,
    snowRemoval: null,
    availableDate,
    description: descClean,
  };
}

/**
 * Fetches all apartment listings from the Squarespace store collection JSON.
 *  /apartments?format=json endpoint returns an `items` array with fields already parsed/cleaned
 */
async function scrapeApartments(): Promise<ScrapedProperty[]> {
  const { data } = await axios.get<any>(`${BASE_URL}/apartments?format=json`, {
    headers: HEADERS,
    timeout: 15_000,
  });

  const items: any[] = data.items || [];

  return items
    .filter((item: any) => item.urlId) // skip malformed entries
    .map((item: any) => {
      const title: string = item.title || '';
      const categories: string[] = item.categories || [];
      const excerptHtml: string = item.excerpt || item.body || '';
      const description = excerptHtml ? stripHtml(excerptHtml) : null;

      const numBeds = bedsFromCategories(categories);
      const numBaths = description ? bathsFromText(description) : null;

      return {
        address: title,
        sourceUrl: `${BASE_URL}/apartments/${item.urlId}`,
        agency: AGENCY,
        numBeds,
        numBaths,
        price: null,
        priceRaw: null,
        utilities: null,
        parking: null,
        laundry: null,
        porch: null,
        internet: null,
        trash: null,
        snowRemoval: null,
        availableDate: null,
        description,
      } as ScrapedProperty;
    });
}

/**
 * Scrapes the full Lambrou Real Estate portfolio:
 *
 * Properties that error out individually are skipped (with a console.error)
 * rather than aborting the whole run.
 */
async function scrapeLambrouRealEstate(): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];

  console.log('[lambrourealestate] Fetching apartments…');
  try {
    const apts = await scrapeApartments();
    console.log(`[lambrourealestate] Found ${apts.length} apartment listings`);
    results.push(...apts);
  } catch (err) {
    console.error('[lambrourealestate] Failed to scrape apartments:', err);
  }

  const collectionPaths = ['/houses', '/downtown'];

  const allPropertyUrls: string[] = await collectionPaths.reduce(async (accPromise, path) => {
    const acc = await accPromise;
    console.log(`[lambrourealestate] Fetching property URLs from ${path}…`);
    try {
      const urls = await scrapeCollectionUrls(path);
      console.log(`[lambrourealestate] Found ${urls.length} property URLs in ${path}`);
      urls.forEach((url) => {
        if (!acc.includes(url)) acc.push(url);
      });
    } catch (err) {
      console.error(`[lambrourealestate] Failed to fetch ${path} URLs:`, err);
    }
    await sleep(REQUEST_DELAY_MS);
    return acc;
  }, Promise.resolve([] as string[]));

  console.log(
    `[lambrourealestate] Scraping ${allPropertyUrls.length} unique house/downtown pages…`
  );

  const promises: Promise<void>[] = [];
  for (let i = 0; i < allPropertyUrls.length; i += 1) {
    const url = allPropertyUrls[i];
    promises.push(
      sleep(REQUEST_DELAY_MS * i).then(() =>
        scrapeHouseDetail(url)
          .then((prop) => {
            console.log(`[lambrourealestate] Scraped: ${prop.address}`);
            results.push(prop);
          })
          .catch((err) => {
            console.error(`[lambrourealestate] Failed to scrape ${url}:`, err);
          })
      )
    );
  }

  await Promise.all(promises);

  console.log(`[lambrourealestate] Done. Total: ${results.length} properties.`);
  return results;
}

export default scrapeLambrouRealEstate;
