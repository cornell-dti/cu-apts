import { MIN_LEASE_REVIEWS_FOR_AVERAGE } from '../../common/constants/lease';
import {
  computeLeaseSignedStats,
  monthsBetween,
  parseYearMonth,
  validateLeaseDates,
} from './leaseDates';

const NOW = new Date(Date.UTC(2026, 9, 15)); // October 2026

describe('parseYearMonth', () => {
  it('parses valid YYYY-MM', () => {
    expect(parseYearMonth('2025-09')).toEqual({ year: 2025, month: 9 });
    expect(parseYearMonth('2026-12')).toEqual({ year: 2026, month: 12 });
  });

  it.each(['2025-13', '2025-00', '2025-9', '25-09', 'abc', '', '2025-09-01', ' 2025-09'])(
    'rejects malformed string %p',
    (value) => {
      expect(parseYearMonth(value)).toBeNull();
    }
  );

  it('rejects non-strings and out-of-range years', () => {
    expect(parseYearMonth(2025)).toBeNull();
    expect(parseYearMonth(null)).toBeNull();
    expect(parseYearMonth(undefined)).toBeNull();
    expect(parseYearMonth('1999-12')).toBeNull();
    expect(parseYearMonth('2101-01')).toBeNull();
  });
});

describe('monthsBetween', () => {
  it('counts calendar months: Sept 2025 -> June 2026 = 9', () => {
    expect(monthsBetween({ year: 2025, month: 9 }, { year: 2026, month: 6 })).toBe(9);
  });

  it('same month is 0', () => {
    expect(monthsBetween({ year: 2025, month: 9 }, { year: 2025, month: 9 })).toBe(0);
  });

  it('crosses a year boundary: Dec -> Jan = 1', () => {
    expect(monthsBetween({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBe(1);
  });

  it('handles multi-year gaps', () => {
    expect(monthsBetween({ year: 2024, month: 1 }, { year: 2026, month: 1 })).toBe(24);
  });

  it('is negative when signed is after start', () => {
    expect(monthsBetween({ year: 2026, month: 6 }, { year: 2025, month: 9 })).toBe(-9);
  });
});

describe('validateLeaseDates', () => {
  it('accepts neither date', () => {
    expect(validateLeaseDates({}, NOW)).toBeNull();
  });

  it('treats null and empty string as absent', () => {
    expect(validateLeaseDates({ leaseSigned: null, leaseStart: '' }, NOW)).toBeNull();
  });

  it('accepts only leaseSigned', () => {
    expect(validateLeaseDates({ leaseSigned: '2026-03' }, NOW)).toBeNull();
  });

  it('accepts only leaseStart', () => {
    expect(validateLeaseDates({ leaseStart: '2027-06' }, NOW)).toBeNull();
  });

  it('accepts both when signed is before start', () => {
    expect(validateLeaseDates({ leaseSigned: '2025-09', leaseStart: '2026-06' }, NOW)).toBeNull();
  });

  it('accepts signed equal to start', () => {
    expect(validateLeaseDates({ leaseSigned: '2026-06', leaseStart: '2026-06' }, NOW)).toBeNull();
  });

  it('rejects signed after start', () => {
    expect(validateLeaseDates({ leaseSigned: '2026-07', leaseStart: '2026-06' }, NOW)).toMatch(
      /must not be after leaseStart/
    );
  });

  it('rejects malformed values with a field-specific message', () => {
    expect(validateLeaseDates({ leaseSigned: '2025-13' }, NOW)).toMatch(/leaseSigned.*YYYY-MM/);
    expect(validateLeaseDates({ leaseStart: 'soon' }, NOW)).toMatch(/leaseStart.*YYYY-MM/);
    expect(validateLeaseDates({ leaseSigned: 202509 }, NOW)).toMatch(/leaseSigned.*YYYY-MM/);
  });

  it('allows leaseSigned in the current month but not after it', () => {
    expect(validateLeaseDates({ leaseSigned: '2026-10' }, NOW)).toBeNull();
    expect(validateLeaseDates({ leaseSigned: '2026-11' }, NOW)).toMatch(/current month/);
  });

  it('allows leaseStart in the future', () => {
    expect(validateLeaseDates({ leaseStart: '2030-08' }, NOW)).toBeNull();
  });

  it('rejects a future leaseSigned even if start is later', () => {
    expect(validateLeaseDates({ leaseSigned: '2027-01', leaseStart: '2027-08' }, NOW)).toMatch(
      /current month/
    );
  });
});

describe('computeLeaseSignedStats', () => {
  // 9-month gap (Sept 2025 -> June 2026)
  const nine = { leaseSigned: '2025-09', leaseStart: '2026-06' };
  const withGap = (gap: number) => ({
    leaseSigned: '2025-01',
    leaseStart: `${2025 + Math.floor(gap / 12)}-${String((gap % 12) + 1).padStart(2, '0')}`,
  });

  it('returns the empty state for no reviews', () => {
    expect(computeLeaseSignedStats([])).toEqual({ avgMonthsBeforeStart: null, sampleSize: 0 });
  });

  it('returns the empty state below the minimum, reporting the sample size', () => {
    const reviews = Array(MIN_LEASE_REVIEWS_FOR_AVERAGE - 1).fill(nine);
    expect(computeLeaseSignedStats(reviews)).toEqual({
      avgMonthsBeforeStart: null,
      sampleSize: MIN_LEASE_REVIEWS_FOR_AVERAGE - 1,
    });
  });

  it('returns the average at exactly the minimum', () => {
    const reviews = Array(MIN_LEASE_REVIEWS_FOR_AVERAGE).fill(nine);
    expect(computeLeaseSignedStats(reviews)).toEqual({
      avgMonthsBeforeStart: 9,
      sampleSize: MIN_LEASE_REVIEWS_FOR_AVERAGE,
    });
  });

  it('includes same-month (0 month) reviews in the average', () => {
    const zero = { leaseSigned: '2026-01', leaseStart: '2026-01' };
    const stats = computeLeaseSignedStats([zero, zero, withGap(3)]);
    expect(stats).toEqual({ avgMonthsBeforeStart: 1, sampleSize: 3 });
  });

  it('rounds to the nearest whole month', () => {
    // gaps 8, 8, 9 -> 8.33 -> 8
    expect(computeLeaseSignedStats([withGap(8), withGap(8), withGap(9)]).avgMonthsBeforeStart).toBe(
      8
    );
    // gaps 8, 9, 9 -> 8.67 -> 9
    expect(computeLeaseSignedStats([withGap(8), withGap(9), withGap(9)]).avgMonthsBeforeStart).toBe(
      9
    );
    // gaps 8, 9, 8, 9 -> 8.5 -> 9 (halves round up)
    const four = [withGap(8), withGap(9), withGap(8), withGap(9)];
    expect(computeLeaseSignedStats(four).avgMonthsBeforeStart).toBe(9);
  });

  it('skips reviews with only one date and does not count them', () => {
    const reviews = [
      nine,
      nine,
      nine,
      { leaseSigned: '2025-01' },
      { leaseStart: '2026-01' },
      { leaseSigned: '2025-01', leaseStart: null },
    ];
    expect(computeLeaseSignedStats(reviews)).toEqual({ avgMonthsBeforeStart: 9, sampleSize: 3 });
  });

  it('skips old reviews with no date fields without crashing', () => {
    const reviews = [nine, nine, nine, {}, {}, { leaseSigned: undefined }];
    expect(computeLeaseSignedStats(reviews)).toEqual({ avgMonthsBeforeStart: 9, sampleSize: 3 });
  });

  it('returns the empty state when no review has dates', () => {
    expect(computeLeaseSignedStats([{}, {}, {}, {}])).toEqual({
      avgMonthsBeforeStart: null,
      sampleSize: 0,
    });
  });

  it('skips malformed and reversed dates rather than throwing', () => {
    const reviews = [
      nine,
      nine,
      nine,
      { leaseSigned: 'garbage', leaseStart: '2026-06' },
      { leaseSigned: '2026-06', leaseStart: '2025-09' },
    ];
    expect(computeLeaseSignedStats(reviews)).toEqual({ avgMonthsBeforeStart: 9, sampleSize: 3 });
  });
});
