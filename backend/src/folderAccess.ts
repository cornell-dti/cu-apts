/**
 * folderAccess.ts
 *
 * Permission checks for saved apartment folders, used by the /api/folders endpoints in app.ts.
 *
 * A folder has one owner (`userId`, the user who created it) and an optional list of `members`
 * (the user IDs it has been shared with). Before shared folders, a folder only had an owner, so
 * folders created before this change have no `members` field and are treated as having no members.
 *
 * What each role can do:
 * - Owner: everything (view, add and remove apartments, export, rename, delete, remove members)
 * - Member: view the folder and add and remove apartments
 * - Anyone else: nothing (the endpoints return 403)
 */
import { Folder } from '@common/types/db-types';

/**
 * The fields of a folder document needed to check access.
 */
type FolderAccessFields = Pick<Folder, 'userId' | 'members'>;

/**
 * isFolderOwner – Checks whether a user is the owner (creator) of a folder.
 *
 * @param {FolderAccessFields | undefined} folder – The folder's data, or undefined if the folder
 * doesn't exist.
 * @param {string} uid – The signed-in user's ID.
 * @returns {boolean} – True only if the user created the folder. Members are not owners.
 */
export const isFolderOwner = (folder: FolderAccessFields | undefined, uid: string): boolean =>
  folder !== undefined && folder.userId === uid;

/**
 * canAccessFolder – Checks whether a user can view and edit the apartments in a folder.
 *
 * @remarks
 * Owners and members can both access a folder. A folder with no `members` field (created before
 * shared folders) is only accessible to its owner.
 *
 * @param {FolderAccessFields | undefined} folder – The folder's data, or undefined if the folder
 * doesn't exist.
 * @param {string} uid – The signed-in user's ID.
 * @returns {boolean} – True if the user is the folder's owner or one of its members.
 */
export const canAccessFolder = (folder: FolderAccessFields | undefined, uid: string): boolean =>
  isFolderOwner(folder, uid) || (folder?.members ?? []).includes(uid);
