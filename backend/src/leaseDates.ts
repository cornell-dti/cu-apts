import {
  LEASE_DATE_REGEX,
  LEASE_DATE_MIN_YEAR,
  LEASE_DATE_MAX_YEAR,
  MIN_LEASE_REVIEWS_FOR_AVERAGE,
} from '../../common/constants/lease';
import type { LeaseSignedStats } from '../../common/types/db-types';

export type YearMonth = { readonly year: number; readonly month: number };

type LeaseDateInput = { readonly leaseSigned?: unknown; readonly leaseStart?: unknown };

/** null, undefined and "" all mean "not provided". */
export const isLeaseDateAbsent = (value: unknown): boolean => value == null || value === '';

/** Parses "YYYY-MM" into {year, month}; returns null if malformed or out of the allowed years. */
export const parseYearMonth = (value: unknown): YearMonth | null => {
  if (typeof value !== 'string') return null;
  const match = LEASE_DATE_REGEX.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < LEASE_DATE_MIN_YEAR || year > LEASE_DATE_MAX_YEAR) return null;
  return { year, month };
};

const toMonthIndex = ({ year, month }: YearMonth): number => year * 12 + month;

/**
 * Calendar-month difference from signing to lease start:
 * (startYear*12 + startMonth) - (signedYear*12 + signedMonth).
 * Sept 2025 -> June 2026 = 9; the same month = 0; negative if signed is after start.
 */
export const monthsBetween = (signed: YearMonth, start: YearMonth): number =>
  toMonthIndex(start) - toMonthIndex(signed);

/**
 * Validates the optional lease dates on a review body.
 * Returns an error message for the client, or null if valid.
 * Rules: each present date is "YYYY-MM"; leaseSigned is not after the current month
 * (leaseStart may be in the future); if both are present, signed is not after start.
 * `now` is a parameter so tests don't depend on the clock.
 */
export const validateLeaseDates = (
  input: LeaseDateInput,
  now: Date = new Date()
): string | null => {
  const signedAbsent = isLeaseDateAbsent(input.leaseSigned);
  const startAbsent = isLeaseDateAbsent(input.leaseStart);

  const signed = signedAbsent ? null : parseYearMonth(input.leaseSigned);
  const start = startAbsent ? null : parseYearMonth(input.leaseStart);

  if (!signedAbsent && !signed) {
    return 'leaseSigned must be a month in YYYY-MM format';
  }
  if (!startAbsent && !start) {
    return 'leaseStart must be a month in YYYY-MM format';
  }

  if (signed) {
    const current = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
    if (toMonthIndex(signed) > toMonthIndex(current)) {
      return 'leaseSigned cannot be after the current month';
    }
  }

  if (signed && start && monthsBetween(signed, start) < 0) {
    return 'leaseSigned must not be after leaseStart';
  }

  return null;
};

/**
 * Average months between signing and lease start across reviews that have both dates.
 * Reviews with a missing, malformed or reversed date (including all pre-feature reviews)
 * are skipped. Below MIN_LEASE_REVIEWS_FOR_AVERAGE qualifying reviews the average is null
 * (empty state). The average is rounded once, to the nearest month (halves round up).
 */
export const computeLeaseSignedStats = (reviews: readonly LeaseDateInput[]): LeaseSignedStats => {
  const gaps: number[] = [];
  reviews.forEach((review) => {
    const signed = parseYearMonth(review.leaseSigned);
    const start = parseYearMonth(review.leaseStart);
    if (!signed || !start) return;
    const gap = monthsBetween(signed, start);
    if (gap >= 0) gaps.push(gap);
  });

  const sampleSize = gaps.length;
  if (sampleSize < MIN_LEASE_REVIEWS_FOR_AVERAGE) {
    return { avgMonthsBeforeStart: null, sampleSize };
  }
  const total = gaps.reduce((acc, gap) => acc + gap, 0);
  return { avgMonthsBeforeStart: Math.round(total / sampleSize), sampleSize };
};
