/**
 * scripts.test.ts
 *
 * Unit tests for the pure helper functions in export_apartments.ts
 * and update_apartments_from_csv.ts.
 *
 * Run with: npx jest scripts/scripts.test.ts --forceExit (was getting incompatibility issues in Firebase and node versions but it works with this)
 */

// Mock firebase-config so importing the scripts doesn't try to connect to Firebase
import { escapeCSVField } from './export_apartments';
import { parseCSVLine, parseCSV } from './update_apartments_from_csv';

jest.mock('../src/firebase-config', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// ─── escapeCSVField ───────────────────────────────────────────────────────────

describe('escapeCSVField', () => {
  it('returns plain strings unchanged', () => {
    expect(escapeCSVField('hello')).toBe('hello');
  });

  it('wraps values containing a comma in quotes', () => {
    expect(escapeCSVField('110 Big Red Ln, Apt 2')).toBe('"110 Big Red Ln, Apt 2"');
  });

  it('wraps values containing a double-quote in quotes and escapes the inner quote', () => {
    expect(escapeCSVField('say "hello"')).toBe('"say ""hello"""');
  });

  it('wraps values containing a newline in quotes', () => {
    expect(escapeCSVField('line1\nline2')).toBe('"line1\nline2"');
  });

  it('converts numbers to strings', () => {
    expect(escapeCSVField(42)).toBe('42');
    expect(escapeCSVField(1.5)).toBe('1.5');
  });

  it('converts null to an empty string', () => {
    expect(escapeCSVField(null)).toBe('');
  });

  it('converts undefined to an empty string', () => {
    expect(escapeCSVField(undefined)).toBe('');
  });
});

// ─── parseCSVLine ─────────────────────────────────────────────────────────────

describe('parseCSVLine', () => {
  it('splits a simple comma-separated line', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('handles a quoted field containing a comma', () => {
    expect(parseCSVLine('1,"110 Big Red Ln, Apt 2",COLLEGETOWN')).toEqual([
      '1',
      '110 Big Red Ln, Apt 2',
      'COLLEGETOWN',
    ]);
  });

  it('handles escaped double-quotes inside a quoted field', () => {
    expect(parseCSVLine('1,"say ""hello""",3')).toEqual(['1', 'say "hello"', '3']);
  });

  it('trims whitespace around field values', () => {
    expect(parseCSVLine('  a  ,  b  ,  c  ')).toEqual(['a', 'b', 'c']);
  });

  it('handles empty fields', () => {
    expect(parseCSVLine('1,,3')).toEqual(['1', '', '3']);
  });
});

// ─── parseCSV ─────────────────────────────────────────────────────────────────

const VALID_HEADER =
  'id,name,address,landlordId,numBeds,numBaths,price,area,latitude,longitude,distanceToCampus';

describe('parseCSV', () => {
  it('throws if the file has no data rows', () => {
    expect(() => parseCSV(VALID_HEADER)).toThrow('CSV file is empty or has no data rows.');
  });

  it('throws if a required column is missing', () => {
    const csv = 'id,name\n1,Test Apt';
    expect(() => parseCSV(csv)).toThrow('CSV is missing required columns:');
  });

  it('parses a valid row and returns correct updates', () => {
    const csv = [
      VALID_HEADER,
      '42,Test Apt,123 College Ave,5,2,1,1200,COLLEGETOWN,42.4534,-76.4735,10',
    ].join('\n');
    const { rows, errors } = parseCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('42');
    expect(rows[0].updates).toMatchObject({
      name: 'Test Apt',
      address: '123 College Ave',
      landlordId: '5',
      numBeds: 2,
      numBaths: 1,
      price: 1200,
      area: 'COLLEGETOWN',
      latitude: 42.4534,
      longitude: -76.4735,
      distanceToCampus: 10,
    });
  });

  it('accepts area values case-insensitively', () => {
    const csv = [VALID_HEADER, '1,Apt,123 St,5,2,1,1000,collegetown,42.0,-76.0,5'].join('\n');
    const { rows, errors } = parseCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].updates.area).toBe('COLLEGETOWN');
  });

  it('returns a validation error for an invalid area', () => {
    const csv = [VALID_HEADER, '1,Apt,123 St,5,2,1,1000,INVALID,42.0,-76.0,5'].join('\n');
    const { rows, errors } = parseCSV(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('area');
  });

  it('returns a validation error for a negative numBeds', () => {
    const csv = [VALID_HEADER, '1,Apt,123 St,5,-1,1,1000,COLLEGETOWN,42.0,-76.0,5'].join('\n');
    const { errors } = parseCSV(csv);
    expect(errors.some((e) => e.field === 'numBeds')).toBe(true);
  });

  it('returns a validation error for a non-numeric price', () => {
    const csv = [VALID_HEADER, '1,Apt,123 St,5,2,1,abc,COLLEGETOWN,42.0,-76.0,5'].join('\n');
    const { errors } = parseCSV(csv);
    expect(errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('returns a validation error when id is blank', () => {
    const csv = [VALID_HEADER, ',Apt,123 St,5,2,1,1000,COLLEGETOWN,42.0,-76.0,5'].join('\n');
    const { errors } = parseCSV(csv);
    expect(errors.some((e) => e.field === 'id')).toBe(true);
  });

  it('skips rows where no fields changed (all blank)', () => {
    // Only id is present, everything else is blank — nothing to update
    const csv = [VALID_HEADER, '1,,,,,,,,,,'].join('\n');
    const { rows, errors } = parseCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(0);
  });

  it('collects errors across multiple rows without aborting', () => {
    const csv = [
      VALID_HEADER,
      '1,Apt,123 St,5,-1,1,1000,COLLEGETOWN,42.0,-76.0,5', // bad numBeds
      '2,Apt,456 St,5,2,1,bad,COLLEGETOWN,42.0,-76.0,5', // bad price
    ].join('\n');
    const { errors } = parseCSV(csv);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
