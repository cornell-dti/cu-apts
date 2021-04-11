import admin from 'firebase-admin';

declare global {
  namespace Express {
    interface Request {
      users?: admin.auth.DecodedIdToken;
    }
  }
}
