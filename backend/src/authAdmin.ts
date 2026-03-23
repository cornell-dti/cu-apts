import { RequestHandler } from 'express';
import { auth , db } from './firebase-config';
import { admins } from '../../frontend/src/constants/HomeConsts';

const adminWhitelistCollection = db.collection('adminWhitelist');

/**
 * Checks whether an email is a recognized admin.
 *
 * @remarks
 * Returns true if the email is in the hardcoded `admins` array (superadmins)
 * OR in the Firestore `adminWhitelist` collection (dynamically added admins).
 *
 * @param {string} email – The email address to check.
 * @returns {Promise<boolean>} – Whether the email has admin privileges.
 */
export const isAdminEmail = async (email: string): Promise<boolean> => {
  if (admins.includes(email)) return true;
  const snapshot = await adminWhitelistCollection.where('email', '==', email).limit(1).get();
  return !snapshot.empty;
};

/**
 * Middleware to authenticate admin API requests.
 *
 * @remarks
 * Extends the base `authenticate` middleware by additionally verifying that the
 * requesting user is a recognized admin (either hardcoded superadmin or in
 * Firestore `adminWhitelist`).
 *
 * @returns 401 if token is invalid, 403 if user is not an admin, otherwise calls next.
 */
const authenticateAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      res.status(401).send({ error: 'Header not found' });
      return;
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
      res.status(401).send({ error: 'Invalid token syntax' });
      return;
    }

    const user = await auth.verifyIdToken(token);

    if (!user.email?.endsWith('@cornell.edu')) {
      res.status(401).send({ error: 'Invalid domain' });
      return;
    }

    const adminStatus = await isAdminEmail(user.email);
    if (!adminStatus) {
      res.status(403).send({ error: 'Not authorized' });
      return;
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Authentication Error' });
  }
};

export default authenticateAdmin;
