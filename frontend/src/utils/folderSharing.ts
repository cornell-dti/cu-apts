/**
 * folderSharing.ts
 *
 * Calls to the shared folder endpoints, plus small helpers the sharing screens use. Every call
 * needs the signed-in user, because the backend checks who is asking.
 */
import axios from 'axios';
import { createAuthHeaders } from './firebase';

/**
 * UserSuggestion – Someone the invite box suggests while you type.
 */
export type UserSuggestion = {
  netId: string;
  name: string;
  email: string;
};

// Cornell NetIDs are two or three letters followed by one or more digits (e.g. km2253)
const NETID_PATTERN = /^[a-z]{2,3}[0-9]+$/;

/**
 * toNetId – Turns a typed NetID or Cornell email into a NetID.
 *
 * @remarks
 * Matches the backend's check, so anything this accepts can be invited.
 *
 * @param {string} input – What the person typed, like "AB123" or "ab123@cornell.edu".
 * @returns {string | null} – The lowercase NetID, or null if the text isn't a full NetID.
 */
export const toNetId = (input: string): string | null => {
  const netId = input
    .trim()
    .toLowerCase()
    .replace(/@cornell\.edu$/, '');
  return NETID_PATTERN.test(netId) ? netId : null;
};

/**
 * isInvalidInvite – Checks whether typed text can't turn into a NetID, Cornell email, or name.
 *
 * @remarks
 * Used to show the error state while typing. Partial input is fine: "ab", "ab12", "ab12@corn",
 * and "Alex B" are all still on their way to something valid.
 *
 * @param {string} input – What the person typed.
 * @returns {boolean} – True if the text can never be a NetID, Cornell email, or name.
 */
export const isInvalidInvite = (input: string): boolean => {
  const text = input.trim().toLowerCase();
  if (!text) return false;

  const parts = text.split('@');
  if (parts.length > 2) return true;
  if (parts.length === 2) {
    return !NETID_PATTERN.test(parts[0]) || !'cornell.edu'.startsWith(parts[1]);
  }

  // Text with digits has to be the start of a NetID; text without digits can be a name
  if (/[0-9]/.test(text)) return !/^[a-z]{1,3}[0-9]*$/.test(text);
  return !/^[a-z .'-]+$/.test(text);
};

/**
 * netIdFromEmail – Gets the NetID part of a Cornell email.
 *
 * @param {string | null | undefined} email – A Cornell email, like "ab123@cornell.edu".
 * @returns {string} – The NetID, or an empty string if there's no email.
 */
export const netIdFromEmail = (email: string | null | undefined): string =>
  (email ?? '').toLowerCase().split('@')[0];

/**
 * getErrorMessage – Gets the message the backend sent with a failed request.
 *
 * @param {unknown} err – The error axios threw.
 * @param {string} fallback – What to show if the backend didn't send a message.
 * @returns {string} – A message that can be shown to the user.
 */
export const getErrorMessage = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return typeof data === 'string' && data ? data : fallback;
};

/**
 * authHeaders – Builds the Authorization header for the signed-in user.
 *
 * @param {firebase.User} user – The signed-in user.
 * @returns {Promise<ReturnType<typeof createAuthHeaders>>} – Request options with the header.
 */
const authHeaders = async (user: firebase.User) => createAuthHeaders(await user.getIdToken());

/**
 * searchUsers – Suggests CU Apts users whose NetID or name starts with what was typed.
 *
 * @param {firebase.User} user – The signed-in user.
 * @param {string} query – What was typed in the invite box.
 * @returns {Promise<UserSuggestion[]>} – Up to 5 suggestions.
 */
export const searchUsers = async (
  user: firebase.User,
  query: string
): Promise<UserSuggestion[]> => {
  const { data } = await axios.get('/api/users/search', {
    params: { q: query },
    ...(await authHeaders(user)),
  });
  return data;
};

/**
 * sendFolderInvite – Invites a NetID to a folder, or emails the invite again if it's pending.
 *
 * @param {firebase.User} user – The signed-in user (the folder's owner).
 * @param {string} folderId – The folder to share.
 * @param {string} netId – The NetID to invite.
 * @returns {Promise<{ resent: boolean }>} – Whether this was a resend of a pending invite.
 */
export const sendFolderInvite = async (
  user: firebase.User,
  folderId: string,
  netId: string
): Promise<{ resent: boolean }> => {
  const { data } = await axios.post(
    `/api/folders/${folderId}/invites`,
    { netId },
    await authHeaders(user)
  );
  return { resent: data?.resent === true };
};

/**
 * FolderPerson – The owner or a member of a folder, as shown in the Share menu.
 */
export type FolderPerson = { id: string; name: string; email: string };

/**
 * FolderCollaborators – Everyone with access to a folder. Only the owner gets `pendingInvites`.
 */
export type FolderCollaborators = {
  owner: FolderPerson;
  members: FolderPerson[];
  pendingInvites: { id: string; netId: string; email: string }[];
  limit: number; // the most members plus pending invites a folder can have
};

/**
 * getCollaborators – Gets who has access to a folder, with names and emails.
 *
 * @param {firebase.User} user – The signed-in user (the owner or a member).
 * @param {string} folderId – The folder.
 * @returns {Promise<FolderCollaborators>} – The owner, members, and pending invites.
 */
export const getCollaborators = async (
  user: firebase.User,
  folderId: string
): Promise<FolderCollaborators> => {
  const { data } = await axios.get(
    `/api/folders/${folderId}/collaborators`,
    await authHeaders(user)
  );
  return data;
};

/**
 * removeFolderMember – Removes a member from a folder. Removing yourself leaves the folder.
 *
 * @param {firebase.User} user – The signed-in user (the owner, or the member who is leaving).
 * @param {string} folderId – The folder.
 * @param {string} memberId – The user ID of the member to remove.
 * @returns {Promise<void>} – Resolves once they're removed.
 */
export const removeFolderMember = async (
  user: firebase.User,
  folderId: string,
  memberId: string
): Promise<void> => {
  await axios.delete(`/api/folders/${folderId}/members/${memberId}`, await authHeaders(user));
};

/**
 * cancelFolderInvite – Takes back an invite that hasn't been answered yet.
 *
 * @param {firebase.User} user – The signed-in user (the folder's owner).
 * @param {string} inviteId – The invite to cancel.
 * @returns {Promise<void>} – Resolves once the invite is cancelled.
 */
export const cancelFolderInvite = async (user: firebase.User, inviteId: string): Promise<void> => {
  await axios.delete(`/api/folder-invites/${inviteId}`, await authHeaders(user));
};
