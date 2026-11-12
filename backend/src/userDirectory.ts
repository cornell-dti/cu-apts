/**
 * userDirectory.ts
 *
 * Lets people find each other by NetID or name when sharing a folder, used by the user search
 * endpoints in app.ts.
 *
 * How it works:
 * - When someone signs in, the frontend saves their NetID, name, and email to their document in
 *   the `users` collection (the same document that holds their saved apartments).
 * - The invite box searches those documents by NetID or name, so suggestions only include people
 *   who have signed in to CU Apts before. Anyone else can still be invited by typing their NetID.
 * - `scripts/backfill_user_profiles.ts` fills in profiles for people who signed in before this.
 *   Until it runs, typing someone's full NetID still finds them through Firebase Auth.
 */

import { auth } from './firebase-config';
import { normalizeNetId } from './folderInvites';

/**
 * The most suggestions one search returns, matching the dropdown in the Figma.
 */
export const SEARCH_LIMIT = 5;

/**
 * The fewest characters someone has to type before we search.
 */
export const MIN_SEARCH_LENGTH = 2;

/**
 * UserProfile – What we save about each person so others can find them.
 */
export type UserProfile = {
  netId: string;
  name: string;
  nameLower: string; // lowercase copy of the name, since Firestore searches are case-sensitive
  email: string;
};

/**
 * UserSearchResult – One suggestion in the invite box.
 */
export type UserSearchResult = Pick<UserProfile, 'netId' | 'name' | 'email'>;

/**
 * buildUserProfile – Builds the searchable profile for a signed-in Cornell user.
 *
 * @param {string} email – The user's email. Only Cornell emails get a profile.
 * @param {string | undefined} name – The user's name from their Google account, if they have one.
 * @returns {UserProfile | null} – The profile, or null if the email isn't a Cornell email.
 */
export const buildUserProfile = (email: string, name: string | undefined): UserProfile | null => {
  const lowerEmail = email.trim().toLowerCase();
  if (!lowerEmail.endsWith('@cornell.edu')) return null;
  const netId = lowerEmail.slice(0, -'@cornell.edu'.length);
  if (!netId) return null;
  const displayName = name?.trim() || netId;
  return { netId, name: displayName, nameLower: displayName.toLowerCase(), email: lowerEmail };
};

/**
 * normalizeSearch – Cleans up what someone typed into the invite box before searching.
 *
 * @remarks
 * Lowercases the text and drops an email ending, so "AB12@cornell.edu" searches for "ab12".
 * Returns null when there's too little to search for, or for characters that can't be in a NetID
 * or a name.
 *
 * @param {unknown} input – The text from the search box.
 * @returns {string | null} – The text to search for, or null to skip the search.
 */
export const normalizeSearch = (input: unknown): string | null => {
  if (typeof input !== 'string') return null;
  const query = input.trim().toLowerCase().split('@')[0].trim();
  if (query.length < MIN_SEARCH_LENGTH || !/^[a-z0-9 .'-]+$/.test(query)) return null;
  return query;
};

/**
 * mergeSearchResults – Combines NetID and name matches into one short list of suggestions.
 *
 * @remarks
 * NetID matches come first, since NetIDs are what the box asks for. Each person shows up once,
 * and the person searching is left out because they can't invite themselves.
 *
 * @param {UserProfile[]} netIdMatches – People whose NetID starts with the search.
 * @param {UserProfile[]} nameMatches – People whose name starts with the search.
 * @param {string} searcherNetId – The NetID of the person searching.
 * @returns {UserSearchResult[]} – Up to SEARCH_LIMIT suggestions.
 */
export const mergeSearchResults = (
  netIdMatches: UserProfile[],
  nameMatches: UserProfile[],
  searcherNetId: string
): UserSearchResult[] => {
  const results: UserSearchResult[] = [];
  [...netIdMatches, ...nameMatches].forEach(({ netId, name, email }) => {
    const isNew = !results.some((result) => result.netId === netId);
    if (isNew && netId !== searcherNetId && results.length < SEARCH_LIMIT) {
      results.push({ netId, name, email });
    }
  });
  return results;
};

/**
 * findAccountByNetId – Finds a CU Apts account by full NetID, even if it has no saved profile.
 *
 * @remarks
 * Profiles are only saved when someone signs in, so people who haven't signed in since this
 * feature shipped (and before the backfill script runs) are missing from the prefix search.
 * Typing their full NetID still finds them through Firebase Auth.
 *
 * @param {string} query – The cleaned-up search.
 * @returns {Promise<UserSearchResult | null>} – The person, or null if the search isn't a full
 * NetID or nobody with that NetID has signed in to CU Apts.
 */
export const findAccountByNetId = async (query: string): Promise<UserSearchResult | null> => {
  const netId = normalizeNetId(query);
  if (!netId) return null;
  const email = `${netId}@cornell.edu`;
  try {
    const account = await auth.getUserByEmail(email);
    return { netId, name: account.displayName || netId, email };
  } catch (err) {
    if ((err as { code?: string }).code === 'auth/user-not-found') return null;
    throw err;
  }
};
