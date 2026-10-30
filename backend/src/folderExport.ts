/**
 * folderExport.ts
 *
 * Builds the CSV file for the Export button on a saved apartment folder (FolderDetailPage.tsx).
 * Used by the GET /api/folders/:folderId/export endpoint in app.ts.
 *
 * Each row is one apartment, with these columns:
 * Name, Address, Neighborhood, Room Types, Price Range, Link.
 *
 * Room Types and Price Range come from the apartment's `roomTypes` array (the room types schema).
 * Apartments that haven't been migrated from the old schema (numBeds, numBaths, price) or have no
 * room types yet get empty cells in those two columns instead of causing an error.
 *
 * These functions only format data and never read the database, so they are unit tested directly
 * in folderExport.test.ts.
 */
import { ApartmentWithId, RoomType } from '@common/types/db-types';

/**
 * The column names shown in the first row of the exported CSV file.
 */
export const FOLDER_EXPORT_HEADERS = [
  'Name',
  'Address',
  'Neighborhood',
  'Room Types',
  'Price Range',
  'Link',
];

/**
 * Links in the CSV always point to the production site, so they still work when the file is
 * shared, even if it was exported from localhost or staging.
 */
const CUAPTS_URL = 'https://www.cuapts.org';

/**
 * Turns the `area` value stored in Firestore into the label shown on the site.
 * A value that isn't in this list (bad or missing data) becomes an empty cell.
 */
const NEIGHBORHOOD_LABELS: Record<string, string> = {
  COLLEGETOWN: 'Collegetown',
  WEST: 'West',
  NORTH: 'North',
  DOWNTOWN: 'Downtown',
  OTHER: 'Other',
};

/**
 * escapeCSVField – Makes a single value safe to put in one CSV cell.
 *
 * @remarks
 * CSV uses commas to separate columns, so a value containing a comma, quotation mark, or line
 * break is wrapped in double quotes, and any quotation marks inside it are doubled.
 * Missing values (null or undefined) become an empty cell.
 * Example: `110 Big Red Ln, Apt 2` becomes `"110 Big Red Ln, Apt 2"`.
 *
 * @param {unknown} value – The value to put in the cell.
 * @returns {string} – The value, safe to put in a CSV row.
 */
export const escapeCSVField = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * formatRoomTypes – Turns an apartment's room types into readable text.
 *
 * @remarks
 * Each room type becomes "[beds] bed, [baths] bath - $[price]", separated by "; ".
 * Returns an empty string if the apartment has no room types listed yet.
 *
 * @param {readonly RoomType[] | undefined} roomTypes – The apartment's room types.
 * @returns {string} – For example "2 bed, 1 bath - $1200; 3 bed, 2 bath - $1500".
 */
export const formatRoomTypes = (roomTypes?: readonly RoomType[]): string => {
  if (!roomTypes || roomTypes.length === 0) return '';
  return roomTypes
    .map(({ beds, baths, price }) => `${beds} bed, ${baths} bath - $${price}`)
    .join('; ');
};

/**
 * formatPriceRange – Gets the lowest to highest price across an apartment's room types.
 *
 * @remarks
 * Returns an empty string if the apartment has no room types listed yet.
 *
 * @param {readonly RoomType[] | undefined} roomTypes – The apartment's room types.
 * @returns {string} – For example "$1200 - $1500", or "$1200" if there is only one price.
 */
export const formatPriceRange = (roomTypes?: readonly RoomType[]): string => {
  if (!roomTypes || roomTypes.length === 0) return '';
  const prices = roomTypes.map((roomType) => roomType.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${min}` : `$${min} - $${max}`;
};

/**
 * buildFolderCSV – Builds the full CSV file text for the apartments in a folder.
 *
 * @remarks
 * The first row is the column names, then each apartment gets one row, in the order given.
 * Rows are separated by "\n" with no line break at the end. Missing information is left as an
 * empty cell instead of causing an error, so this function never throws.
 *
 * @param {ApartmentWithId[]} apartments – The apartments saved in the folder.
 * @returns {string} – The CSV text, ready to send as a file. An empty list returns only the
 * header row.
 */
export const buildFolderCSV = (apartments: ApartmentWithId[]): string => {
  const rows = apartments.map((apt) =>
    [
      apt.name,
      apt.address,
      NEIGHBORHOOD_LABELS[apt.area] ?? '',
      formatRoomTypes(apt.roomTypes),
      formatPriceRange(apt.roomTypes),
      `${CUAPTS_URL}/apartment/${apt.id}`,
    ]
      .map(escapeCSVField)
      .join(',')
  );
  return [FOLDER_EXPORT_HEADERS.join(','), ...rows].join('\n');
};
