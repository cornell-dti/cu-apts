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
 * The most collaborators a folder can have, counting members and pending invites (not the owner).
 */
export const COLLABORATOR_LIMIT = 10;

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
 * InviteEmailDetails – Everything that goes into a folder invite email.
 */
export type InviteEmailDetails = {
  inviterName: string; // the name of the person who sent the invite
  folderName: string;
  inviteId: string; // used in the link back to CU Apts
  inviteeEmail: string; // the invited person's Cornell email
  apartmentCount: number;
  peopleCount: number; // the owner plus current members
};

/**
 * countLabel – Writes a count with the right word, like "1 apartment" or "3 apartments".
 *
 * @param {number} count – The number to write.
 * @param {string} one – The word to use when the count is 1.
 * @param {string} many – The word to use for any other count.
 * @returns {string} – The count followed by the word.
 */
const countLabel = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

/**
 * buildInviteEmail – Builds the subject and body of a folder invite email.
 *
 * @remarks
 * Follows the invite email in the Shared Folders Figma: who shared the folder, a card with the
 * folder's name and size, an OPEN FOLDER button, and which email the invite was sent to. Names
 * are typed by users, so they are escaped before they go into the HTML. Styles are inline and the
 * layout uses tables because many email apps ignore style tags.
 *
 * @param {InviteEmailDetails} details – The inviter, folder, and invite to describe.
 * @returns {{ subject: string, text: string, html: string }} – The email's subject and body.
 */
export const buildInviteEmail = ({
  inviterName,
  folderName,
  inviteId,
  inviteeEmail,
  apartmentCount,
  peopleCount,
}: InviteEmailDetails): { subject: string; text: string; html: string } => {
  const link = `${CUAPTS_URL}/folder-invite/${encodeURIComponent(inviteId)}`;
  const folderDetails = `${countLabel(apartmentCount, 'apartment', 'apartments')} · ${countLabel(
    peopleCount,
    'person',
    'people'
  )}`;
  const inviter = escapeHtml(inviterName);
  const folder = escapeHtml(folderName);
  const recipient = escapeHtml(inviteeEmail);

  return {
    subject: `[CUApts] ${inviterName} shared a folder with you`,
    text: [
      `${inviterName} shared a folder with you on CUApts.`,
      `View "${folderName}" (${folderDetails}) and start adding listings together: ${link}`,
      `Sign in with your Cornell email to join. This invitation was sent to ${inviteeEmail}.`,
    ].join('\n\n'),
    html: `<div style="background:#f9f9f9;padding:24px 8px;font-family:'Work Sans',Arial,sans-serif;">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e8e8e8;border-radius:12px;">
<tr><td style="padding:24px 32px 0;font-size:22px;font-weight:700;color:#b94630;">CUApts</td></tr>
<tr><td align="center" style="padding:16px 32px 32px;text-align:center;">
<div style="width:72px;height:72px;line-height:72px;border-radius:36px;background:#fff6f6;font-size:32px;">&#128193;</div>
<p style="margin:20px 0 0;font-size:20px;line-height:28px;font-weight:600;color:#000000;">${inviter} shared a folder with you</p>
<p style="margin:20px 0 0;font-size:16px;line-height:24px;color:#5d5d5d;">View &ldquo;${folder}&rdquo; and start adding listings together.</p>
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="width:100%;max-width:360px;margin-top:20px;background:#f9f9f9;border-radius:8px;">
<tr><td style="padding:12px 16px;text-align:left;">
<p style="margin:0;font-size:14px;line-height:20px;font-weight:600;color:#000000;">&#128193;&nbsp; ${folder}</p>
<p style="margin:2px 0 0;font-size:12px;line-height:16px;color:#5d5d5d;">${folderDetails}</p>
</td></tr>
</table>
<a href="${link}" style="display:inline-block;margin-top:20px;padding:10px 15px;border-radius:25px;background:#b94630;color:#ffffff;font-size:15px;line-height:20px;font-weight:600;text-decoration:none;">OPEN FOLDER</a>
<p style="margin:20px 0 0;font-size:12px;line-height:16px;color:#898989;">Sign in with your Cornell email to join. This invitation was sent to ${recipient}.</p>
</td></tr>
<tr><td style="border-top:1px solid #e8e8e8;padding:12px 24px;font-size:12px;line-height:16px;color:#898989;">You&rsquo;re receiving this because someone invited you to a CUApts folder.</td></tr>
</table>
</div>`,
  };
};

/**
 * sendFolderInviteEmail – Emails an invite to the person who was invited to a folder.
 *
 * @remarks
 * Uses the same Gmail account and nodemailer setup as the other CU Apts emails
 * (`CUAPTS_EMAIL` and `CUAPTS_EMAIL_APP_PASSWORD`).
 *
 * @param {InviteEmailDetails} details – The inviter, folder, and invite. The email goes to
 * `details.inviteeEmail`.
 * @returns {Promise<void>} – Resolves once the email is sent, and rejects if it can't be sent.
 */
export const sendFolderInviteEmail = async (details: InviteEmailDetails): Promise<void> => {
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
    to: details.inviteeEmail,
    ...buildInviteEmail(details),
  });
};

/**
 * FolderPerson – Someone shown in a folder's collaborator list.
 */
export type FolderPerson = {
  id: string; // user ID
  name: string;
  email: string;
};

/**
 * getPeople – Looks up the names and emails of CU Apts users.
 *
 * @remarks
 * Folders only store user IDs, so the collaborator list uses this to show who each person is.
 * Someone whose account can't be found (for example, it was deleted) still comes back with a
 * placeholder name, so the owner can still remove them.
 *
 * @param {string[]} uids – The user IDs to look up (at most 100, which Firebase allows per call).
 * @returns {Promise<FolderPerson[]>} – One entry per user ID, in the same order.
 */
export const getPeople = async (uids: string[]): Promise<FolderPerson[]> => {
  if (uids.length === 0) return [];
  const { users } = await auth.getUsers(uids.map((uid) => ({ uid })));
  return uids.map((uid) => {
    const user = users.find((record) => record.uid === uid);
    const email = user?.email ?? '';
    return { id: uid, name: user?.displayName || email || 'CU Apts user', email };
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
