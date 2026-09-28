import { admins } from '../constants/HomeConsts';

/**
 * isAdmin – Checks whether a given user is an admin.
 *
 * @remarks
 * This function verifies if the user provided has an email that matches one of the predefined admin emails.
 *
 * @param {firebase.User | null} user – The Firebase user object to check. Can be `null`.
 *
 * @returns {boolean} – `true` if the user is an admin, otherwise `false`.
 */

export const isAdmin = (user: firebase.User | null) => {
  if (user && typeof user?.email === 'string' && admins.includes(user?.email)) return true;
  return false;
};
