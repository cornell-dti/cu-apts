/**
 * Lease date helpers for the review form.
 *
 * The source of truth for these rules is backend/src/leaseDates.ts and common/constants/lease.ts.
 * The frontend build (create-react-app) cannot import files from outside src/, so the constants
 * and month math the form needs are copied here. Keep them in sync with those files. The backend
 * validates every request too, so a mismatch shows up as a 400 message in the form, not bad data.
 */

// Same values as common/constants/lease.ts.
export const LEASE_DATE_MIN_YEAR = 2000;
export const LEASE_DATE_MAX_YEAR = 2100;
export const MAX_LEASE_START_YEARS_AHEAD = 3;
export const MAX_LEASE_GAP_MONTHS = 36;

// Same format as LEASE_DATE_REGEX in common/constants/lease.ts.
const LEASE_DATE_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** A calendar month. `month` is 1-12. */
export type YearMonth = { readonly year: number; readonly month: number };

/** Parses "YYYY-MM" into {year, month}. Returns null for missing, malformed or out-of-range values. */
export const parseYearMonth = (value: string | null | undefined): YearMonth | null => {
  if (!value) return null;
  const match = LEASE_DATE_REGEX.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < LEASE_DATE_MIN_YEAR || year > LEASE_DATE_MAX_YEAR) return null;
  return { year, month };
};

/** Formats a month as "YYYY-MM", the format stored in Review.leaseSigned and Review.leaseStart. */
export const formatYearMonth = ({ year, month }: YearMonth): string =>
  `${year}-${String(month).padStart(2, '0')}`;

const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

/**
 * Formats a "YYYY-MM" lease month for display, e.g. "2024-10" -> "OCT 2024".
 * Reads the year and month straight from the string. Never go through new Date(): "2024-10" parses
 * as UTC midnight, which is the previous month in US timezones.
 * Returns null for missing or malformed values, so callers can hide the label.
 */
export const formatLeaseSigned = (value: string | null | undefined): string | null => {
  const parsed = parseYearMonth(value);
  return parsed ? `${MONTH_ABBREVIATIONS[parsed.month - 1]} ${parsed.year}` : null;
};

const toMonthIndex = ({ year, month }: YearMonth): number => year * 12 + month;

/** Calendar months from `from` to `to`. Negative when `to` is earlier. Same as the backend's monthsBetween. */
export const monthsBetween = (from: YearMonth, to: YearMonth): number =>
  toMonthIndex(to) - toMonthIndex(from);

/** The two lease date fields on the review form. */
export type LeaseDateField = 'signed' | 'start';

type LeaseDateValues = {
  /** The chosen leaseSigned month as "YYYY-MM", if any. */
  readonly signed?: string | null;
  /** The chosen leaseStart month as "YYYY-MM", if any. */
  readonly start?: string | null;
};

/**
 * Whether a month cannot be chosen for a lease date field, given the other field's value.
 * Mirrors validateLeaseDates in backend/src/leaseDates.ts, but works month by month and uses the
 * user's local current month. `now` is a parameter so tests don't depend on the clock.
 *
 * - Signed: disabled after the current month, or after the chosen start month.
 * - Start: disabled before the chosen signed month, more than MAX_LEASE_START_YEARS_AHEAD years after
 *   the current month, or more than MAX_LEASE_GAP_MONTHS after the chosen signed month.
 */
export const isLeaseMonthDisabled = (
  field: LeaseDateField,
  year: number,
  month: number,
  { signed, start }: LeaseDateValues,
  now: Date = new Date()
): boolean => {
  if (year < LEASE_DATE_MIN_YEAR || year > LEASE_DATE_MAX_YEAR) return true;

  const candidate = { year, month };
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const signedMonth = parseYearMonth(signed);
  const startMonth = parseYearMonth(start);

  if (field === 'signed') {
    if (monthsBetween(current, candidate) > 0) return true;
    return startMonth !== null && monthsBetween(startMonth, candidate) > 0;
  }

  if (monthsBetween(current, candidate) > MAX_LEASE_START_YEARS_AHEAD * 12) return true;
  if (signedMonth === null) return false;
  const gap = monthsBetween(signedMonth, candidate);
  return gap < 0 || gap > MAX_LEASE_GAP_MONTHS;
};
