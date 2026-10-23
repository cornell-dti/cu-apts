import { monthsBetween, parseYearMonth, validateLeaseDates } from './leaseDates';

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
