import * as fs from 'fs';
import * as path from 'path';
import { db } from '../src/firebase-config';

/**
 * export_apartments.ts
 *
 * Exports all apartment documents from Firestore to a CSV file.
 * The business team can then edit the CSV and pass it to update_apartments_from_csv.ts.
 *
 * Usage:
 *   env-cmd -f ../.env.prod ts-node scripts/export_apartments.ts
 *
 * Output:
 *   backend/scripts/apartments_export.csv
 */

const buildingCollection = db.collection('buildings');

const AREA_VALUES = ['COLLEGETOWN', 'WEST', 'NORTH', 'DOWNTOWN', 'OTHER'];

const CSV_HEADERS = [
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

// Escape a CSV field value — wraps in quotes if it contains commas, quotes, or newlines
const escapeCSVField = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const exportApartments = async () => {
  console.log('Fetching apartments from Firestore...');

  const snapshot = await buildingCollection.get();

  if (snapshot.empty) {
    console.log('No apartments found in the database.');
    process.exit(0);
  }

  console.log(`Found ${snapshot.docs.length} apartments. Writing CSV...`);

  const rows: string[] = [CSV_HEADERS.join(',')];

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const row = [
      doc.id,
      data.name,
      data.address,
      data.landlordId,
      data.numBeds,
      data.numBaths,
      data.price,
      data.area,
      data.latitude,
      data.longitude,
      data.distanceToCampus,
    ]
      .map(escapeCSVField)
      .join(',');

    rows.push(row);
  });

  const outputPath = path.join(__dirname, 'apartments_export.csv');
  fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');

  console.log(`✅ Export complete: ${outputPath}`);
  console.log(`   ${snapshot.docs.length} apartments exported.`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Open apartments_export.csv in Excel or Google Sheets');
  console.log('  2. Edit the fields you want to update (do NOT change the id column)');
  console.log('  3. Save as CSV');
  console.log('  4. Run: env-cmd -f ../.env.prod ts-node scripts/update_apartments_from_csv.ts');

  process.exit(0);
};

exportApartments().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
