/**
 * folderInvites.ts
 *
 * Helpers for inviting people to a shared folder by NetID, used by the folder invite endpoints in
 * app.ts.
 *
 * How an invite works:
 * - The owner invites a NetID. The invite is saved in `folderInvites` with status PENDING.
 * - An email goes to `<netId>@cornell.edu` with a link back to CU Apts to accept or decline.
 * - The invited person signs in with that email. Accepting adds them to the folder's `members`.
 * - Each owner can only send a limited number of invites per hour, to stop spam and joke invites.
 */
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { FolderInvite } from '@common/types/db-types';
import { auth } from './firebase-config';

/**
 * Cornell NetIDs are two or three letters followed by one or more digits (e.g. km2253).
 */
const NETID_PATTERN = /^[a-z]{2,3}[0-9]+$/;

/**
 * How many invites one owner can send per hour.
 */
export const INVITES_PER_HOUR = 10;

/**
 * Invite links always point to the production site, like the links in other CU Apts emails.
 */
const CUAPTS_URL = 'https://www.cuapts.org';

/**
 * normalizeNetId – Cleans up a NetID or Cornell email typed by a user and checks that it looks
 * like a NetID.
 *
 * @remarks
 * Users can type a NetID ("abc123") or a full Cornell email ("abc123@cornell.edu"); both become
 * "abc123". Any other email is rejected, since invites only go to Cornell accounts.
 *
 * @param {unknown} input – The NetID or Cornell email from the request body.
 * @returns {string | null} – The trimmed, lowercase NetID, or null if it isn't a valid NetID.
 */
export const normalizeNetId = (input: unknown): string | null => {
  if (typeof input !== 'string') return null;
  const netId = input
    .trim()
    .toLowerCase()
    .replace(/@cornell\.edu$/, '');
  return NETID_PATTERN.test(netId) ? netId : null;
};

/**
 * getInviteId – Builds the ID of the invite document for a folder and a NetID.
 *
 * @remarks
 * One ID per folder and NetID means a person has at most one invite to a folder at a time, and a
 * declined invite can be sent again by overwriting it.
 *
 * @param {string} folderId – The ID of the folder.
 * @param {string} netId – The invited person's NetID.
 * @returns {string} – The invite document ID.
 */
export const getInviteId = (folderId: string, netId: string): string => `${folderId}_${netId}`;

/**
 * isInvitee – Checks whether the signed-in user is the person an invite was sent to.
 *
 * @param {Pick<FolderInvite, 'inviteeEmail'>} invite – The invite.
 * @param {string | undefined} email – The signed-in user's email.
 * @returns {boolean} – True only if the user signed in with the invited Cornell email.
 */
export const isInvitee = (
  invite: Pick<FolderInvite, 'inviteeEmail'>,
  email: string | undefined
): boolean => email !== undefined && email.toLowerCase() === invite.inviteeEmail;

/**
 * findUserIdByEmail – Looks up the CU Apts account that uses an email, if there is one.
 *
 * @remarks
 * People can be invited before they have ever signed in to CU Apts, so a missing account is not an
 * error.
 *
 * @param {string} email – The email to look up.
 * @returns {Promise<string | null>} – The user's ID, or null if no account uses that email.
 */
export const findUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    const user = await auth.getUserByEmail(email);
    return user.uid;
  } catch (err) {
    if ((err as { code?: string }).code === 'auth/user-not-found') return null;
    throw err;
  }
};

/**
 * escapeHtml – Escapes text so it shows up as plain text inside an HTML email.
 *
 * @param {string} text – The text to escape.
 * @returns {string} – The escaped text.
 */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * buildInviteEmail – Builds the subject and body of a folder invite email.
 *
 * @remarks
 * The inviter's name and the folder name are typed by users, so they are escaped before they go
 * into the HTML.
 *
 * @param {string} inviterName – The name of the person who sent the invite.
 * @param {string} folderName – The name of the shared folder.
 * @param {string} inviteId – The invite's ID, used in the accept/decline link.
 * @returns {{ subject: string, text: string, html: string }} – The email's subject and body.
 */
export const buildInviteEmail = (
  inviterName: string,
  folderName: string,
  inviteId: string
): { subject: string; text: string; html: string } => {
  const link = `${CUAPTS_URL}/folder-invite/${encodeURIComponent(inviteId)}`;
  return {
    subject: `[CUApts] ${inviterName} shared a folder with you`,
    text: `${inviterName} invited you to the CUApts folder "${folderName}". Accept or decline the invite here: ${link}`,
    html: `<p>${escapeHtml(inviterName)} invited you to the CUApts folder <b>${escapeHtml(
      folderName
    )}</b>.</p>
<p>As a member, you can see the apartments in the folder and add or remove them.</p>
<p><a href="${link}">Accept or decline the invite</a></p>
<p>This is a notification email from CUApts (https://www.cuapts.org/).</p>`,
  };
};

/**
 * sendFolderInviteEmail – Emails an invite to the person who was invited to a folder.
 *
 * @remarks
 * Uses the same Gmail account and nodemailer setup as the other CU Apts emails
 * (`CUAPTS_EMAIL` and `CUAPTS_EMAIL_APP_PASSWORD`).
 *
 * @param {string} to – The invited person's Cornell email.
 * @param {string} inviterName – The name of the person who sent the invite.
 * @param {string} folderName – The name of the shared folder.
 * @param {string} inviteId – The invite's ID, used in the accept/decline link.
 * @returns {Promise<void>} – Resolves once the email is sent, and rejects if it can't be sent.
 */
export const sendFolderInviteEmail = async (
  to: string,
  inviterName: string,
  folderName: string,
  inviteId: string
): Promise<void> => {
  const cuaptsEmail = process.env.CUAPTS_EMAIL;
  const cuaptsEmailPassword = process.env.CUAPTS_EMAIL_APP_PASSWORD;
  if (!cuaptsEmail || !cuaptsEmailPassword) {
    throw new Error('Host email or password not found');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'login',
      user: cuaptsEmail,
      pass: cuaptsEmailPassword,
    },
  });

  await transporter.sendMail({
    from: { name: 'The CUApts Team', address: cuaptsEmail },
    to,
    ...buildInviteEmail(inviterName, folderName, inviteId),
  });
};

/**
 * inviteRateLimiter – Limits how many invites one owner can send per hour.
 *
 * @remarks
 * Runs after `authenticate` and counts invites per signed-in user, not per IP. Only invites that
 * go through count, so a mistyped NetID doesn't use up the limit. Counts are kept in memory and
 * reset when the server restarts.
 */
export const inviteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: INVITES_PER_HOUR,
  keyGenerator: (req: Request) => req.user?.uid ?? req.ip ?? 'unknown',
  skipFailedRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res
      .status(429)
      .send(`You can send up to ${INVITES_PER_HOUR} invites per hour. Please try again later.`);
  },
});
