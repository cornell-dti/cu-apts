import {
  formatLeaseSigned,
  formatYearMonth,
  isLeaseMonthDisabled,
  LEASE_DATE_MAX_YEAR,
  LEASE_DATE_MIN_YEAR,
  parseYearMonth,
} from './leaseDates';

// Mid-month, local time. November 2026 is the "current month" in these tests.
const NOW = new Date(2026, 10, 15);

describe('parseYearMonth / formatYearMonth', () => {
  it('round-trips a valid month', () => {
    expect(parseYearMonth('2024-02')).toEqual({ year: 2024, month: 2 });
    expect(formatYearMonth({ year: 2024, month: 2 })).toBe('2024-02');
  });

  it('rejects missing, malformed and out-of-range values', () => {
    expect(parseYearMonth(null)).toBeNull();
    expect(parseYearMonth(undefined)).toBeNull();
    expect(parseYearMonth('')).toBeNull();
    expect(parseYearMonth('2024-13')).toBeNull();
    expect(parseYearMonth('24-02')).toBeNull();
    expect(parseYearMonth(`${LEASE_DATE_MIN_YEAR - 1}-06`)).toBeNull();
    expect(parseYearMonth(`${LEASE_DATE_MAX_YEAR + 1}-06`)).toBeNull();
  });
});

describe('isLeaseMonthDisabled for the signed field', () => {
  const signed = (year: number, month: number, start?: string | null) =>
    isLeaseMonthDisabled('signed', year, month, { start }, NOW);

  it('allows the current month and earlier, and disables later months', () => {
    expect(signed(2026, 11)).toBe(false);
    expect(signed(2026, 12)).toBe(true);
    expect(signed(2027, 1)).toBe(true);
    expect(signed(2020, 1)).toBe(false);
  });

  it('disables months after the chosen start month', () => {
    expect(signed(2026, 2, '2026-02')).toBe(false);
    expect(signed(2026, 3, '2026-02')).toBe(true);
    expect(signed(2025, 12, '2026-02')).toBe(false);
  });

  it('disables years outside the allowed range', () => {
    expect(signed(LEASE_DATE_MIN_YEAR - 1, 12)).toBe(true);
    expect(signed(LEASE_DATE_MIN_YEAR, 1)).toBe(false);
  });
});

describe('isLeaseMonthDisabled for the start field', () => {
  const start = (year: number, month: number, signed?: string | null) =>
    isLeaseMonthDisabled('start', year, month, { signed }, NOW);

  it('with no signed month, allows past months and up to 3 years after the current month', () => {
    expect(start(2020, 1)).toBe(false);
    expect(start(2029, 11)).toBe(false);
    expect(start(2029, 12)).toBe(true);
  });

  it('disables months before the signed month (signed Aug 2025)', () => {
    expect(start(2025, 7, '2025-08')).toBe(true);
    expect(start(2025, 8, '2025-08')).toBe(false);
    expect(start(2025, 9, '2025-08')).toBe(false);
  });

  it('disables months more than 36 months after the signed month', () => {
    expect(start(2028, 8, '2025-08')).toBe(false);
    expect(start(2028, 9, '2025-08')).toBe(true);
  });

  it('applies both the 3-year and the 36-month limits', () => {
    // Signed Dec 2026: the 36-month limit (Dec 2029) is later than the 3-year limit (Nov 2029).
    expect(start(2029, 11, '2026-12')).toBe(false);
    expect(start(2029, 12, '2026-12')).toBe(true);
  });
});

describe('formatLeaseSigned', () => {
  it('formats a month as uppercase abbreviated month and year', () => {
    expect(formatLeaseSigned('2024-10')).toBe('OCT 2024');
    expect(formatLeaseSigned('2025-01')).toBe('JAN 2025');
    expect(formatLeaseSigned('2023-12')).toBe('DEC 2023');
  });

  it('does not depend on the local timezone', () => {
    // new Date('2024-10') is UTC midnight, which is September in US timezones.
    // Reading the year and month straight from the string avoids that.
    expect(formatLeaseSigned('2024-10')).not.toBe('SEP 2024');
  });

  it('returns null for missing or malformed values so the label can be hidden', () => {
    expect(formatLeaseSigned(undefined)).toBeNull();
    expect(formatLeaseSigned(null)).toBeNull();
    expect(formatLeaseSigned('')).toBeNull();
    expect(formatLeaseSigned('2024-13')).toBeNull();
    expect(formatLeaseSigned('2024-1')).toBeNull();
    expect(formatLeaseSigned('Oct 2024')).toBeNull();
    expect(formatLeaseSigned('1999-05')).toBeNull();
  });
});
