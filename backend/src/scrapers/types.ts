/**
 * Represents a single property scraped from an agency website.
 * All fields are optional except address and sourceUrl — agencies
 * may not publish every field, and that's fine for V1.
 */
export type ScrapedProperty = {
  /* Full street address as displayed on the site, e.g. "211 Williams Street" */
  address: string;

  /* Canonical URL of the property detail page */
  sourceUrl: string;

  /* Agency identifier, e.g. "pjapts" */
  agency: string;

  numBeds: number | null;
  numBaths: number | null;

  /*
   * Monthly rent in dollars. Null when the site says
   * "Please contact us" or similar.
   */
  price: number | null;

  /* Raw pricing string from the site, preserved for admin review */
  priceRaw: string | null;

  /* e.g. "Tenant pays electric lights and outlets only" */
  utilities: string | null;

  /* e.g. "Available", "Street Only", null */
  parking: string | null;

  /* e.g. "In Apartment", "Coin-Op", null */
  laundry: string | null;

  /* true / false / null if not mentioned */
  porch: boolean | null;

  /* e.g. "Tenant/Landlord, super-fast 1 Gbps" */
  internet: string | null;

  /* e.g. "Tenant/Landlord", "Free", null */
  trash: string | null;

  /* e.g. "Free", "Tenant", null */
  snowRemoval: string | null;

  /* ISO date string when the unit is available, e.g. "2026-06-01" */
  availableDate: string | null;

  /* The raw description paragraph from the detail page */
  description: string | null;
};
