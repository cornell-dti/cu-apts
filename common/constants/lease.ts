// Month/year format used for Review.leaseSigned and Review.leaseStart.
export const LEASE_DATE_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;

// Earliest/latest year accepted in a lease date. Rejects typos like "0205-09".
export const LEASE_DATE_MIN_YEAR = 2000;
export const LEASE_DATE_MAX_YEAR = 2100;

// Minimum number of reviews with both lease dates before an average is shown.
// Below this, the listing returns the empty state (avgMonthsBeforeStart: null).
export const MIN_LEASE_REVIEWS_FOR_AVERAGE = 3;
