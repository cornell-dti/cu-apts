import axios from 'axios';
import { ScrapedProperty } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio: any = require('cheerio');

const BASE_URL = 'https://www.urbanithaca.com';
const AGENCY = 'urbanithaca';
const REQUEST_DELAY_MS = 600;

const SCAN_MIN = 1;
const SCAN_MAX = 120;
const BATCH_SIZE = 5;

const HEADERS = { 'User-Agent': 'CUApts-scraper/1.0 (+https://cuapts.org)' };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseBeds(text: string): number | null {
  const m = text.match(/\b(\d+)\s+bed(?:room)?s?\b/i);
  return m ? parseInt(m[1], 10) : null;
}

function parseBaths(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s+(?:baths?|bathrooms?)/i);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Scrapes a single Urban Ithaca property detail page.
 * Returns null if the page doesn't represent a valid residential listing
 * (e.g. placeholder "coming soon" pages or parking-only listings).
 */
async function scrapeById(id: number): Promise<ScrapedProperty | null> {
  const url = `${BASE_URL}/detailed-view-more/${id}/1/1`;
  const { data: html } = await axios.get<string>(url, {
    headers: HEADERS,
    timeout: 15_000,
  });

  const $ = cheerio.load(html);

  const rawBodyText: string = $('body').text();
  const bodyText: string = rawBodyText.replace(/\s+/g, ' ');

  // skip non listing pages
  const h4Text: string = $('h4').first().text().trim();
  const h4Match = h4Text.match(/^A\s+.+\s+(?:bedroom|studio)\s+apartment\s+at\s+(.+)$/i);
  if (!h4Match) return null;

  const address: string = h4Match[1].trim();
  if (!address || address.length < 3) return null;

  const numBeds = parseBeds(h4Text);

  const numBaths = parseBaths(bodyText);

  const price: number | null = null;
  const priceRaw: string | null = null;

  const tenantPaysMatch = bodyText.match(/Tenant\s+pays\s*:\s*(.+?)(?=Landlord|Contact|$)/i);
  const utilities: string | null = tenantPaysMatch
    ? `Tenant pays: ${tenantPaysMatch[1].trim()}`
    : null;

  let laundry: string | null = null;
  if (/in[-\s]?house\s+washer|in[-\s]?unit\s+(?:washer|laundry)|washer\/dryer/i.test(bodyText)) {
    laundry = 'In Unit';
  } else if (/laundry/i.test(bodyText)) {
    laundry = 'In Building';
  }

  const parking: string | null = /parking\s+available/i.test(bodyText)
    ? 'Available (additional cost)'
    : null;

  const porch: boolean | null = /\bporch\b/i.test(bodyText) ? true : null;

  const internet: string | null = /internet/i.test(bodyText) ? 'Available (tenant pays)' : null;

  let trash: string | null = null;
  if (/tenant\s+pays[^.]*trash/i.test(bodyText)) {
    trash = 'Tenant';
  } else if (/trash\s+(?:removal\s+)?included/i.test(bodyText)) {
    trash = 'Included';
  }

  const snowRemoval: string | null = /snow\s+removal/i.test(bodyText) ? 'Available' : null;

  const availableDate: string | null = null;

  let description: string | null = null;
  $('p').each((_: any, el: any) => {
    if (description) return;
    const text: string = $(el).text().trim();
    if (text.length > 50) description = text;
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

async function scrapeUrbanIthaca(): Promise<ScrapedProperty[]> {
  const ids = Array.from({ length: SCAN_MAX - SCAN_MIN + 1 }, (_, i) => SCAN_MIN + i);
  const results: ScrapedProperty[] = [];

  console.log(`[urbanithaca] Scanning property IDs ${SCAN_MIN}–${SCAN_MAX}…`);

  const batches: number[][] = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    batches.push(ids.slice(i, i + BATCH_SIZE));
  }

  await batches.reduce(
    (chain, batch, batchIndex) =>
      chain.then(() =>
        Promise.all(
          batch.map((id) =>
            scrapeById(id)
              .then((prop) => {
                if (prop) results.push(prop);
              })
              .catch((err: any) => {
                if (err?.response?.status !== 404) {
                  console.error(`[urbanithaca] Failed to scrape ID ${id}:`, err?.message ?? err);
                }
              })
          )
        ).then(() => (batchIndex < batches.length - 1 ? sleep(REQUEST_DELAY_MS) : undefined))
      ),
    Promise.resolve()
  );

  console.log(`[urbanithaca] Done. Scraped ${results.length} properties.`);
  return results;
}

export default scrapeUrbanIthaca;
