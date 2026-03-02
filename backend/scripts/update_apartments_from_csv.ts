import * as fs from 'fs';
import * as path from 'path';
import { db } from '../src/firebase-config';

/**
 * update_apartments_from_csv.ts
 *
 * Reads apartments_export.csv (edited by the business team) and bulk-updates
 * the corresponding Firestore documents in the buildings collection.
 *
 * Only fields that have changed from the original export are updated.
 * The id column is used to match rows to Firestore documents — do NOT edit it.
 * Fields left blank in the CSV are skipped (not overwritten with empty values).
 *
 * Editable fields:
 *   name, address, landlordId, numBeds, numBaths, price, area,
 *   latitude, longitude, distanceToCampus
 *
 * Usage:
 *   env-cmd -f ../.env.prod ts-node scripts/update_apartments_from_csv.ts
 *
 * Input:
 *   backend/scripts/apartments_export.csv  (edited by business team)
 */

const buildingCollection = db.collection('buildings');

const VALID_AREAS = ['COLLEGETOWN', 'WEST', 'NORTH', 'DOWNTOWN', 'OTHER'];
const VALID_AREAS_SET = new Set(VALID_AREAS);

type ApartmentUpdate = {
  name?: string;
  address?: string;
  landlordId?: string;
  numBeds?: number;
  numBaths?: number;
  price?: number;
  area?: 'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER';
  latitude?: number;
  longitude?: number;
  distanceToCampus?: number;
};

type ParsedRow = {
  id: string;
  updates: ApartmentUpdate;
};

type ValidationError = {
  row: number;
  id: string;
  field: string;
  value: string;
  reason: string;
};

// Parse a raw CSV line into an array of field values
export const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
};

// Parse and validate the CSV file
export const parseCSV = (csvContent: string): { rows: ParsedRow[]; errors: ValidationError[] } => {
  const lines = csvContent.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows.');
  }

  const headers = parseCSVLine(lines[0]);
  const expectedHeaders = [
    'id',
    'name',
    'address',
    'landlordId',
    'numBeds',
    'numBaths',
    'price',
    'area',
    'latitude',
    'longitude',
    'distanceToCampus',
  ];

  // Validate headers
  const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV is missing required columns: ${missingHeaders.join(', ')}`);
  }

  const idx = (name: string) => headers.indexOf(name);

  const rows: ParsedRow[] = [];
  const errors: ValidationError[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const fields = parseCSVLine(lines[i]);
    const rowNum = i + 1; // (1 index bc of header)

    const id = fields[idx('id')]?.trim();
    if (!id) {
      errors.push({
        row: rowNum,
        id: '?',
        field: 'id',
        value: '',
        reason: 'id is required and cannot be blank',
      });
    }

    const updates: ApartmentUpdate = {};
    let rowHasError = false;

    const addError = (field: string, value: string, reason: string) => {
      errors.push({ row: rowNum, id, field, value, reason });
      rowHasError = true;
    };

    // name
    const name = fields[idx('name')]?.trim();
    if (name) {
      updates.name = name;
    }

    // address
    const address = fields[idx('address')]?.trim();
    if (address) {
      updates.address = address;
    }

    // landlordId
    const landlordId = fields[idx('landlordId')]?.trim();
    if (landlordId) {
      updates.landlordId = landlordId;
    }

    // numBeds
    const numBedsRaw = fields[idx('numBeds')]?.trim();
    if (numBedsRaw !== '' && numBedsRaw !== undefined) {
      const numBeds = Number(numBedsRaw);
      if (Number.isNaN(numBeds) || numBeds < 0) {
        addError('numBeds', numBedsRaw, 'must be a non-negative number');
      } else {
        updates.numBeds = numBeds;
      }
    }

    // numBaths
    const numBathsRaw = fields[idx('numBaths')]?.trim();
    if (numBathsRaw !== '' && numBathsRaw !== undefined) {
      const numBaths = Number(numBathsRaw);
      if (Number.isNaN(numBaths) || numBaths < 0) {
        addError('numBaths', numBathsRaw, 'must be a non-negative number');
      } else {
        updates.numBaths = numBaths;
      }
    }

    // price
    const priceRaw = fields[idx('price')]?.trim();
    if (priceRaw !== '' && priceRaw !== undefined) {
      const price = Number(priceRaw);
      if (Number.isNaN(price) || price < 0) {
        addError('price', priceRaw, 'must be a non-negative number');
      } else {
        updates.price = price;
      }
    }

    // area
    const areaRaw = fields[idx('area')]?.trim().toUpperCase();
    if (areaRaw) {
      if (!VALID_AREAS_SET.has(areaRaw)) {
        addError('area', areaRaw, `must be one of: ${VALID_AREAS.join(', ')}`);
      } else {
        updates.area = areaRaw as ApartmentUpdate['area'];
      }
    }

    // latitude
    const latRaw = fields[idx('latitude')]?.trim();
    if (latRaw !== '' && latRaw !== undefined) {
      const latitude = Number(latRaw);
      if (Number.isNaN(latitude)) {
        addError('latitude', latRaw, 'must be a number');
      } else {
        updates.latitude = latitude;
      }
    }

    // longitude
    const lngRaw = fields[idx('longitude')]?.trim();
    if (lngRaw !== '' && lngRaw !== undefined) {
      const longitude = Number(lngRaw);
      if (Number.isNaN(longitude)) {
        addError('longitude', lngRaw, 'must be a number');
      } else {
        updates.longitude = longitude;
      }
    }

    // distanceToCampus
    const distRaw = fields[idx('distanceToCampus')]?.trim();
    if (distRaw !== '' && distRaw !== undefined) {
      const distanceToCampus = Number(distRaw);
      if (Number.isNaN(distanceToCampus) || distanceToCampus < 0) {
        addError('distanceToCampus', distRaw, 'must be a non-negative number');
      } else {
        updates.distanceToCampus = distanceToCampus;
      }
    }

    if (!rowHasError && Object.keys(updates).length > 0) {
      rows.push({ id, updates });
    } else if (!rowHasError) {
      console.log(`  Row ${rowNum} (id: ${id}): no changes detected, skipping.`);
    }
  }

  return { rows, errors };
};

const updateApartments = async () => {
  const csvPath = path.join(__dirname, 'apartments_export.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    console.error('   Run export_apartments.ts first to generate the file.');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');

  console.log('Parsing CSV...');
  const { rows, errors } = parseCSV(csvContent);

  // print all validation errors and abort before touching the database
  if (errors.length > 0) {
    console.error(`\n Found ${errors.length} validation error(s). No changes have been made.\n`);
    errors.forEach((e) => {
      console.error(`  Row ${e.row} (id: ${e.id}) — ${e.field}: "${e.value}" — ${e.reason}`);
    });
    console.error('\nFix the errors above in the CSV and re-run the script.');
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('No rows to update.');
    process.exit(0);
  }

  console.log(`\nUpdating ${rows.length} apartment(s) in Firestore...`);

  let successCount = 0;
  let failCount = 0;

  await Promise.all(
    rows.map(async ({ id, updates }) => {
      try {
        const docRef = buildingCollection.doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
          console.warn(`  id: ${id} — document not found in Firestore, skipping.`);
          failCount += 1;
          return;
        }

        await docRef.update(updates);
        console.log(` id: ${id} — updated fields: ${Object.keys(updates).join(', ')}`);
        successCount += 1;
      } catch (err) {
        console.error(`  id: ${id} — update failed:`, err);
        failCount += 1;
      }
    })
  );

  console.log('');
  console.log(`Done. ${successCount} updated, ${failCount} failed/skipped.`);
  process.exit(failCount > 0 ? 1 : 0);
};

if (require.main === module) {
  updateApartments().catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
}
