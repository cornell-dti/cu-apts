import axios from 'axios';
import { ScrapedProperty } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio: any = require('cheerio');

const BASE_URL = 'https://pjapts.com';
const PROPERTIES_URL = `${BASE_URL}/properties/`;
const AGENCY = 'pjapts';

const REQUEST_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches the /properties/ listing page and returns every
 * property detail-page URL found on it.
 *
 * The listings page is a WordPress page that wraps each property in a
 * Visual Composer image+link block.  Each link href looks like:
 *   https://pjapts.com/student-rental-properties-ithaca/211-williams-street/
 * which redirects to:
 *   https://pjapts.com/property/211-williams-street/
 * Collects the original href; axios follows the redirect automatically
 * when we fetch the detail page.
 */
async function scrapePropertyUrls(): Promise<string[]> {
  const { data: html } = await axios.get<string>(PROPERTIES_URL, {
    headers: { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' },
    timeout: 15_000,
  });

  const $ = cheerio.load(html);
  const urls: string[] = [];

  $('a[href*="pjapts.com"]').each((_: any, el: any) => {
    const href: string = $(el).attr('href') || '';
    if (href.includes('/student-rental-properties-ithaca/') || href.includes('/property/')) {
      if (!urls.includes(href)) {
        urls.push(href);
      }
    }
  });

  return urls;
}

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

/** "June 1, 2026" or "Available June 1, 2026" → "2026-06-01", else null. */
function parseAvailableDate(raw: string): string | null {
  const cleaned = raw.replace(/^available\s+/i, '').trim();
  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
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
 * Extracts a dollar amount from the pricing string.
 * Returns null when the site says "Please contact us" or similar.
 * Examples:
 *   "$1,200/month per room" → 1200
 *   "Please contact us…"   → null
 */
function parsePrice(raw: string): number | null {
  if (/contact/i.test(raw)) return null;
  const match = raw.match(/\$([0-9,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

/**
 * Fetches a single property detail page and extracts all structured fields.
 *
 * The detail page is a standard WordPress post with a description paragraph
 * followed by the following list of information:
 *    Available June 1, 2026
 *    Bedrooms: 7
 *    Bathrooms: 4
 *    Utilities: Tenant pays electric lights and outlets only
 *    Parking: Available
 *    Laundry: In Apartment
 *    Porch: Yes
 *    Internet: Tenant/Landlord, super-fast 1 Gbps; multiple access points
 *    Trash: Tenant/Landlord
 *    Snow Removal: Free
 *    Pricing: Please contact us for more information
 */
async function scrapePropertyDetail(url: string): Promise<ScrapedProperty> {
  const { data: html } = await axios.get<string>(url, {
    headers: { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' },
    timeout: 15_000,
    maxRedirects: 5,
  });

  const $ = cheerio.load(html);

  // h1 holds the display name, e.g. "211 Williams Street"
  const address: string = $('h1.page-title, h1').first().text().trim();

  // The description is the first <p> in the main content column
  const description: string | null =
    $('.entry-content p, .wpb_text_column p').first().text().trim() || null;

  let numBeds: number | null = null;
  let numBaths: number | null = null;
  let priceRaw: string | null = null;
  let utilities: string | null = null;
  let parking: string | null = null;
  let laundry: string | null = null;
  let porch: boolean | null = null;
  let internet: string | null = null;
  let trash: string | null = null;
  let snowRemoval: string | null = null;
  let availableDate: string | null = null;

  $('li').each((_: any, el: any) => {
    const text: string = $(el).text().trim();
    if (!text) return;

    if (/^available\s+/i.test(text)) {
      availableDate = parseAvailableDate(text);
      return;
    }

    const parsed = parseBullet(text);
    if (!parsed) return;
    const { key, value } = parsed;

    if (key === 'bedrooms') numBeds = parseNumber(value);
    else if (key === 'bathrooms') numBaths = parseNumber(value);
    else if (key === 'pricing') priceRaw = value;
    else if (key === 'utilities') utilities = value;
    else if (key === 'parking') parking = value;
    else if (key === 'laundry') laundry = value;
    else if (key === 'porch') porch = /yes/i.test(value);
    else if (key === 'internet') internet = value;
    else if (key === 'trash') trash = value;
    else if (key === 'snow removal') snowRemoval = value;
  });

  // fallback price extraction
  if (!priceRaw) {
    $('*')
      .filter((_: any, el: any) => /pricing:/i.test($(el).text()))
      .each((_: any, el: any) => {
        if (priceRaw) return; // already found
        const full: string = $(el).text().trim();
        const match = full.match(/pricing:\s*(.+)/i);
        if (match) priceRaw = match[1].split('\n')[0].trim();
      });
  }

  const price = priceRaw ? parsePrice(priceRaw) : null;

  return {
    address,
    sourceUrl: url,
    agency: AGENCY,
    numBeds,
    numBaths,
    price,
    priceRaw,
    utilities,
    parking,
    laundry,
    porch,
    internet,
    trash,
    snowRemoval,
    availableDate,
    description,
  };
}

/**
 * Scrapes the full PJ Apartments property portfolio.
 *
 * Properties that error out individually are skipped (with a console.error)
 * rather than aborting the whole run.
 */
async function scrapePJApts(): Promise<ScrapedProperty[]> {
  console.log('[pjapts] Fetching property list…');
  const urls = await scrapePropertyUrls();
  console.log(`[pjapts] Found ${urls.length} property URLs`);

  const promises = [];
  const results: ScrapedProperty[] = [];

  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[i];
    try {
      console.log(`[pjapts] Scraping (${i + 1}/${urls.length}): ${url}`);
      promises.push(
        sleep(REQUEST_DELAY_MS).then(() =>
          scrapePropertyDetail(url)
            .then((property) => {
              results.push(property);
            })
            .catch((err) => {
              console.error(`[pjapts] Failed to scrape ${url}:`, err);
            })
        )
      );
    } catch (err) {
      console.error(`[pjapts] Failed to scrape ${url}:`, err);
    }
  }

  await Promise.all(promises);

  console.log(`[pjapts] Done. Scraped ${results.length}/${urls.length} properties.`);
  return results;
}

export default scrapePJApts;
