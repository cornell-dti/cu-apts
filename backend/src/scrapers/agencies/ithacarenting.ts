import axios from 'axios';
import { ScrapedProperty } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio: any = require('cheerio');

const BASE_URL = 'https://ithacarenting.com';
const HOME_URL = `${BASE_URL}/`;
const AGENCY = 'ithacarenting';
const REQUEST_DELAY_MS = 500;

const HEADERS = { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Integer bedroom count from "4 Bedrooms", "2BR", or "Studio". */
function parseBeds(text: string): number | null {
  if (/\bstudio\b/i.test(text)) return 0;
  const m = text.match(/(\d+)\s*(?:bed(?:room)?s?|BR)\b/i);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Bathroom count from "1 Bathroom", "3.5 Baths", etc.
 */
function parseBaths(text: string): number | null {
  const m = text.match(/\b(\d+(?:\.\d+)?)\s+(?:bath(?:room)?s?)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return n >= 0.5 && n <= 10 ? n : null;
}

/**
 * Parses a per-bed price range like "$955 – $1,075" from page text.
 */
function parsePrice(text: string): { price: number | null; priceRaw: string | null } {
  const amountPat = /\$(\d{1,3}(?:,\d{3})?)/;
  const rangePat = new RegExp(`${amountPat.source}\\s*[–—-]\\s*${amountPat.source}`);
  const rangeMatch = text.match(rangePat);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1].replace(',', ''), 10);
    const hi = parseInt(rangeMatch[2].replace(',', ''), 10);
    if (lo > 0 && hi > lo) {
      return { price: lo, priceRaw: `$${lo.toLocaleString()} – $${hi.toLocaleString()} per bed` };
    }
  }
  const singleMatch = text.match(amountPat);
  if (singleMatch) {
    const val = parseInt(singleMatch[1].replace(',', ''), 10);
    if (val > 100) return { price: val, priceRaw: `$${val.toLocaleString()} per bed` };
  }
  return { price: null, priceRaw: null };
}

/**
 * Maps a lease year range ("2026-2027") or semester string ("Fall Semester 2026")
 * to an ISO date (move-in start of that academic year).
 */
function parseLeaseDate(text: string): string | null {
  const yearRangeMatch = text.match(/(\d{4})\s*[-–]\s*\d{4}/);
  if (yearRangeMatch) return `${yearRangeMatch[1]}-08-01`;
  const fallMatch = text.match(/fall\s+(?:semester\s+)?(\d{4})/i);
  if (fallMatch) return `${fallMatch[1]}-08-01`;
  const springMatch = text.match(/spring\s+(?:semester\s+)?(\d{4})/i);
  if (springMatch) return `${springMatch[1]}-01-01`;
  return null;
}

/** Fetches the homepage and returns all unique unit UIDs found in anchor tags. */
async function scrapeUids(): Promise<number[]> {
  const { data: html } = await axios.get<string>(HOME_URL, {
    headers: HEADERS,
    timeout: 15_000,
  });
  const $ = cheerio.load(html);
  const uids = new Set<number>();
  $('a[href*="uid="]').each((_: any, el: any) => {
    const m = ($(el).attr('href') || '').match(/uid=(\d+)/);
    if (m) uids.add(parseInt(m[1], 10));
  });
  return Array.from(uids);
}

async function scrapeUnitDetail(uid: number): Promise<ScrapedProperty> {
  const url = `${BASE_URL}/unit-details/?uid=${uid}`;
  const { data: html } = await axios.get<string>(url, {
    headers: HEADERS,
    timeout: 15_000,
  });
  const $ = cheerio.load(html);

  let bedsHeading = '';
  $('h1, h2, h3, h4').each((_: any, el: any) => {
    if (bedsHeading) return;
    const t: string = $(el).text().trim();
    if (/\d\s*(?:bed(?:room)?s?|BR)\b/i.test(t) || /\bstudio\b/i.test(t)) bedsHeading = t;
  });

  const bodyText: string = $('body').text().replace(/\s+/g, ' ');
  const numBeds = parseBeds(bedsHeading) ?? parseBeds(bodyText);
  const numBaths = parseBaths(bedsHeading) ?? parseBaths(bodyText);

  let address = '';

  const collegetownMatch = bodyText.match(
    /\b(Collegetown\s+\w+)\s*,\s*(\d+\s+[A-Za-z ]+(?:Road|Rd|Avenue|Ave|Street|St|Drive|Dr|Blvd|Boulevard))/i
  );
  if (collegetownMatch) {
    address = `${collegetownMatch[1].trim()}, ${collegetownMatch[2].trim()}`;
  }

  if (!address) {
    const aptMatch = bodyText.match(
      /\b([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)* Apartments?)\s*,\s*(\d+\s+[A-Za-z ]+(?:Road|Rd|Avenue|Ave|Street|St|Drive|Dr|Blvd|Boulevard))/i
    );
    if (aptMatch) address = `${aptMatch[1].trim()}, ${aptMatch[2].trim()}`;
  }

  if (!address) {
    const streetMatch = bodyText.match(
      /\b(\d+\s+[A-Za-z ]+(?:Road|Rd|Avenue|Ave|Street|St|Drive|Dr|Blvd|Boulevard))\s*,\s*Ithaca/i
    );
    if (streetMatch) address = `${streetMatch[1].trim()}, Ithaca`;
  }

  const { price, priceRaw } = parsePrice(bodyText);

  let availableDate: string | null = null;
  const leaseMatch = bodyText.match(/\b(20\d{2})\s*[-–]\s*(20\d{2})\b/);
  if (leaseMatch) availableDate = parseLeaseDate(leaseMatch[0]);
  if (!availableDate) {
    const semMatch = bodyText.match(/(fall|spring)\s+(?:semester\s+)?20\d{2}/i);
    if (semMatch) availableDate = parseLeaseDate(semMatch[0]);
  }

  const includedItems: string[] = [];
  $('li').each((_: any, el: any) => {
    const t: string = $(el).text().trim();
    if (
      t.length < 80 &&
      /\bincluded\b/i.test(t) &&
      /heat|water|trash|utilities?|electricity|electric\b/i.test(t)
    ) {
      includedItems.push(t);
    }
  });
  const utilities: string | null =
    includedItems.length > 0 ? includedItems.slice(0, 4).join(', ') : null;

  let laundry: string | null = null;
  if (
    /in[-\s]?unit\s+(?:washer|laundry)/i.test(bodyText) ||
    /washer(?:\/dryer)?\s+in\s+(?:unit|apartment)/i.test(bodyText)
  ) {
    laundry = 'In Unit';
  } else if (
    /laundry\s+(?:on\s+the|located|in\s+(?:the\s+)?building|facilities|room)/i.test(bodyText) ||
    /on[-\s]?site\s+laundry/i.test(bodyText)
  ) {
    laundry = 'In Building';
  } else if (/laundry/i.test(bodyText)) {
    laundry = 'Available';
  }

  const parking: string | null = /parking.*(?:available|additional|fee)/i.test(bodyText)
    ? 'Available (additional fee)'
    : null;

  const internet: string | null = /(?:wired\s+for\s+)?(?:cable\s+and\s+)?internet/i.test(bodyText)
    ? 'Available'
    : null;

  const trash: string | null = /trash\s+(?:removal\s+)?included/i.test(bodyText)
    ? 'Included'
    : null;

  const porch: boolean | null = /balcon|porch/i.test(bodyText) ? true : null;

  const snowRemoval: string | null = /snow\s+removal/i.test(bodyText) ? 'Available' : null;

  let description: string | null = null;
  $('p').each((_: any, el: any) => {
    if (description) return;
    const t: string = $(el).text().trim();
    if (t.length > 60) description = t;
  });

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

async function scrapeIthacarenting(): Promise<ScrapedProperty[]> {
  console.log('[ithacarenting] Fetching unit list from homepage…');
  const uids = await scrapeUids();
  console.log(`[ithacarenting] Found ${uids.length} unit UIDs`);

  const results: ScrapedProperty[] = [];
  const promises: Promise<void>[] = [];

  uids.forEach((uid, i) => {
    promises.push(
      sleep(REQUEST_DELAY_MS * i).then(() =>
        scrapeUnitDetail(uid)
          .then((prop) => {
            results.push(prop);
          })
          .catch((err) =>
            console.error(`[ithacarenting] Failed to scrape uid=${uid}:`, err?.message ?? err)
          )
      )
    );
  });

  await Promise.all(promises);
  console.log(`[ithacarenting] Done. Scraped ${results.length}/${uids.length} units.`);
  return results;
}

export default scrapeIthacarenting;
