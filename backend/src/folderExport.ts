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

const CUAPTS_URL = 'https://www.cuapts.org';

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
 *
 * @param {unknown} value – The value to put in the cell.
 * @return {string} – The value, safe to put in a CSV row.
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
 * @return {string} – For example "2 bed, 1 bath - $1200; 3 bed, 2 bath - $1500".
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
 * @return {string} – For example "$1200 - $1500", or "$1200" if there is only one price.
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
 * The first row is the column names, then each apartment gets one row.
 * Missing information is left as an empty cell instead of causing an error.
 *
 * @param {ApartmentWithId[]} apartments – The apartments saved in the folder.
 * @return {string} – The CSV text, ready to send as a file.
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
