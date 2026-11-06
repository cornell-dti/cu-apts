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

const toMonthIndex = ({ year, month }: YearMonth): number => year * 12 + month;

/** Calendar months from `from` to `to`. Negative when `to` is earlier. Same as the backend's monthsBetween. */
export const monthsBetween = (from: YearMonth, to: YearMonth): number =>
  toMonthIndex(to) - toMonthIndex(from);
