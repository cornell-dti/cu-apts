import { ScrapedProperty } from './types';
import scrapePJApts from './agencies/pjapts';
import scrapeLambrouRealEstate from './agencies/lambrourealestate';
import scrapeEliteCollegeRentals from './agencies/elitecollegerentals';

/**
 * Registry of all supported agencies.
 * Add new agencies here as you build them out.
 */
const AGENCY_SCRAPERS: Record<string, () => Promise<ScrapedProperty[]>> = {
  pjapts: scrapePJApts,
  lambrourealestate: scrapeLambrouRealEstate,
  elitecollegerentals: scrapeEliteCollegeRentals,
  // travishyde: scrapeTravisHyde,
};

export const SUPPORTED_AGENCIES = Object.keys(AGENCY_SCRAPERS);

export type OrchestratorOptions = {
  agencies: string[] | 'all';
};

export type OrchestratorResult = {
  results: ScrapedProperty[];
  // Agencies that threw an unrecoverable error
  errors: { agency: string; message: string }[];
};

/**
 * Runs the requested scrapers in parallel.
 * Per-agency errors are caught and surfaced in `errors` rather than
 * propagating
 */
export async function runScrapers(options: OrchestratorOptions): Promise<OrchestratorResult> {
  const requested = options.agencies === 'all' ? SUPPORTED_AGENCIES : options.agencies;

  const unknown = requested.filter((a) => !AGENCY_SCRAPERS[a]);
  if (unknown.length) {
    throw new Error(`Unknown agencies: ${unknown.join(', ')}`);
  }

  const settled = await Promise.allSettled(requested.map((agency) => AGENCY_SCRAPERS[agency]()));

  const results: ScrapedProperty[] = [];
  const errors: { agency: string; message: string }[] = [];

  settled.forEach((outcome, i) => {
    const agency = requested[i];
    if (outcome.status === 'fulfilled') {
      results.push(...outcome.value);
    } else {
      const message =
        outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      errors.push({ agency, message });
      console.error(`[orchestrator] Agency "${agency}" failed: ${message}`);
    }
  });

  return { results, errors };
}
